const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requirePastor } = require('../middleware/authMiddleware');
const { validateChurch } = require('../validators/churchValidator');
const { validateEvent } = require('../validators/eventValidator');
const { enrichEventsWithStatus, enrichEventWithStatus } = require('../utils/eventStatus');
const { notifyEventInterested } = require('../services/pushService');

router.use(verifyToken);
// TODO: check if user is validated too (status === 'VALIDATED') - Good practice but simplified for now as per plan
router.use(requirePastor);

// --- EGLISE ---

// Récupérer mon église
router.get('/my-church', async (req, res) => {
    try {
        const [churches] = await db.query(
            `SELECT id, church_name, denomination_id, ST_X(location) as longitude, ST_Y(location) as latitude
       FROM churches
       WHERE admin_id = ?`,
            [req.user.id]
        );

        if (churches.length === 0) {
            return res.status(404).json({ message: 'Aucune église associée' });
        }

        const church = churches[0];

        // Récupérer les détails
        const [details] = await db.query('SELECT * FROM church_details WHERE church_id = ?', [church.id]);
        const [socials] = await db.query('SELECT * FROM church_socials WHERE church_id = ?', [church.id]);
        const [schedules] = await db.query('SELECT * FROM church_schedules WHERE church_id = ?', [church.id]);

        // Récupérer allow_network_visibility de l'admin
        const adminResult = await db.query('SELECT allow_network_visibility FROM admins WHERE id = ?', [req.user.id]);
        const adminData = adminResult && adminResult[0] ? adminResult[0] : [];

        res.json({
            ...church,
            details: details[0] || {},
            socials: socials || [],
            schedules: schedules || [],
            allow_network_visibility: adminData[0]?.allow_network_visibility || false
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Créer ou Mettre à jour mon église (Complete)
router.post('/my-church', validateChurch, async (req, res) => {
    const {
        church_name, latitude, longitude, denomination_id,
        // Details
        description, address, street_number, street_name, postal_code, city, phone, website, pastor_first_name, pastor_last_name, has_parking, parking_capacity, is_parking_free, logo_url,
        // Relations
        socials, // Array of { platform, url }
        schedules, // Array of { day_of_week, start_time, activity_type_id }
        // Network visibility
        allow_network_visibility
    } = req.body;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Get or Create Church
        const [existingChurches] = await connection.query('SELECT id FROM churches WHERE admin_id = ?', [req.user.id]);
        let churchId;

        if (existingChurches.length > 0) {
            churchId = existingChurches[0].id;
            await connection.query(
                `UPDATE churches 
                 SET church_name = ?, location = ST_GeomFromText(?), denomination_id = ? 
                 WHERE id = ?`,
                [church_name, `POINT(${longitude} ${latitude})`, denomination_id, churchId]
            );
        } else {
            const [result] = await connection.query(
                `INSERT INTO churches (admin_id, denomination_id, church_name, location) 
                 VALUES (?, ?, ?, ST_GeomFromText(?))`,
                [req.user.id, denomination_id, church_name, `POINT(${longitude} ${latitude})`]
            );
            churchId = result.insertId;
        }

        // 2. Upsert Details
        const [existingDetails] = await connection.query('SELECT church_id FROM church_details WHERE church_id = ?', [churchId]);
        // Default language to 10 (French) if not provided
        const langId = 10;
        const detailParams = [
            description || null, address || null, street_number || null, street_name || null,
            postal_code || null, city || null, phone || null, website || null,
            pastor_first_name || null, pastor_last_name || null, has_parking ? 1 : 0, parking_capacity || null, is_parking_free ? 1 : 0,
            langId, logo_url || null
        ];

        if (existingDetails.length > 0) {
            await connection.query(
                `UPDATE church_details
                 SET description=?, address=?, street_number=?, street_name=?, postal_code=?, city=?, phone=?, website=?, pastor_first_name=?, pastor_last_name=?, has_parking=?, parking_capacity=?, is_parking_free=?, language_id=?, logo_url=?
                 WHERE church_id=?`,
                [...detailParams, churchId]
            );
        } else {
            await connection.query(
                `INSERT INTO church_details
                 (description, address, street_number, street_name, postal_code, city, phone, website, pastor_first_name, pastor_last_name, has_parking, parking_capacity, is_parking_free, language_id, logo_url, church_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [...detailParams, churchId]
            );
        }

        // 3. Handle Socials (Delete All -> Insert New)
        await connection.query('DELETE FROM church_socials WHERE church_id = ?', [churchId]);
        if (socials && Array.isArray(socials) && socials.length > 0) {
            const socialValues = socials.map(s => [churchId, s.platform, s.url]);
            await connection.query(
                'INSERT INTO church_socials (church_id, platform, url) VALUES ?',
                [socialValues]
            );
        }

        // 4. Handle Schedules (Delete All -> Insert New)
        await connection.query('DELETE FROM church_schedules WHERE church_id = ?', [churchId]);
        if (schedules && Array.isArray(schedules) && schedules.length > 0) {
            const scheduleValues = schedules.map(s => [churchId, s.activity_type_id, s.day_of_week, s.start_time]);
            await connection.query(
                'INSERT INTO church_schedules (church_id, activity_type_id, day_of_week, start_time) VALUES ?',
                [scheduleValues]
            );
        }

        // 5. Update allow_network_visibility in admins table
        if (allow_network_visibility !== undefined) {
            await connection.query(
                'UPDATE admins SET allow_network_visibility = ? WHERE id = ?',
                [allow_network_visibility ? 1 : 0, req.user.id]
            );
        }

        await connection.commit();
        res.json({ message: 'Église sauvegardée avec succès', churchId });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur lors de la sauvegarde' });
    } finally {
        connection.release();
    }
});

// --- EVENEMENTS ---

// Lister mes événements
router.get('/my-events', async (req, res) => {
    try {
        const status = req.query.status || ''; // UPCOMING, ONGOING, COMPLETED, CANCELLED, ALL

        // Construction dynamique de la clause WHERE
        let whereClause = 'WHERE e.admin_id = ?';
        const params = [req.user.id];

        // ✅ Filtrage par statut avec conditions SQL dynamiques (basées sur les dates)
        // Le statut n'est pas stocké en base mais calculé via NOW() pour garder le comportement dynamique
        if (status && status !== 'ALL') {
            switch (status) {
                case 'UPCOMING':
                    // À venir : non annulé ET date de début dans le futur
                    whereClause += ' AND e.cancelled_at IS NULL AND NOW() < e.start_datetime';
                    break;
                case 'ONGOING':
                    // En cours : non annulé ET entre date début et date fin
                    whereClause += ' AND e.cancelled_at IS NULL AND NOW() >= e.start_datetime AND NOW() <= e.end_datetime';
                    break;
                case 'COMPLETED':
                    // Terminé : non annulé ET date de fin dépassée
                    whereClause += ' AND e.cancelled_at IS NULL AND NOW() > e.end_datetime';
                    break;
                case 'CANCELLED':
                    // Annulé : cancelled_at non null
                    whereClause += ' AND e.cancelled_at IS NOT NULL';
                    break;
            }
        }

        const [events] = await db.query(
            `SELECT e.id, e.title, e.start_datetime, e.end_datetime,
                    e.cancelled_at, e.cancellation_reason, e.cancelled_by,
                    e.created_at, e.updated_at,
                    COALESCE(e.interested_count, 0) as interested_count,
                    ed.address, ed.street_number, ed.street_name, ed.postal_code, ed.city,
                    ed.description, ed.image_url
             FROM events e
             LEFT JOIN event_details ed ON e.id = ed.event_id
             ${whereClause}
             ORDER BY e.start_datetime DESC`,
            params
        );
        // Enrich events with computed status
        const enrichedEvents = enrichEventsWithStatus(events);
        res.json(enrichedEvents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Créer un événement
router.post('/events', validateEvent, async (req, res) => {

    const {
        title, start_datetime, end_datetime, latitude, longitude, church_id, language_id,
        // Detailed fields
        description, address, street_number, street_name, postal_code, city, speaker_name, max_seats, image_url,
        is_free, registration_link, youtube_live,
        has_parking, parking_capacity, is_parking_free, parking_details,
        // Translation languages
        translation_language_ids
    } = req.body;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Create Event
        const [result] = await connection.query(
            `INSERT INTO events (admin_id, church_id, title, start_datetime, end_datetime, event_location, language_id)
             VALUES (?, ?, ?, ?, ?, ST_GeomFromText(?), ?)`,
            [req.user.id, church_id || null, title, start_datetime, end_datetime, `POINT(${longitude} ${latitude})`, language_id || 10]
        );

        const eventId = result.insertId;

        // 2. Create Details
        await connection.query(
            `INSERT INTO event_details
             (event_id, description, address, street_number, street_name, postal_code, city, speaker_name, max_seats, image_url,
              is_free, registration_link, youtube_live,
              has_parking, parking_capacity, is_parking_free, parking_details)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                eventId,
                description || null,
                address || null,
                street_number || null,
                street_name || null,
                postal_code || null,
                city || null,
                speaker_name || null,
                max_seats || null,
                image_url || null,
                is_free ? 1 : 0,
                registration_link || null,
                youtube_live || null,
                has_parking ? 1 : 0,
                parking_capacity || null,
                is_parking_free ? 1 : 0,
                parking_details || null
            ]
        );

        // 3. Insert translations if present
        if (translation_language_ids && Array.isArray(translation_language_ids) && translation_language_ids.length > 0) {
            const translationValues = translation_language_ids.map(langId => [eventId, langId]);
            await connection.query('INSERT INTO event_translations (event_id, language_id) VALUES ?', [translationValues]);
        }

        await connection.commit();
        res.status(201).json({ message: 'Événement créé avec succès', eventId });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur lors de la création de l\'événement' });
    } finally {
        connection.release();
    }
});

// Récupérer un événement spécifique (pour édition)
router.get('/events/:id', async (req, res) => {
    try {
        const [events] = await db.query(
            `SELECT * FROM events WHERE id = ? AND admin_id = ?`,
            [req.params.id, req.user.id]
        );

        if (events.length === 0) {
            return res.status(404).json({ message: 'Événement non trouvé ou non autorisé' });
        }

        const [details] = await db.query('SELECT * FROM event_details WHERE event_id = ?', [req.params.id]);

        const [translations] = await db.query(
            'SELECT language_id FROM event_translations WHERE event_id = ?',
            [req.params.id]
        );

        const eventData = {
            ...events[0],
            ...details[0],
            translation_language_ids: translations.map(t => t.language_id)
        };

        // Enrich with computed status
        const enrichedEvent = enrichEventWithStatus(eventData);
        res.json(enrichedEvent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Annuler un événement avec motif
router.post('/events/:id/cancel', async (req, res) => {
    const eventId = req.params.id;
    const { cancellation_reason } = req.body;

    // Validate cancellation reason
    if (!cancellation_reason || cancellation_reason.trim().length < 10) {
        return res.status(400).json({ message: 'Le motif d\'annulation est obligatoire et doit contenir au moins 10 caractères' });
    }

    try {
        // Check ownership and current status
        const [events] = await db.query(
            'SELECT start_datetime, end_datetime, cancelled_at FROM events WHERE id = ? AND admin_id = ?',
            [eventId, req.user.id]
        );

        if (events.length === 0) {
            return res.status(403).json({ message: 'Non autorisé' });
        }

        const event = events[0];

        // Check if already cancelled
        if (event.cancelled_at) {
            return res.status(400).json({ message: 'Cet événement est déjà annulé' });
        }

        // Check if event is UPCOMING (only allow cancellation before event starts)
        const now = new Date();
        const startDate = new Date(event.start_datetime);
        const endDate = new Date(event.end_datetime);

        if (now >= startDate && now <= endDate) {
            return res.status(400).json({ message: 'Impossible d\'annuler un événement en cours' });
        }

        if (now > endDate) {
            return res.status(400).json({ message: 'Impossible d\'annuler un événement déjà terminé' });
        }

        // Cancel the event
        await db.query(
            'UPDATE events SET cancelled_at = NOW(), cancellation_reason = ?, cancelled_by = ? WHERE id = ?',
            [cancellation_reason.trim(), req.user.id, eventId]
        );

        // ✅ Envoyer notification d'annulation aux utilisateurs intéressés
        notifyEventInterested(eventId, 'cancelled', {
            reason: cancellation_reason.trim()
        }).catch(err => {
            console.error('Erreur envoi notification annulation événement:', err);
        });

        res.json({
            message: 'Événement annulé avec succès',
            cancellation_reason: cancellation_reason.trim()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur lors de l\'annulation de l\'événement' });
    }
});

// Réactiver un événement annulé
router.post('/events/:id/reactivate', async (req, res) => {
    const eventId = req.params.id;

    try {
        // Check ownership and current status
        const [events] = await db.query(
            'SELECT start_datetime, end_datetime, cancelled_at FROM events WHERE id = ? AND admin_id = ?',
            [eventId, req.user.id]
        );

        if (events.length === 0) {
            return res.status(403).json({ message: 'Non autorisé' });
        }

        const event = events[0];

        // Check if event is cancelled
        if (!event.cancelled_at) {
            return res.status(400).json({ message: 'Cet événement n\'est pas annulé' });
        }

        // Check if event is not already completed
        const now = new Date();
        const endDate = new Date(event.end_datetime);
        if (now > endDate) {
            return res.status(400).json({ message: 'Impossible de réactiver un événement déjà terminé' });
        }

        // Reactivate the event by clearing cancellation fields
        await db.query(
            'UPDATE events SET cancelled_at = NULL, cancellation_reason = NULL, cancelled_by = NULL WHERE id = ?',
            [eventId]
        );

        res.json({
            message: 'Événement réactivé avec succès'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur lors de la réactivation de l\'événement' });
    }
});

// Mettre à jour un événement
router.put('/events/:id', validateEvent, async (req, res) => {
    const eventId = req.params.id;
    const {
        title, start_datetime, end_datetime, latitude, longitude, language_id,
        description, address, street_number, street_name, postal_code, city, speaker_name, max_seats, image_url,
        is_free, registration_link, youtube_live,
        has_parking, parking_capacity, is_parking_free, parking_details,
        translation_language_ids
    } = req.body;
    // Note: status is NOT included as it's computed automatically based on dates

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Check ownership and event dates
        const [event] = await connection.query(
            'SELECT id, start_datetime, end_datetime, cancelled_at FROM events WHERE id = ? AND admin_id = ?',
            [eventId, req.user.id]
        );

        if (event.length === 0) {
            await connection.rollback(); // Good practice to rollback even if no write was done
            return res.status(403).json({ message: 'Non autorisé' });
        }

        // 2. Check if event is COMPLETED or CANCELLED after completion (cannot modify)
        const now = new Date();
        const endDate = new Date(event[0].end_datetime);
        if (now > endDate) {
            await connection.rollback();
            return res.status(400).json({ message: 'Impossible de modifier un événement terminé' });
        }

        // Also check if event is CANCELLED (cancelled events cannot be modified, only reactivated)
        if (event[0].cancelled_at) {
            await connection.rollback();
            return res.status(400).json({ message: 'Impossible de modifier un événement annulé. Veuillez d\'abord le réactiver.' });
        }

        // 3. Update Event Core (excluding status - it's computed automatically)
        if (title || start_datetime || end_datetime || (latitude && longitude) || language_id) {
            let updateQuery = 'UPDATE events SET ';
            const updateParams = [];

            if (title) { updateQuery += 'title = ?, '; updateParams.push(title); }
            if (start_datetime) { updateQuery += 'start_datetime = ?, '; updateParams.push(start_datetime); }
            if (end_datetime) { updateQuery += 'end_datetime = ?, '; updateParams.push(end_datetime); }
            if (latitude && longitude) { updateQuery += 'event_location = ST_GeomFromText(?), '; updateParams.push(`POINT(${longitude} ${latitude})`); }
            if (language_id) { updateQuery += 'language_id = ?, '; updateParams.push(language_id); }

            // Remove trailing comma
            updateQuery = updateQuery.slice(0, -2);
            updateQuery += ' WHERE id = ?';
            updateParams.push(eventId);

            await connection.query(updateQuery, updateParams);
        }

        // 4. Update Details
        // Check if details exist first (normally they should)
        const [existingDetails] = await connection.query('SELECT event_id FROM event_details WHERE event_id = ?', [eventId]);

        const detailParams = [
            description || null, address || null, street_number || null, street_name || null, postal_code || null, city || null,
            speaker_name || null, max_seats || null, image_url || null,
            is_free ? 1 : 0, registration_link || null, youtube_live || null,
            has_parking ? 1 : 0, parking_capacity || null, is_parking_free ? 1 : 0, parking_details || null,
            eventId
        ];

        if (existingDetails.length > 0) {
            await connection.query(
                `UPDATE event_details
                 SET description=?, address=?, street_number=?, street_name=?, postal_code=?, city=?,
                     speaker_name=?, max_seats=?, image_url=?,
                     is_free=?, registration_link=?, youtube_live=?,
                     has_parking=?, parking_capacity=?, is_parking_free=?, parking_details=?
                 WHERE event_id=?`,
                detailParams
            );
        } else {
            // Handle case where details might be missing (insert instead)
            await connection.query(
                `INSERT INTO event_details
                 (description, address, street_number, street_name, postal_code, city, speaker_name, max_seats, image_url, is_free, registration_link, youtube_live, has_parking, parking_capacity, is_parking_free, parking_details, event_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                detailParams
            );
        }

        // 5. Update translations
        await connection.query('DELETE FROM event_translations WHERE event_id = ?', [eventId]);
        if (translation_language_ids && Array.isArray(translation_language_ids) && translation_language_ids.length > 0) {
            const translationValues = translation_language_ids.map(langId => [eventId, langId]);
            await connection.query('INSERT INTO event_translations (event_id, language_id) VALUES ?', [translationValues]);
        }

        await connection.commit();

        // ✅ Envoyer notification aux utilisateurs intéressés
        // (asynchrone, ne pas bloquer la réponse)
        notifyEventInterested(eventId, 'modified').catch(err => {
            console.error('Erreur envoi notification modification événement:', err);
        });

        res.json({ message: 'Événement mis à jour avec succès' });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur lors de la mise à jour' });
    } finally {
        connection.release();
    }
});

module.exports = router;

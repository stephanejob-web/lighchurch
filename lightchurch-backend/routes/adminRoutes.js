const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requireSuperAdmin } = require('../middleware/authMiddleware');
const { enrichEventsWithStatus, enrichEventWithStatus } = require('../utils/eventStatus');

router.use(verifyToken);
router.use(requireSuperAdmin);

// --- UTILISATEURS ---

// Lister tous les utilisateurs validés (VALIDATED + SUSPENDED)
router.get('/users', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const roleFilter = req.query.role || '';

        // Build WHERE clause - IMPORTANT: Utilisateurs validés (actifs ou suspendus)
        // Les comptes PENDING et REJECTED restent dans "Demandes d'inscription"
        let whereClause = 'WHERE a.status IN ("VALIDATED", "SUSPENDED")';
        const params = [];

        // Filter by Role
        if (roleFilter && roleFilter !== 'ALL') {
            whereClause += ' AND a.role = ?';
            params.push(roleFilter);
        }

        // Filter by Search (Name or Email)
        if (search) {
            whereClause += ' AND (a.first_name LIKE ? OR a.last_name LIKE ? OR a.email LIKE ?)';
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        // Get total count
        const [countResult] = await db.query(
            `SELECT COUNT(*) as total FROM admins a ${whereClause}`,
            params
        );
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // Get paginated results with church info for pastors
        const [users] = await db.query(
            `SELECT a.id, a.first_name, a.last_name, a.email, a.role, a.status, a.created_at,
                    c.id as church_id, c.church_name
             FROM admins a
             LEFT JOIN churches c ON a.id = c.admin_id
             ${whereClause}
             ORDER BY a.created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        res.json({
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Lister uniquement les pending (pour compatibilité ou dashboard)
router.get('/pending-users', async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, first_name, last_name, email, role, created_at FROM admins WHERE status = "PENDING"'
        );
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Modifier un utilisateur
router.put('/users/:id', async (req, res) => {
    const { status, role } = req.body;
    const targetUserId = parseInt(req.params.id);

    try {
        // Protection: Empêcher de modifier son propre compte
        if (req.user.id === targetUserId) {
            return res.status(403).json({ message: 'Vous ne pouvez pas modifier votre propre compte' });
        }

        let updateQuery = 'UPDATE admins SET ';
        const updateParams = [];

        if (status) { updateQuery += 'status = ?, '; updateParams.push(status); }
        if (role) { updateQuery += 'role = ?, '; updateParams.push(role); }

        if (updateParams.length === 0) {
            return res.status(400).json({ message: 'Aucun champ à modifier' });
        }

        updateQuery = updateQuery.slice(0, -2); // Remove trailing comma
        updateQuery += ' WHERE id = ?';
        updateParams.push(req.params.id);

        await db.query(updateQuery, updateParams);
        res.json({ message: 'Utilisateur mis à jour' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Supprimer un utilisateur
router.delete('/users/:id', async (req, res) => {
    const targetUserId = parseInt(req.params.id);

    try {
        // Protection: Empêcher de supprimer son propre compte
        if (req.user.id === targetUserId) {
            return res.status(403).json({ message: 'Vous ne pouvez pas supprimer votre propre compte' });
        }

        await db.query('DELETE FROM admins WHERE id = ?', [req.params.id]);
        res.json({ message: 'Utilisateur supprimé' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// --- EGLISES ---

// Lister toutes les églises (avec pagination, recherche, filtres)
router.get('/churches', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const denominationFilter = req.query.denomination || '';
        const cityFilter = req.query.city || '';

        // Build WHERE clause
        let whereClause = 'WHERE 1=1';
        const params = [];

        // Filter by Denomination
        if (denominationFilter && denominationFilter !== 'ALL') {
            whereClause += ' AND c.denomination_id = ?';
            params.push(denominationFilter);
        }

        // Filter by City
        if (cityFilter && cityFilter !== 'ALL') {
            whereClause += ' AND cd.city = ?';
            params.push(cityFilter);
        }

        // Filter by Search (Church Name, City, Pastor Name)
        if (search) {
            whereClause += ' AND (c.church_name LIKE ? OR cd.city LIKE ? OR a.first_name LIKE ? OR a.last_name LIKE ?)';
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam, searchParam);
        }

        // Get total count
        const [countResult] = await db.query(
            `SELECT COUNT(*) as total
             FROM churches c
             JOIN admins a ON c.admin_id = a.id
             JOIN denominations d ON c.denomination_id = d.id
             LEFT JOIN church_details cd ON c.id = cd.church_id
             ${whereClause}`,
            params
        );
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // Get paginated results with city
        const [churches] = await db.query(
            `SELECT c.id, c.church_name, d.name as denomination, d.id as denomination_id,
                    a.first_name, a.last_name, c.created_at, cd.city
             FROM churches c
             JOIN admins a ON c.admin_id = a.id
             JOIN denominations d ON c.denomination_id = d.id
             LEFT JOIN church_details cd ON c.id = cd.church_id
             ${whereClause}
             ORDER BY c.created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        res.json({
            churches,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Lister toutes les villes disponibles (pour le filtre)
router.get('/cities', async (req, res) => {
    try {
        const [cities] = await db.query(
            `SELECT DISTINCT city
             FROM church_details
             WHERE city IS NOT NULL AND city != ''
             ORDER BY city ASC`
        );
        res.json(cities.map(c => c.city));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Récupérer une église complète (Admin)
router.get('/churches/:id', async (req, res) => {
    try {
        const [churches] = await db.query(
            `SELECT id, church_name, admin_id, denomination_id, ST_X(location) as longitude, ST_Y(location) as latitude 
             FROM churches WHERE id = ?`,
            [req.params.id]
        );

        if (churches.length === 0) return res.status(404).json({ message: 'Église non trouvée' });
        const church = churches[0];

        const [details] = await db.query('SELECT * FROM church_details WHERE church_id = ?', [church.id]);
        const [socials] = await db.query('SELECT * FROM church_socials WHERE church_id = ?', [church.id]);
        const [schedules] = await db.query('SELECT * FROM church_schedules WHERE church_id = ?', [church.id]);
        const [events] = await db.query(
            `SELECT e.id, e.title, e.start_datetime, e.end_datetime,
                    e.cancelled_at, e.cancellation_reason, e.cancelled_by,
                    e.created_at, e.updated_at,
                    ed.description
             FROM events e
             LEFT JOIN event_details ed ON e.id = ed.event_id
             WHERE e.church_id = ?
             ORDER BY e.start_datetime DESC`,
            [church.id]
        );

        // Enrich events with computed status
        const enrichedEvents = enrichEventsWithStatus(events);

        res.json({
            ...church,
            details: details[0] || {},
            socials: socials || [],
            schedules: schedules || [],
            events: enrichedEvents || []
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Mettre à jour une église (Admin)
router.put('/churches/:id', async (req, res) => {
    const churchId = req.params.id;
    const {
        church_name, latitude, longitude, denomination_id,
        description, address, street_number, street_name, postal_code, city,
        phone, website, pastor_first_name, pastor_last_name, has_parking, parking_capacity, is_parking_free, logo_url,
        socials, schedules
    } = req.body;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Update Church Basic Info
        await connection.query(
            `UPDATE churches
             SET church_name = ?, location = ST_GeomFromText(?), denomination_id = ?
             WHERE id = ?`,
            [church_name, `POINT(${longitude} ${latitude})`, denomination_id, churchId]
        );

        // 2. Update Details (avec les nouveaux champs d'adresse)
        const [existingDetails] = await connection.query('SELECT church_id FROM church_details WHERE church_id = ?', [churchId]);
        const langId = 10; // Default to French
        const detailParams = [
            description || null,
            address || null,
            street_number || null,
            street_name || null,
            postal_code || null,
            city || null,
            phone || null,
            website || null,
            pastor_first_name || null,
            pastor_last_name || null,
            has_parking ? 1 : 0,
            parking_capacity || null,
            is_parking_free ? 1 : 0,
            logo_url || null,
            langId
        ];

        if (existingDetails.length > 0) {
            await connection.query(
                `UPDATE church_details
                 SET description=?, address=?, street_number=?, street_name=?, postal_code=?, city=?,
                     phone=?, website=?, pastor_first_name=?, pastor_last_name=?, has_parking=?, parking_capacity=?, is_parking_free=?, logo_url=?, language_id=?
                 WHERE church_id=?`,
                [...detailParams, churchId]
            );
        } else {
            await connection.query(
                `INSERT INTO church_details
                 (description, address, street_number, street_name, postal_code, city, phone, website, pastor_first_name, pastor_last_name, has_parking, parking_capacity, is_parking_free, logo_url, language_id, church_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [...detailParams, churchId]
            );
        }

        // 3. Update Socials (Replace)
        await connection.query('DELETE FROM church_socials WHERE church_id = ?', [churchId]);
        if (socials && Array.isArray(socials) && socials.length > 0) {
            const socialValues = socials.map(s => [churchId, s.platform, s.url]);
            await connection.query('INSERT INTO church_socials (church_id, platform, url) VALUES ?', [socialValues]);
        }

        // 4. Update Schedules (Replace)
        await connection.query('DELETE FROM church_schedules WHERE church_id = ?', [churchId]);
        if (schedules && Array.isArray(schedules) && schedules.length > 0) {
            const scheduleValues = schedules.map(s => [churchId, s.activity_type_id, s.day_of_week, s.start_time]);
            await connection.query('INSERT INTO church_schedules (church_id, activity_type_id, day_of_week, start_time) VALUES ?', [scheduleValues]);
        }

        await connection.commit();
        res.json({ message: 'Église mise à jour' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    } finally {
        connection.release();
    }
});

// --- EVENEMENTS ---

// Lister tous les événements (avec pagination, recherche, filtre)
router.get('/events', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const status = req.query.status || ''; // 'PUBLISHED', 'DRAFT', etc.

        // Base Query Logic
        let whereClause = 'WHERE 1=1';
        const params = [];

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

        // Filter by Search (Title, Church Name, Creator Name)
        if (search) {
            whereClause += ' AND (e.title LIKE ? OR c.church_name LIKE ? OR a.first_name LIKE ? OR a.last_name LIKE ?)';
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam, searchParam);
        }

        // 1. Get Total Count (for pagination meta)
        const [countResult] = await db.query(
            `SELECT COUNT(*) as total 
             FROM events e
             LEFT JOIN churches c ON e.church_id = c.id
             LEFT JOIN admins a ON e.admin_id = a.id
             ${whereClause}`,
            params
        );
        const total = countResult[0].total;

        // 2. Get Data
        const [events] = await db.query(
            `SELECT e.id, e.title, e.start_datetime, e.end_datetime,
                    e.cancelled_at, e.cancellation_reason, e.cancelled_by,
                    e.created_at, e.updated_at,
                    c.church_name, a.first_name, a.last_name
             FROM events e
             LEFT JOIN churches c ON e.church_id = c.id
             LEFT JOIN admins a ON e.admin_id = a.id
             ${whereClause}
             ORDER BY e.start_datetime DESC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        // Enrich events with computed status
        const enrichedEvents = enrichEventsWithStatus(events);

        res.json({
            data: enrichedEvents,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Récupérer un événement (Admin)
router.get('/events/:id', async (req, res) => {
    try {
        const [events] = await db.query(
            `SELECT id, title, start_datetime, end_datetime, church_id, language_id,
                    cancelled_at, cancellation_reason, cancelled_by, admin_id,
                    ST_X(event_location) as longitude, ST_Y(event_location) as latitude
             FROM events WHERE id = ?`,
            [req.params.id]
        );
        if (events.length === 0) return res.status(404).json({ message: 'Non trouvé' });

        const [details] = await db.query('SELECT * FROM event_details WHERE event_id = ?', [req.params.id]);

        const [translations] = await db.query(
            'SELECT language_id FROM event_translations WHERE event_id = ?',
            [req.params.id]
        );

        // Flatten details into the main object for easier consumption
        const eventData = { ...events[0] };
        if (details[0]) {
            Object.assign(eventData, details[0]);
        }
        eventData.translation_language_ids = translations.map(t => t.language_id);

        // Enrich with computed status
        const enrichedEvent = enrichEventWithStatus(eventData);

        res.json(enrichedEvent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Modifier un événement (Admin)
router.put('/events/:id', async (req, res) => {
    const {
        title, start_datetime, end_datetime, latitude, longitude, language_id,
        description, address, street_number, street_name, postal_code, city,
        speaker_name, max_seats, image_url, is_free, registration_link,
        youtube_live, has_parking, parking_capacity, is_parking_free, parking_details,
        translation_language_ids
    } = req.body;
    // Note: status is NOT included as it's computed automatically based on dates

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Update events table (excluding status - it's computed automatically)
        let updateQuery = 'UPDATE events SET ';
        const updateParams = [];

        if (title !== undefined) { updateQuery += 'title = ?, '; updateParams.push(title); }
        if (start_datetime !== undefined) { updateQuery += 'start_datetime = ?, '; updateParams.push(start_datetime); }
        if (end_datetime !== undefined) { updateQuery += 'end_datetime = ?, '; updateParams.push(end_datetime); }
        if (latitude !== undefined && longitude !== undefined) {
            updateQuery += 'event_location = ST_GeomFromText(?), ';
            updateParams.push(`POINT(${longitude} ${latitude})`);
        }
        if (language_id !== undefined) { updateQuery += 'language_id = ?, '; updateParams.push(language_id); }

        if (updateParams.length > 0) {
            updateQuery = updateQuery.slice(0, -2); // Remove trailing comma
            updateQuery += ' WHERE id = ?';
            updateParams.push(req.params.id);
            await connection.query(updateQuery, updateParams);
        }

        // Upsert event_details
        const [existing] = await connection.query('SELECT event_id FROM event_details WHERE event_id = ?', [req.params.id]);

        const detailParams = [
            description || null,
            address || null,
            street_number || null,
            street_name || null,
            postal_code || null,
            city || null,
            speaker_name || null,
            max_seats || null,
            image_url || null,
            is_free !== undefined ? (is_free ? 1 : 0) : null,
            registration_link || null,
            youtube_live || null,
            has_parking !== undefined ? (has_parking ? 1 : 0) : null,
            parking_capacity || null,
            is_parking_free !== undefined ? (is_parking_free ? 1 : 0) : null,
            parking_details || null
        ];

        if (existing.length > 0) {
            // Update existing details
            await connection.query(
                `UPDATE event_details SET
                    description = ?, address = ?, street_number = ?, street_name = ?,
                    postal_code = ?, city = ?, speaker_name = ?, max_seats = ?,
                    image_url = ?, is_free = ?, registration_link = ?, youtube_live = ?,
                    has_parking = ?, parking_capacity = ?, is_parking_free = ?, parking_details = ?
                WHERE event_id = ?`,
                [...detailParams, req.params.id]
            );
        } else {
            // Insert new details
            await connection.query(
                `INSERT INTO event_details (
                    event_id, description, address, street_number, street_name,
                    postal_code, city, speaker_name, max_seats, image_url, is_free,
                    registration_link, youtube_live, has_parking, parking_capacity,
                    is_parking_free, parking_details
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [req.params.id, ...detailParams]
            );
        }

        // Update translations
        await connection.query('DELETE FROM event_translations WHERE event_id = ?', [req.params.id]);
        if (translation_language_ids && Array.isArray(translation_language_ids) && translation_language_ids.length > 0) {
            const translationValues = translation_language_ids.map(langId => [req.params.id, langId]);
            await connection.query('INSERT INTO event_translations (event_id, language_id) VALUES ?', [translationValues]);
        }

        await connection.commit();
        res.json({ message: 'Événement mis à jour' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    } finally {
        connection.release();
    }
});

// Supprimer un événement
router.delete('/events/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM events WHERE id = ?', [req.params.id]);
        res.json({ message: 'Événement supprimé' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Réactiver un événement annulé (Admin)
router.post('/events/:id/reactivate', async (req, res) => {
    const eventId = req.params.id;

    try {
        // Récupérer l'événement
        const [events] = await db.query(
            'SELECT start_datetime, end_datetime, cancelled_at FROM events WHERE id = ?',
            [eventId]
        );

        if (events.length === 0) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }

        const event = events[0];

        // Vérifier que l'événement est annulé
        if (!event.cancelled_at) {
            return res.status(400).json({ message: 'Cet événement n\'est pas annulé' });
        }

        // Vérifier que l'événement n'est pas déjà terminé
        const now = new Date();
        const endDate = new Date(event.end_datetime);
        if (now > endDate) {
            return res.status(400).json({ message: 'Impossible de réactiver un événement déjà terminé' });
        }

        // Réactiver l'événement en effaçant les champs d'annulation
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

// Activité événementielle mensuelle (passé + futur)
router.get('/stats/events-monthly', async (req, res) => {
    try {
        const [events] = await db.query(
            `SELECT
                DATE_FORMAT(start_datetime, '%Y-%m') as month,
                COUNT(*) as count,
                CASE
                    WHEN start_datetime >= NOW() THEN 'future'
                    ELSE 'past'
                END as period
             FROM events
             WHERE start_datetime >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
               AND start_datetime <= DATE_ADD(NOW(), INTERVAL 3 MONTH)
             GROUP BY month, period
             ORDER BY month ASC`
        );

        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Stats complètes pour Dashboard Analytics
router.get('/stats', async (req, res) => {
    try {
        // 1. Kpis
        const [kpiUsers] = await db.query('SELECT COUNT(*) as count FROM admins WHERE role != "SUPER_ADMIN"');
        const [kpiPending] = await db.query('SELECT COUNT(*) as count FROM admins WHERE status = "PENDING"');
        const [kpiChurches] = await db.query('SELECT COUNT(*) as count FROM churches');
        const [kpiEvents] = await db.query('SELECT COUNT(*) as count FROM events WHERE start_datetime >= NOW()');

        // 2. Répartition par Dénomination
        const [byDenomination] = await db.query(
            `SELECT d.name, COUNT(c.id) as count 
             FROM churches c 
             JOIN denominations d ON c.denomination_id = d.id 
             GROUP BY d.name`
        );

        // 3. Croissance mensuelle (6 derniers mois) - Simplifié
        // Note: Pour une vraie prod, générer la série de mois vide en code JS si besoin
        const [userGrowth] = await db.query(
            `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count 
             FROM admins 
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
             GROUP BY month 
             ORDER BY month ASC`
        );

        const [churchGrowth] = await db.query(
            `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
             FROM churches
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
             GROUP BY month
             ORDER BY month ASC`
        );

        // 4. Répartition des églises par ville (Top 10)
        const [churchesByCity] = await db.query(
            `SELECT cd.city as name, COUNT(c.id) as count
             FROM churches c
             JOIN church_details cd ON c.id = cd.church_id
             WHERE cd.city IS NOT NULL AND cd.city != ''
             GROUP BY cd.city
             ORDER BY count DESC
             LIMIT 10`
        );

        // 5. État des événements (À venir, En cours, Terminés)
        const now = new Date();
        const [eventsStatus] = await db.query(
            `SELECT
                SUM(CASE WHEN start_datetime > NOW() THEN 1 ELSE 0 END) as upcoming,
                SUM(CASE WHEN start_datetime <= NOW() AND end_datetime >= NOW() THEN 1 ELSE 0 END) as ongoing,
                SUM(CASE WHEN end_datetime < NOW() THEN 1 ELSE 0 END) as completed
             FROM events`
        );

        const eventsStatusData = [
            { name: 'À venir', count: parseInt(eventsStatus[0].upcoming) || 0 },
            { name: 'En cours', count: parseInt(eventsStatus[0].ongoing) || 0 },
            { name: 'Terminés', count: parseInt(eventsStatus[0].completed) || 0 }
        ];

        res.json({
            kpi: {
                total_users: kpiUsers[0].count,
                pending_users: kpiPending[0].count,
                total_churches: kpiChurches[0].count,
                upcoming_events: kpiEvents[0].count
            },
            charts: {
                by_denomination: byDenomination,
                churches_by_city: churchesByCity,
                events_status: eventsStatusData,
                growth: {
                    users: userGrowth,
                    churches: churchGrowth
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// ========================================
// GESTION DES DEMANDES D'INSCRIPTION
// ========================================

// Lister toutes les demandes d'inscription (PENDING + REJECTED)
router.get('/pending-registrations', async (req, res) => {
    try {
        const [registrationRequests] = await db.query(
            `SELECT id, email, first_name, last_name, role, status, document_sirene_path, rejection_reason, created_at
             FROM admins
             WHERE status IN ('PENDING', 'REJECTED')
             ORDER BY
                CASE status
                    WHEN 'PENDING' THEN 1
                    WHEN 'REJECTED' THEN 2
                END,
                created_at DESC`
        );

        res.json(registrationRequests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Lister toutes les demandes (tous statuts)
router.get('/all-registrations', async (req, res) => {
    try {
        const [allAdmins] = await db.query(
            `SELECT id, email, first_name, last_name, role, status, document_sirene_path, rejection_reason, created_at
             FROM admins
             ORDER BY created_at DESC`
        );

        res.json(allAdmins);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Valider une demande d'inscription (PENDING ou REJECTED)
router.post('/validate-registration/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [admin] = await db.query('SELECT * FROM admins WHERE id = ?', [id]);

        if (admin.length === 0) {
            return res.status(404).json({ message: 'Demande non trouvée' });
        }

        if (admin[0].status !== 'PENDING' && admin[0].status !== 'REJECTED') {
            return res.status(400).json({ message: 'Seuls les comptes en attente ou rejetés peuvent être validés' });
        }

        await db.query(
            'UPDATE admins SET status = ?, rejection_reason = NULL WHERE id = ?',
            ['VALIDATED', id]
        );

        res.json({
            message: `Le compte de ${admin[0].first_name} ${admin[0].last_name} a été validé avec succès.`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Rejeter une demande d'inscription
router.post('/reject-registration/:id', async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    try {
        const [admin] = await db.query('SELECT * FROM admins WHERE id = ?', [id]);

        if (admin.length === 0) {
            return res.status(404).json({ message: 'Demande non trouvée' });
        }

        if (admin[0].status !== 'PENDING') {
            return res.status(400).json({ message: 'Cette demande a déjà été traitée' });
        }

        await db.query(
            'UPDATE admins SET status = ?, rejection_reason = ? WHERE id = ?',
            ['REJECTED', reason || 'Document non conforme', id]
        );

        res.json({
            message: `La demande de ${admin[0].first_name} ${admin[0].last_name} a été rejetée.`,
            reason: reason || 'Document non conforme'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;

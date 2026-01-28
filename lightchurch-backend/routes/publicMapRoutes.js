const express = require('express');
const router = express.Router();
const { query, param } = require('express-validator');
const db = require('../config/db');

/**
 * Route publique : GET /api/public/churches
 * Retourne la liste des églises dans une zone visible (bounding box) ou à proximité
 * Query params:
 *   - Bounding Box: north, south, east, west (coordonnées)
 *   - OU Distance: latitude, longitude, radius (km)
 *   - Autres: denomination_id, limit, search
 */

/**
 * Route publique : GET /api/public/stats
 * Retourne les statistiques globales de la plateforme (pour la landing page)
 */
router.get('/stats', async (req, res) => {
    try {
        // Compter les églises (avec admin validé)
        const [churchesResult] = await db.query(`
            SELECT COUNT(c.id) as count 
            FROM churches c 
            INNER JOIN admins a ON a.id = c.admin_id 
            WHERE a.status = 'VALIDATED' AND a.role = 'PASTOR'
        `);

        // Compter les événements à venir (avec admin validé, sans les annulés)
        const [eventsResult] = await db.query(`
            SELECT COUNT(e.id) as count 
            FROM events e 
            INNER JOIN admins a ON a.id = e.admin_id 
            WHERE a.status = 'VALIDATED' 
            AND e.cancelled_at IS NULL
            AND COALESCE(e.end_datetime, e.start_datetime) >= NOW()
        `);

        res.json({
            success: true,
            stats: {
                churches: churchesResult[0].count || 0,
                events: eventsResult[0].count || 0
            }
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du chargement des statistiques'
        });
    }
});

/**
 * Route publique : GET /api/public/churches/markers
 * Version ultra-optimisée pour l'affichage des marqueurs sur la carte
 * Retourne uniquement les données minimales nécessaires (id, nom, coordonnées)
 * PERFORMANCE: ~70-80% de réduction de la taille des données vs /churches
 */
router.get('/churches/markers', [
    query('north').optional().isFloat({ min: -90, max: 90 }),
    query('south').optional().isFloat({ min: -90, max: 90 }),
    query('east').optional().isFloat({ min: -180, max: 180 }),
    query('west').optional().isFloat({ min: -180, max: 180 }),
    query('latitude').optional().isFloat({ min: -90, max: 90 }),
    query('longitude').optional().isFloat({ min: -180, max: 180 }),
    query('radius').optional().isInt({ min: 1, max: 1000 }),
    query('denomination_id').optional().isInt(),
    query('limit').optional().isInt({ min: 1, max: 20000 })
], async (req, res) => {
    const startTime = Date.now();
    
    try {
        const {
            north, south, east, west,
            latitude, longitude, radius = 50,
            denomination_id,
            limit = 500
        } = req.query;

        let whereConditions = [
            'a.status = "VALIDATED"',
            'a.role = "PASTOR"',
            'c.id IS NOT NULL'
        ];

        let params = [];

        // Mode 1: Bounding Box (optimal pour la carte)
        if (north && south && east && west) {
            const bbox = `POLYGON((${west} ${south}, ${east} ${south}, ${east} ${north}, ${west} ${north}, ${west} ${south}))`;
            whereConditions.push('MBRContains(ST_GeomFromText(?), c.location)');
            params.push(bbox);
        }
        // Mode 2: Distance radius
        else if (latitude && longitude) {
            const userPoint = `POINT(${longitude} ${latitude})`;
            whereConditions.push(
                `ST_Distance_Sphere(c.location, ST_GeomFromText('${userPoint}')) <= ? * 1000`
            );
            params.push(parseInt(radius));
        }

        // Filtre par dénomination
        if (denomination_id) {
            whereConditions.push('c.denomination_id = ?');
            params.push(denomination_id);
        }

        const whereClause = whereConditions.join(' AND ');

        // Requête ultra-optimisée: SEULEMENT les champs essentiels
        const query = `
            SELECT
                c.id,
                c.church_name,
                ST_X(c.location) as longitude,
                ST_Y(c.location) as latitude
            FROM churches c
            INNER JOIN admins a ON a.id = c.admin_id
            WHERE ${whereClause}
            LIMIT ?
        `;

        params.push(parseInt(limit));

        const [churches] = await db.query(query, params);

        const queryTime = Date.now() - startTime;
        
        // Log performance pour monitoring
        if (queryTime > 200) {
            console.warn(`[PERF] Slow markers query: ${queryTime}ms for ${churches.length} churches`);
        }

        res.json({
            success: true,
            count: churches.length,
            hasMore: churches.length === parseInt(limit),
            churches: churches,
            _meta: {
                queryTime: queryTime
            }
        });

    } catch (err) {
        console.error('Error fetching church markers:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du chargement des marqueurs'
        });
    }
});

/**
 * Route publique : GET /api/public/churches
 */
router.get('/churches', [
    query('north').optional().isFloat({ min: -90, max: 90 }),
    query('south').optional().isFloat({ min: -90, max: 90 }),
    query('east').optional().isFloat({ min: -180, max: 180 }),
    query('west').optional().isFloat({ min: -180, max: 180 }),
    query('latitude').optional().isFloat({ min: -90, max: 90 }),
    query('longitude').optional().isFloat({ min: -180, max: 180 }),
    query('radius').optional().isInt({ min: 1, max: 1000 }),
    query('userLat').optional().isFloat({ min: -90, max: 90 }),
    query('userLng').optional().isFloat({ min: -180, max: 180 }),
    query('denomination_id').optional().isInt(),
    query('search').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 500 })
], async (req, res) => {
    try {
        const {
            north, south, east, west,
            latitude, longitude, radius = 50,
            userLat, userLng,
            denomination_id, search,
            limit = 200
        } = req.query;

        let whereConditions = [
            'a.status = "VALIDATED"',
            'a.role = "PASTOR"',
            'c.id IS NOT NULL'
        ];

        let params = [];
        let selectDistance = '';
        let orderBy = 'ORDER BY c.church_name ASC';

        // Mode 1: Bounding Box (prioritaire pour performance)
        // Using MBRContains for optimal spatial index usage
        if (north && south && east && west) {
            const bbox = `POLYGON((${west} ${south}, ${east} ${south}, ${east} ${north}, ${west} ${north}, ${west} ${south}))`;
            whereConditions.push('MBRContains(ST_GeomFromText(?), c.location)');
            params.push(bbox);

            // Calculer la distance si userLat et userLng sont fournis
            if (userLat && userLng) {
                const userPoint = `POINT(${userLng} ${userLat})`;
                selectDistance = `,
                    ST_Distance_Sphere(c.location, ST_GeomFromText('${userPoint}')) / 1000 as distance_km`;
                orderBy = 'ORDER BY distance_km ASC';
            }
        }
        // Mode 2: Distance radius (fallback)
        else if (latitude && longitude) {
            const userPoint = `POINT(${longitude} ${latitude})`;
            selectDistance = `,
                ST_Distance_Sphere(c.location, ST_GeomFromText('${userPoint}')) / 1000 as distance_km`;
            whereConditions.push(
                `ST_Distance_Sphere(c.location, ST_GeomFromText('${userPoint}')) <= ? * 1000`
            );
            params.push(parseInt(radius));
            orderBy = 'ORDER BY distance_km ASC';
        }

        // Filtre par dénomination
        if (denomination_id) {
            whereConditions.push('c.denomination_id = ?');
            params.push(denomination_id);
        }

        // Filtre par recherche textuelle
        if (search) {
            whereConditions.push(
                '(c.church_name LIKE ? OR cd.city LIKE ? OR CONCAT(a.first_name, " ", a.last_name) LIKE ?)'
            );
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        const whereClause = whereConditions.join(' AND ');

        // Requête principale - Inclut city et postal_code de church_details
        const query = `
            SELECT
                c.id,
                c.church_name,
                ST_X(c.location) as longitude,
                ST_Y(c.location) as latitude,
                d.name as denomination_name,
                CONCAT(a.first_name, ' ', a.last_name) as pastor_name,
                cd.city,
                cd.postal_code
                ${selectDistance}
            FROM churches c
            INNER JOIN admins a ON a.id = c.admin_id
            LEFT JOIN denominations d ON d.id = c.denomination_id
            LEFT JOIN church_details cd ON cd.church_id = c.id
            WHERE ${whereClause}
            ${orderBy}
            LIMIT ?
        `;

        params.push(parseInt(limit));

        const [churches] = await db.query(query, params);

        res.json({
            success: true,
            count: churches.length,
            hasMore: churches.length === parseInt(limit),
            churches: churches.map(church => ({
                ...church,
                distance_km: church.distance_km ? parseFloat(church.distance_km.toFixed(2)) : null
            }))
        });

    } catch (err) {
        console.error('Error fetching public churches:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du chargement des églises'
        });
    }
});

/**
 * Route publique : GET /api/public/churches/:id
 * Retourne les détails complets d'une église
 */
router.get('/churches/:id', [
    param('id').isInt().withMessage('ID église invalide')
], async (req, res) => {
    try {
        const { id } = req.params;

        // Détails de l'église
        const [churches] = await db.query(`
            SELECT
                c.id,
                c.church_name,
                c.denomination_id,
                ST_X(c.location) as longitude,
                ST_Y(c.location) as latitude,
                d.name as denomination_name,
                a.first_name,
                a.last_name,
                a.email
            FROM churches c
            INNER JOIN admins a ON a.id = c.admin_id
            LEFT JOIN denominations d ON d.id = c.denomination_id
            WHERE c.id = ? AND a.status = 'VALIDATED'
        `, [id]);

        if (churches.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Église non trouvée'
            });
        }

        const church = churches[0];

        // Détails supplémentaires
        const [details] = await db.query(
            'SELECT * FROM church_details WHERE church_id = ?',
            [id]
        );

        // Horaires
        const [schedules] = await db.query(`
            SELECT
                cs.id,
                CASE cs.day_of_week
                    WHEN 'MONDAY' THEN 'Lundi'
                    WHEN 'TUESDAY' THEN 'Mardi'
                    WHEN 'WEDNESDAY' THEN 'Mercredi'
                    WHEN 'THURSDAY' THEN 'Jeudi'
                    WHEN 'FRIDAY' THEN 'Vendredi'
                    WHEN 'SATURDAY' THEN 'Samedi'
                    WHEN 'SUNDAY' THEN 'Dimanche'
                    ELSE cs.day_of_week
                END as day_of_week,
                cs.start_time,
                at.label_fr as activity_type
            FROM church_schedules cs
            LEFT JOIN activity_types at ON at.id = cs.activity_type_id
            WHERE cs.church_id = ?
            ORDER BY FIELD(cs.day_of_week, 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'),
                     cs.start_time
        `, [id]);

        // Réseaux sociaux
        const [socials] = await db.query(
            'SELECT platform, url FROM church_socials WHERE church_id = ?',
            [id]
        );

        res.json({
            success: true,
            church: {
                ...church,
                details: details[0] || {},
                schedules: schedules || [],
                socials: socials || []
            }
        });

    } catch (err) {
        console.error('Error fetching church details:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du chargement des détails de l\'église'
        });
    }
});


/**
 * Route publique : GET /api/public/events/markers
 * Version ultra-optimisée pour l'affichage des marqueurs d'événements sur la carte
 * Retourne uniquement les données minimales nécessaires
 */
router.get('/events/markers', [
    query('north').optional().isFloat({ min: -90, max: 90 }),
    query('south').optional().isFloat({ min: -90, max: 90 }),
    query('east').optional().isFloat({ min: -180, max: 180 }),
    query('west').optional().isFloat({ min: -180, max: 180 }),
    query('latitude').optional().isFloat({ min: -90, max: 90 }),
    query('longitude').optional().isFloat({ min: -180, max: 180 }),
    query('radius').optional().isInt({ min: 1, max: 1000 }),
    query('limit').optional().isInt({ min: 1, max: 20000 })
], async (req, res) => {
    const startTime = Date.now();
    
    try {
        const {
            north, south, east, west,
            latitude, longitude, radius = 50,
            limit = 500
        } = req.query;

        let whereConditions = [
            'COALESCE(e.end_datetime, e.start_datetime) >= NOW()',
            'a.status = "VALIDATED"'
        ];

        let params = [];

        // Mode 1: Bounding Box
        if (north && south && east && west) {
            const bbox = `POLYGON((${west} ${south}, ${east} ${south}, ${east} ${north}, ${west} ${north}, ${west} ${south}))`;
            whereConditions.push(
                'MBRContains(ST_GeomFromText(?), COALESCE(e.event_location, c.location))'
            );
            params.push(bbox);
        }
        // Mode 2: Distance radius
        else if (latitude && longitude) {
            const userPoint = `POINT(${longitude} ${latitude})`;
            whereConditions.push(
                `ST_Distance_Sphere(
                    COALESCE(e.event_location, c.location),
                    ST_GeomFromText('${userPoint}')
                ) <= ? * 1000`
            );
            params.push(parseInt(radius));
        }

        const whereClause = whereConditions.join(' AND ');

        // Requête ultra-optimisée: SEULEMENT les champs essentiels
        const query = `
            SELECT
                e.id,
                e.title,
                e.start_datetime,
                e.cancelled_at,
                ST_X(COALESCE(e.event_location, c.location)) as longitude,
                ST_Y(COALESCE(e.event_location, c.location)) as latitude
            FROM events e
            INNER JOIN admins a ON a.id = e.admin_id
            LEFT JOIN churches c ON c.id = e.church_id
            WHERE ${whereClause}
            ORDER BY e.start_datetime ASC
            LIMIT ?
        `;

        params.push(parseInt(limit));

        const [events] = await db.query(query, params);

        const queryTime = Date.now() - startTime;
        
        if (queryTime > 200) {
            console.warn(`[PERF] Slow events markers query: ${queryTime}ms for ${events.length} events`);
        }

        res.json({
            success: true,
            count: events.length,
            hasMore: events.length === parseInt(limit),
            events: events,
            _meta: {
                queryTime: queryTime
            }
        });

    } catch (err) {
        console.error('Error fetching event markers:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du chargement des marqueurs d\'événements'
        });
    }
});

/**
 * Route publique : GET /api/public/events
 * Retourne la liste des événements dans une zone visible ou à proximité
 * Query params: north, south, east, west OU latitude, longitude, radius
 */
router.get('/events', [
    query('north').optional().isFloat({ min: -90, max: 90 }),
    query('south').optional().isFloat({ min: -90, max: 90 }),
    query('east').optional().isFloat({ min: -180, max: 180 }),
    query('west').optional().isFloat({ min: -180, max: 180 }),
    query('latitude').optional().isFloat({ min: -90, max: 90 }),
    query('longitude').optional().isFloat({ min: -180, max: 180 }),
    query('radius').optional().isInt({ min: 1, max: 1000 }),
    query('userLat').optional().isFloat({ min: -90, max: 90 }),
    query('userLng').optional().isFloat({ min: -180, max: 180 }),
    query('search').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 500 })
], async (req, res) => {
    try {
        const {
            north, south, east, west,
            latitude, longitude, radius = 50,
            userLat, userLng,
            search,
            limit = 200
        } = req.query;

        let whereConditions = [
            // Afficher les événements à venir ET en cours (y compris les annulés)
            // Si end_datetime existe, vérifier qu'il n'est pas passé
            // Sinon, vérifier que start_datetime n'est pas passé
            'COALESCE(e.end_datetime, e.start_datetime) >= NOW()',
            'a.status = "VALIDATED"'
        ];

        let params = [];
        let selectDistance = '';
        let orderBy = 'ORDER BY e.start_datetime ASC';

        // Mode 1: Bounding Box
        // Using MBRContains for optimal spatial index usage
        if (north && south && east && west) {
            const bbox = `POLYGON((${west} ${south}, ${east} ${south}, ${east} ${north}, ${west} ${north}, ${west} ${south}))`;
            // Pour les événements, utiliser COALESCE car location peut être celle de l'événement ou de l'église
            whereConditions.push(
                'MBRContains(ST_GeomFromText(?), COALESCE(e.event_location, c.location))'
            );
            params.push(bbox);

            // Calculer la distance si userLat et userLng sont fournis
            if (userLat && userLng) {
                const userPoint = `POINT(${userLng} ${userLat})`;
                selectDistance = `,
                    ST_Distance_Sphere(
                        COALESCE(e.event_location, c.location),
                        ST_GeomFromText('${userPoint}')
                    ) / 1000 as distance_km`;
                orderBy = 'ORDER BY distance_km ASC, e.start_datetime ASC';
            }
        }
        // Mode 2: Distance radius
        else if (latitude && longitude) {
            const userPoint = `POINT(${longitude} ${latitude})`;
            selectDistance = `,
                ST_Distance_Sphere(
                    COALESCE(e.event_location, c.location),
                    ST_GeomFromText('${userPoint}')
                ) / 1000 as distance_km`;
            whereConditions.push(
                `ST_Distance_Sphere(
                    COALESCE(e.event_location, c.location),
                    ST_GeomFromText('${userPoint}')
                ) <= ? * 1000`
            );
            params.push(parseInt(radius));
            orderBy = 'ORDER BY distance_km ASC, e.start_datetime ASC';
        }

        // Filtre par recherche textuelle
        if (search) {
            whereConditions.push(
                '(e.title LIKE ? OR c.church_name LIKE ? OR ed.city LIKE ?)'
            );
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        const whereClause = whereConditions.join(' AND ');

        // Requête principale
        const query = `
            SELECT
                e.id,
                e.title,
                e.start_datetime,
                e.end_datetime,
                e.created_at,
                e.updated_at,
                COALESCE(e.interested_count, 0) as interested_count,
                e.cancelled_at,
                e.cancellation_reason,
                ST_X(COALESCE(e.event_location, c.location)) as longitude,
                ST_Y(COALESCE(e.event_location, c.location)) as latitude,
                c.church_name,
                c.id as church_id,
                ed.address as event_address,
                ed.city as event_city,
                ed.postal_code as event_postal_code
                ${selectDistance}
            FROM events e
            INNER JOIN admins a ON a.id = e.admin_id
            LEFT JOIN churches c ON c.id = e.church_id
            LEFT JOIN event_details ed ON ed.event_id = e.id
            WHERE ${whereClause}
            ${orderBy}
            LIMIT ?
        `;

        params.push(parseInt(limit));

        const [events] = await db.query(query, params);

        res.json({
            success: true,
            count: events.length,
            hasMore: events.length === parseInt(limit),
            events: events.map(event => ({
                ...event,
                distance_km: event.distance_km ? parseFloat(event.distance_km.toFixed(2)) : null
            }))
        });

    } catch (err) {
        console.error('Error fetching public events:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du chargement des événements'
        });
    }
});

/**
 * Route publique : POST /api/public/push-tokens
 * Enregistre ou met à jour le push token d'un device
 * Body: { device_id: string, push_token: string, platform: 'ios' | 'android' }
 */
router.post('/push-tokens', async (req, res) => {
    try {
        const { device_id, push_token, platform } = req.body;

        // Validation
        if (!device_id || !push_token || !platform) {
            return res.status(400).json({
                success: false,
                message: 'device_id, push_token et platform sont requis'
            });
        }

        if (!['ios', 'android'].includes(platform)) {
            return res.status(400).json({
                success: false,
                message: 'platform doit être "ios" ou "android"'
            });
        }

        // Obtenir language_id par défaut (français)
        const [languages] = await db.query(
            'SELECT id FROM languages WHERE code = ? LIMIT 1',
            ['fr']
        );

        const languageId = languages.length > 0 ? languages[0].id : 10;

        // INSERT ou UPDATE si device_id existe déjà
        await db.query(
            `INSERT INTO push_tokens (device_id, push_token, platform, language_id, created_at, updated_at)
             VALUES (?, ?, ?, ?, NOW(), NOW())
             ON DUPLICATE KEY UPDATE
                push_token = VALUES(push_token),
                platform = VALUES(platform),
                updated_at = NOW()`,
            [device_id, push_token, platform, languageId]
        );

        res.json({
            success: true,
            message: 'Push token enregistré avec succès',
            device_id: device_id
        });

    } catch (err) {
        console.error('Error saving push token:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'enregistrement du push token'
        });
    }
});

/**
 * Route publique : POST /api/public/events/:eventId/interest
 * Permet à un utilisateur mobile de montrer son intérêt pour un événement
 * Body: { device_id: string }
 */
router.post('/events/:eventId/interest', [
    param('eventId').isInt({ min: 1 })
], async (req, res) => {
    try {
        const eventId = parseInt(req.params.eventId);
        const { device_id } = req.body;

        if (!device_id) {
            return res.status(400).json({
                success: false,
                message: 'device_id est requis'
            });
        }

        // Vérifier que l'événement existe et n'est pas annulé
        const [events] = await db.query(
            `SELECT id, cancelled_at FROM events WHERE id = ?`,
            [eventId]
        );

        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Événement non trouvé'
            });
        }

        if (events[0].cancelled_at) {
            return res.status(400).json({
                success: false,
                message: 'Cet événement a été annulé'
            });
        }

        // Vérifier que le device_id existe dans push_tokens, sinon le créer
        const [devices] = await db.query(
            `SELECT device_id FROM push_tokens WHERE device_id = ?`,
            [device_id]
        );

        if (devices.length === 0) {
            // Créer automatiquement une entrée pour ce device (utile pour Expo Go sans notifications)
            const [languages] = await db.query('SELECT id FROM languages WHERE code = ? LIMIT 1', ['fr']);
            const languageId = languages.length > 0 ? languages[0].id : 10;

            await db.query(
                `INSERT INTO push_tokens (device_id, push_token, platform, language_id)
                 VALUES (?, ?, ?, ?)`,
                [device_id, 'expo-go-mock-token', 'ios', languageId]
            );
        }

        // Insérer l'intérêt (ignore si déjà existant grâce à UNIQUE)
        await db.query(
            `INSERT IGNORE INTO event_interests (event_id, device_id) VALUES (?, ?)`,
            [eventId, device_id]
        );

        // Mettre à jour le compteur
        await db.query(
            `UPDATE events SET interested_count = (
                SELECT COUNT(*) FROM event_interests WHERE event_id = ?
            ) WHERE id = ?`,
            [eventId, eventId]
        );

        // Récupérer le nouveau total
        const [result] = await db.query(
            `SELECT interested_count FROM events WHERE id = ?`,
            [eventId]
        );

        res.json({
            success: true,
            message: 'Intérêt enregistré avec succès',
            interested_count: result[0].interested_count || 0
        });

    } catch (err) {
        console.error('Error adding interest:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'enregistrement de l\'intérêt'
        });
    }
});

/**
 * Route publique : DELETE /api/public/events/:eventId/interest
 * Permet à un utilisateur mobile de retirer son intérêt pour un événement
 * Body: { device_id: string }
 */
router.delete('/events/:eventId/interest', [
    param('eventId').isInt({ min: 1 }),
    query('device_id').notEmpty().withMessage('device_id est requis')
], async (req, res) => {
    try {
        const eventId = parseInt(req.params.eventId);
        const { device_id } = req.query; // Changed from req.body to req.query

        if (!device_id) {
            return res.status(400).json({
                success: false,
                message: 'device_id est requis'
            });
        }

        // Supprimer l'intérêt
        const [result] = await db.query(
            `DELETE FROM event_interests WHERE event_id = ? AND device_id = ?`,
            [eventId, device_id]
        );

        // Mettre à jour le compteur
        await db.query(
            `UPDATE events SET interested_count = (
                SELECT COUNT(*) FROM event_interests WHERE event_id = ?
            ) WHERE id = ?`,
            [eventId, eventId]
        );

        // Récupérer le nouveau total
        const [countResult] = await db.query(
            `SELECT interested_count FROM events WHERE id = ?`,
            [eventId]
        );

        res.json({
            success: true,
            message: 'Intérêt retiré avec succès',
            interested_count: countResult[0].interested_count || 0,
            removed: result.affectedRows > 0
        });

    } catch (err) {
        console.error('Error removing interest:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du retrait de l\'intérêt'
        });
    }
});

/**
 * Route publique : GET /api/public/events/:eventId/interested-count
 * Récupère le nombre de personnes intéressées par un événement
 */
router.get('/events/:eventId/interested-count', [
    param('eventId').isInt({ min: 1 })
], async (req, res) => {
    try {
        const eventId = parseInt(req.params.eventId);

        const [result] = await db.query(
            `SELECT interested_count FROM events WHERE id = ?`,
            [eventId]
        );

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Événement non trouvé'
            });
        }

        res.json({
            success: true,
            interested_count: result[0].interested_count || 0
        });

    } catch (err) {
        console.error('Error fetching interested count:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du compteur'
        });
    }
});

/**
 * Route publique : GET /api/public/events/:eventId/is-interested
 * Vérifie si un device est intéressé par un événement
 * Query: device_id
 */
router.get('/events/:eventId/is-interested', [
    param('eventId').isInt({ min: 1 }),
    query('device_id').notEmpty()
], async (req, res) => {
    try {
        const eventId = parseInt(req.params.eventId);
        const { device_id } = req.query;

        const [result] = await db.query(
            `SELECT id FROM event_interests WHERE event_id = ? AND device_id = ?`,
            [eventId, device_id]
        );

        res.json({
            success: true,
            is_interested: result.length > 0
        });

    } catch (err) {
        console.error('Error checking interest:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification'
        });
    }
});

/**
 * Route publique : GET /api/public/events/interested
 * Récupère tous les événements où l'utilisateur a cliqué "Ça m'intéresse"
 * Query params:
 *   - device_id (required): ID unique du device
 *   - limit (optional): Nombre max de résultats (default: 50)
 *
 * OPTIMISATIONS:
 * - JOIN optimisé avec index sur event_interests(device_id)
 * - Seulement les champs nécessaires
 * - Tri par date de début (événements à venir en premier)
 * NOTE: DOIT être AVANT /events/:id pour éviter conflit de routing
 */
router.get('/events/interested', [
    query('device_id').notEmpty().withMessage('device_id est requis'),
    query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
    try {
        const { device_id, limit = 50 } = req.query;

        if (!device_id) {
            return res.status(400).json({
                success: false,
                message: 'device_id est requis'
            });
        }

        // Query optimisée: JOIN avec index, seulement les champs nécessaires
        const [events] = await db.query(`
            SELECT
                e.id,
                e.title,
                e.start_datetime,
                e.end_datetime,
                e.cancelled_at,
                e.cancellation_reason,
                e.interested_count,
                e.church_id,
                c.church_name,
                ed.city,
                ST_X(COALESCE(e.event_location, c.location)) as longitude,
                ST_Y(COALESCE(e.event_location, c.location)) as latitude,
                ei.created_at as interested_at
            FROM event_interests ei
            INNER JOIN events e ON ei.event_id = e.id
            LEFT JOIN churches c ON e.church_id = c.id
            LEFT JOIN event_details ed ON e.id = ed.event_id
            WHERE ei.device_id = ?
            AND COALESCE(e.end_datetime, e.start_datetime) >= NOW()
            ORDER BY e.start_datetime ASC
            LIMIT ?
        `, [device_id, parseInt(limit)]);

        // Enrichir avec le statut dynamique (comme dans l'autre endpoint)
        const { enrichEventsWithStatus } = require('../utils/eventStatus');
        const enrichedEvents = enrichEventsWithStatus(events);

        res.json({
            success: true,
            count: enrichedEvents.length,
            events: enrichedEvents
        });

    } catch (err) {
        console.error('Error fetching interested events:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du chargement des événements'
        });
    }
});

/**
 * Route publique : GET /api/public/events/:id
 * Retourne les détails complets d'un événement
 */
router.get('/events/:id', [
    param('id').isInt().withMessage('ID événement invalide')
], async (req, res) => {
    try {
        const { id } = req.params;

        const [events] = await db.query(`
            SELECT
                e.id,
                e.title,
                e.start_datetime,
                e.end_datetime,
                e.created_at,
                e.updated_at,
                COALESCE(e.interested_count, 0) as interested_count,
                e.cancelled_at,
                e.cancellation_reason,
                e.cancelled_by,
                ST_X(COALESCE(e.event_location, c.location)) as longitude,
                ST_Y(COALESCE(e.event_location, c.location)) as latitude,
                c.church_name,
                c.id as church_id,
                c.denomination_id,
                d.name as denomination_name,
                CONCAT(a.first_name, ' ', a.last_name) as organizer_name,
                a.first_name as pastor_first_name,
                a.last_name as pastor_last_name,
                a.email as pastor_email,
                l.code as primary_language_code,
                l.name_fr as primary_language_name,
                l.flag_emoji as primary_language_flag
            FROM events e
            INNER JOIN admins a ON a.id = e.admin_id
            LEFT JOIN churches c ON c.id = e.church_id
            LEFT JOIN denominations d ON d.id = c.denomination_id
            LEFT JOIN languages l ON l.id = e.language_id
            WHERE e.id = ? AND a.status = 'VALIDATED'
        `, [id]);

        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Événement non trouvé'
            });
        }

        const event = events[0];

        // Détails de l'événement
        const [eventDetails] = await db.query(
            'SELECT * FROM event_details WHERE event_id = ?',
            [id]
        );

        // Traductions disponibles pour l'événement
        const [translations] = await db.query(`
            SELECT
                l.id as language_id,
                l.code as language_code,
                l.name_fr as language_name,
                l.flag_emoji as language_flag
            FROM event_translations et
            INNER JOIN languages l ON l.id = et.language_id
            WHERE et.event_id = ?
            ORDER BY l.display_order
        `, [id]);

        // Détails de l'église si elle existe
        let churchDetails = null;
        let churchSchedules = [];
        let churchSocials = [];

        if (event.church_id) {
            // Détails de l'église
            const [details] = await db.query(
                'SELECT * FROM church_details WHERE church_id = ?',
                [event.church_id]
            );
            churchDetails = details[0] || null;

            // Horaires de l'église
            const [schedules] = await db.query(`
                SELECT
                    cs.id,
                    CASE cs.day_of_week
                        WHEN 'MONDAY' THEN 'Lundi'
                        WHEN 'TUESDAY' THEN 'Mardi'
                        WHEN 'WEDNESDAY' THEN 'Mercredi'
                        WHEN 'THURSDAY' THEN 'Jeudi'
                        WHEN 'FRIDAY' THEN 'Vendredi'
                        WHEN 'SATURDAY' THEN 'Samedi'
                        WHEN 'SUNDAY' THEN 'Dimanche'
                        ELSE cs.day_of_week
                    END as day_of_week,
                    cs.start_time,
                    at.label_fr as activity_type
                FROM church_schedules cs
                LEFT JOIN activity_types at ON at.id = cs.activity_type_id
                WHERE cs.church_id = ?
                ORDER BY FIELD(cs.day_of_week, 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'),
                         cs.start_time
            `, [event.church_id]);
            churchSchedules = schedules;

            // Réseaux sociaux de l'église
            const [socials] = await db.query(
                'SELECT platform, url FROM church_socials WHERE church_id = ?',
                [event.church_id]
            );
            churchSocials = socials;
        }

        res.json({
            success: true,
            event: {
                ...event,
                details: eventDetails[0] || {},
                primary_language: event.primary_language_code ? {
                    code: event.primary_language_code,
                    name: event.primary_language_name,
                    flag: event.primary_language_flag
                } : null,
                translations: translations || [],
                church: event.church_id ? {
                    id: event.church_id,
                    church_name: event.church_name,
                    denomination_id: event.denomination_id,
                    denomination_name: event.denomination_name,
                    pastor_first_name: event.pastor_first_name,
                    pastor_last_name: event.pastor_last_name,
                    pastor_email: event.pastor_email,
                    details: churchDetails,
                    schedules: churchSchedules,
                    socials: churchSocials
                } : null
            }
        });

    } catch (err) {
        console.error('Error fetching event details:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du chargement des détails de l\'événement'
        });
    }
});

/**
 * Route publique : GET /api/public/denominations
 * Retourne la liste de toutes les dénominations
 */
router.get('/denominations', async (req, res) => {
    try {
        const [denominations] = await db.query(
            'SELECT id, name FROM denominations ORDER BY name ASC'
        );

        res.json({
            success: true,
            count: denominations.length,
            denominations
        });

    } catch (err) {
        console.error('Error fetching denominations:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du chargement des dénominations'
        });
    }
});

/**
 * Route publique : GET /api/public/stats
 * Retourne les statistiques globales (France)
 */
router.get('/stats', async (req, res) => {
    try {
        // Nombre d'églises actives (validées)
        const [churchesCount] = await db.query(`
            SELECT COUNT(*) as total
            FROM churches c
            INNER JOIN admins a ON a.id = c.admin_id
            WHERE a.status = 'VALIDATED'
        `);

        // Nombre d'événements en cours
        const [ongoingEvents] = await db.query(`
            SELECT COUNT(*) as total
            FROM events e
            INNER JOIN admins a ON a.id = e.admin_id
            WHERE e.cancelled_at IS NULL
            AND a.status = 'VALIDATED'
            AND e.start_datetime <= NOW()
            AND COALESCE(e.end_datetime, e.start_datetime) >= NOW()
        `);

        // Nombre d'événements à venir
        const [upcomingEvents] = await db.query(`
            SELECT COUNT(*) as total
            FROM events e
            INNER JOIN admins a ON a.id = e.admin_id
            WHERE e.cancelled_at IS NULL
            AND a.status = 'VALIDATED'
            AND e.start_datetime > NOW()
        `);

        res.json({
            success: true,
            stats: {
                churches: churchesCount[0].total,
                ongoingEvents: ongoingEvents[0].total,
                upcomingEvents: upcomingEvents[0].total
            }
        });

    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du chargement des statistiques'
        });
    }
});

module.exports = router;

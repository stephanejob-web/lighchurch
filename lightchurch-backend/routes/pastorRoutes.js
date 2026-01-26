const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requirePastor } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(requirePastor);

// GET /pastor/network - Liste paginée avec filtres
router.get('/network', async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', city = '', denomination_id = '' } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Nettoyer et normaliser la recherche
        // Trim + remplacer espaces multiples par un seul
        const cleanSearch = search.trim().replace(/\s+/g, ' ');

        let whereConditions = [
            'a.role = "PASTOR"',
            'a.status = "VALIDATED"',
            'a.allow_network_visibility = TRUE',
            'c.id IS NOT NULL',
            'a.id != ?' // Exclure le pasteur connecté
        ];

        let params = [req.user.id]; // Ajouter l'ID du pasteur connecté aux paramètres

        if (cleanSearch) {
            whereConditions.push(`(
                a.first_name LIKE ? OR
                a.last_name LIKE ? OR
                CONCAT(a.first_name, ' ', a.last_name) LIKE ? OR
                CONCAT(a.last_name, ' ', a.first_name) LIKE ? OR
                a.email LIKE ? OR
                c.church_name LIKE ?
            )`);
            const searchPattern = `%${cleanSearch}%`;
            params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
        }

        if (city) {
            whereConditions.push('cd.city LIKE ?');
            params.push(`%${city}%`);
        }

        if (denomination_id) {
            whereConditions.push('c.denomination_id = ?');
            params.push(denomination_id);
        }

        const whereClause = whereConditions.join(' AND ');

        // Count total
        const [countResult] = await db.query(`
            SELECT COUNT(DISTINCT a.id) as total
            FROM admins a
            INNER JOIN churches c ON c.admin_id = a.id
            LEFT JOIN church_details cd ON cd.church_id = c.id
            WHERE ${whereClause}
        `, params);

        const total = countResult[0].total;

        // Main query with pagination
        const [pastors] = await db.query(`
            SELECT
                a.id, a.first_name, a.last_name, a.email,
                c.id as church_id, c.church_name,
                cd.phone as phone_number, cd.city, cd.postal_code,
                d.name as denomination_name
            FROM admins a
            INNER JOIN churches c ON c.admin_id = a.id
            LEFT JOIN church_details cd ON cd.church_id = c.id
            LEFT JOIN denominations d ON d.id = c.denomination_id
            WHERE ${whereClause}
            ORDER BY a.last_name, a.first_name
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limit), offset]);

        res.json({
            pastors,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        console.error('Error fetching pastor network:', err);
        res.status(500).json({ message: 'Erreur lors du chargement du réseau pastoral' });
    }
});

// GET /pastor/network/:id - Détails complets
router.get('/network/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [pastors] = await db.query(`
            SELECT a.id, a.first_name, a.last_name, a.email, a.allow_network_visibility,
                   c.id as church_id, c.church_name, c.denomination_id,
                   ST_X(c.location) as longitude, ST_Y(c.location) as latitude,
                   d.name as denomination_name
            FROM admins a
            INNER JOIN churches c ON c.admin_id = a.id
            LEFT JOIN denominations d ON d.id = c.denomination_id
            WHERE a.id = ? AND a.role = 'PASTOR' AND a.status = 'VALIDATED'
        `, [id]);

        if (pastors.length === 0) {
            return res.status(404).json({ message: 'Pasteur non trouvé' });
        }

        const pastor = pastors[0];

        if (!pastor.allow_network_visibility && pastor.id !== req.user.id) {
            return res.status(403).json({ message: 'Ce pasteur n\'a pas activé sa visibilité réseau' });
        }

        const [details] = await db.query('SELECT * FROM church_details WHERE church_id = ?', [pastor.church_id]);
        const [schedules] = await db.query(`
            SELECT cs.id, cs.church_id, cs.activity_type_id,
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
        `, [pastor.church_id]);
        const [socials] = await db.query('SELECT * FROM church_socials WHERE church_id = ?', [pastor.church_id]);

        res.json({
            pastor: {
                id: pastor.id,
                first_name: pastor.first_name,
                last_name: pastor.last_name,
                email: pastor.email
            },
            church: {
                id: pastor.church_id,
                church_name: pastor.church_name,
                denomination_id: pastor.denomination_id,
                denomination_name: pastor.denomination_name,
                longitude: pastor.longitude,
                latitude: pastor.latitude,
                details: details[0] || {},
                schedules: schedules || [],
                socials: socials || []
            }
        });
    } catch (err) {
        console.error('Error fetching pastor details:', err);
        res.status(500).json({ message: 'Erreur lors du chargement des détails du pasteur' });
    }
});

// PUT /pastor/network/visibility
router.put('/network/visibility', async (req, res) => {
    try {
        const { allow_network_visibility } = req.body;

        if (typeof allow_network_visibility !== 'boolean') {
            return res.status(400).json({ message: 'allow_network_visibility doit être un booléen' });
        }

        await db.query('UPDATE admins SET allow_network_visibility = ? WHERE id = ?',
            [allow_network_visibility, req.user.id]);

        res.json({ message: 'Visibilité réseau mise à jour avec succès', allow_network_visibility });
    } catch (err) {
        console.error('Error updating visibility:', err);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la visibilité' });
    }
});

// GET /pastor/network/my-visibility
router.get('/network/my-visibility', async (req, res) => {
    try {
        const [result] = await db.query('SELECT allow_network_visibility FROM admins WHERE id = ?', [req.user.id]);

        if (result.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.json({ allow_network_visibility: Boolean(result[0].allow_network_visibility) });
    } catch (err) {
        console.error('Error fetching visibility:', err);
        res.status(500).json({ message: 'Erreur lors de la récupération de la visibilité' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/profile - Récupérer les informations du profil
router.get('/', verifyToken, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, email, first_name, last_name, role, status, document_sirene_path, created_at FROM admins WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// PUT /api/profile/email - Modifier l'email
router.put('/email', verifyToken, async (req, res) => {
    const { email } = req.body;

    try {
        // Validation de l'email
        if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            return res.status(400).json({ message: 'Email invalide' });
        }

        // Vérifier si l'email est déjà utilisé par un autre utilisateur
        const [existingUsers] = await db.query(
            'SELECT id FROM admins WHERE email = ? AND id != ?',
            [email, req.user.id]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        // Mettre à jour l'email
        await db.query(
            'UPDATE admins SET email = ? WHERE id = ?',
            [email, req.user.id]
        );

        res.json({ message: 'Email mis à jour avec succès', email });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'email:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// PUT /api/profile/password - Changer le mot de passe
router.put('/password', verifyToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        // Validation des champs
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: 'Le mot de passe actuel et le nouveau mot de passe sont requis'
            });
        }

        // Validation du nouveau mot de passe (minimum 8 caractères)
        if (newPassword.length < 8) {
            return res.status(400).json({
                message: 'Le nouveau mot de passe doit contenir au moins 8 caractères'
            });
        }

        // Récupérer le hash du mot de passe actuel
        const [users] = await db.query(
            'SELECT password_hash FROM admins WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Vérifier que le mot de passe actuel est correct
        const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
        }

        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Mettre à jour le mot de passe
        await db.query(
            'UPDATE admins SET password_hash = ? WHERE id = ?',
            [hashedPassword, req.user.id]
        );

        res.json({ message: 'Mot de passe mis à jour avec succès' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du mot de passe:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// PUT /api/profile/document - Mettre à jour le document SIRENE
router.put('/document', verifyToken, async (req, res) => {
    const { document_sirene_path } = req.body;

    try {
        // Validation du chemin du document
        if (!document_sirene_path || document_sirene_path.trim() === '') {
            return res.status(400).json({
                message: 'Le chemin du document SIRENE est requis'
            });
        }

        // Mettre à jour le document (pas besoin de revalidation)
        await db.query(
            'UPDATE admins SET document_sirene_path = ? WHERE id = ?',
            [document_sirene_path, req.user.id]
        );

        res.json({
            message: 'Document mis à jour avec succès',
            document_sirene_path
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du document:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;

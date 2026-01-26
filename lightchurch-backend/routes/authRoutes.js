const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { validateRegister, validateLogin } = require('../validators/authValidator');

// Inscription
router.post('/register', validateRegister, async (req, res) => {
    const { email, password, first_name, last_name, document_sirene_path } = req.body;

    try {
        // VALIDATION OBLIGATOIRE : Document SIRENE requis
        if (!document_sirene_path || document_sirene_path.trim() === '') {
            return res.status(400).json({
                message: 'Le document SIRENE est obligatoire pour l\'inscription. Veuillez téléverser un Avis de situation SIRENE valide.'
            });
        }

        // Vérifier si l'utilisateur existe déjà
        const [existingUsers] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer l'utilisateur avec le document SIRENE (Role PASTOR par défaut, Status PENDING)
        await db.query(
            'INSERT INTO admins (email, password_hash, role, status, first_name, last_name, document_sirene_path) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [email, hashedPassword, 'PASTOR', 'PENDING', first_name, last_name, document_sirene_path]
        );

        res.status(201).json({
            message: 'Inscription réussie. Votre compte est en attente de validation par un administrateur.',
            info: 'Vous recevrez un email une fois que votre document aura été vérifié.'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Connexion
router.post('/login', validateLogin, async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Identifiants invalides' });
        }

        const user = users[0];

        if (user.status === 'PENDING') {
            return res.status(403).json({ message: 'Compte en attente de validation.' });
        }
        if (user.status === 'REJECTED') {
            return res.status(403).json({ message: 'Votre compte a été refusé.' });
        }
        if (user.status === 'SUSPENDED') {
            return res.status(403).json({ message: 'Votre compte a été suspendu par l\'administrateur.' });
        }

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Identifiants invalides' });
        }

        // Générer le token JWT
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('CRITICAL: JWT_SECRET is not defined in environment variables');
            return res.status(500).json({ message: 'Configuration serveur incorrecte' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, status: user.status },
            jwtSecret,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                status: user.status,
                first_name: user.first_name,
                last_name: user.last_name
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;

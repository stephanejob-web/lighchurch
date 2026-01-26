require('dotenv').config({ path: '../.env' }); // Adjust path if running from scripts dir
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const createSuperAdmin = async () => {
    const email = process.argv[2] || 'admin@lightchurch.fr';
    const password = process.argv[3] || '780662aB2';
    const firstName = 'Super';
    const lastName = 'Admin';

    if (!email || !password) {
        console.log('Usage: node createSuperAdmin.js <email> <password>');
        process.exit(1);
    }

    try {
        // Vérifier si un super admin existe déjà
        const [existingAdmins] = await db.query('SELECT * FROM admins WHERE role = "SUPER_ADMIN"');
        if (existingAdmins.length > 0) {
            console.log('Un Super Admin existe déjà.');
            process.exit(0);
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer le Super Admin
        await db.query(
            'INSERT INTO admins (email, password_hash, role, status, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)',
            [email, hashedPassword, 'SUPER_ADMIN', 'VALIDATED', firstName, lastName]
        );

        console.log(`Super Admin créé avec succès : ${email}`);
        process.exit(0);
    } catch (error) {
        console.error('Erreur lors de la création du Super Admin:', error);
        process.exit(1);
    }
};

createSuperAdmin();

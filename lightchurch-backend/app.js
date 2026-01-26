require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();
const port = process.env.PORT || 3000;

// Configuration CORS pour autoriser le frontend (à ajuster selon besoin)
app.use(cors());

// Middleware pour parser le JSON
app.use(express.json());

// Import des routes
const publicMapRoutes = require('./routes/publicMapRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const churchRoutes = require('./routes/churchRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const pastorRoutes = require('./routes/pastorRoutes');
const profileRoutes = require('./routes/profileRoutes');
const path = require('path');

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Utilisation des routes
// Routes publiques (sans authentification)
app.use('/api/public', publicMapRoutes);

// Routes authentifiées
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/church', churchRoutes);
app.use('/api/pastor', pastorRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API Light Church!' });
});

app.get('/health', async (req, res) => {
  try {
    const connection = await db.getConnection();
    await connection.ping();
    connection.release();
    res.json({ status: 'OK', database: 'Connected' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'ERROR', database: 'Disconnected' });
  }
});

// Initialisation des Tâches Cron
const initEventCron = require('./cron/eventCron');
initEventCron();

// Démarrage du serveur
app.listen(port, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${port}`);
});


const cron = require('node-cron');
const db = require('../config/db');

// Note: This cron job is no longer needed as event status is now computed dynamically
// based on dates (start_datetime, end_datetime) and cancellation state (cancelled_at)
// The status is calculated in real-time by the enrichEventWithStatus() function
const initEventCron = () => {
    // Cron job disabled - status is now computed dynamically
    console.log('[CRON] Tâche de mise à jour des événements désactivée (statut calculé dynamiquement).');
};

module.exports = initEventCron;

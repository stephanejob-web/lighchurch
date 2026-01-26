/**
 * Service d'envoi de notifications push via Expo
 * Envoie des notifications aux utilisateurs intéressés par un événement
 */

const db = require('../config/db');

/**
 * Envoie une notification push via l'API Expo
 * @param {Array} pushTokens - Liste des tokens Expo
 * @param {Object} notification - { title, body, data }
 */
async function sendExpoNotifications(pushTokens, notification) {
    if (!pushTokens || pushTokens.length === 0) {
        return { success: true, sent: 0 };
    }

    // Filtrer les tokens valides Expo
    const validTokens = pushTokens.filter(token =>
        token && token.startsWith('ExponentPushToken[')
    );

    if (validTokens.length === 0) {
        return { success: true, sent: 0 };
    }

    // Préparer les messages pour l'API Expo
    const messages = validTokens.map(token => ({
        to: token,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        priority: 'high',
        channelId: 'default'
    }));

    try {
        // Envoyer via l'API Expo Push Notifications
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(messages)
        });

        const result = await response.json();

        // Gérer les erreurs de tokens invalides
        if (result.data) {
            const invalidTokens = [];
            result.data.forEach((item, index) => {
                if (item.status === 'error' && item.details?.error === 'DeviceNotRegistered') {
                    invalidTokens.push(validTokens[index]);
                }
            });

            // Supprimer les tokens invalides de la BDD
            if (invalidTokens.length > 0) {
                await cleanupInvalidTokens(invalidTokens);
            }
        }

        return {
            success: true,
            sent: validTokens.length,
            errors: result.errors || []
        };
    } catch (error) {
        console.error('Erreur envoi notifications Expo:', error);
        return {
            success: false,
            sent: 0,
            error: error.message
        };
    }
}

/**
 * Supprime les tokens invalides de la base de données
 */
async function cleanupInvalidTokens(invalidTokens) {
    if (!invalidTokens || invalidTokens.length === 0) return;

    try {
        const placeholders = invalidTokens.map(() => '?').join(',');
        await db.query(
            `DELETE FROM push_tokens WHERE push_token IN (${placeholders})`,
            invalidTokens
        );
    } catch (error) {
        console.error('Erreur nettoyage tokens invalides:', error);
    }
}

/**
 * Envoie une notification aux utilisateurs intéressés par un événement
 * @param {number} eventId - ID de l'événement
 * @param {string} notificationType - Type: 'modified', 'cancelled', 'reminder'
 * @param {Object} customData - Données additionnelles
 */
async function notifyEventInterested(eventId, notificationType = 'modified', customData = {}) {
    try {
        // Récupérer l'événement et les tokens des utilisateurs intéressés
        const [interested] = await db.query(`
            SELECT
                pt.push_token,
                pt.platform,
                e.title,
                e.start_datetime,
                e.end_datetime,
                c.church_name
            FROM event_interests ei
            JOIN push_tokens pt ON ei.device_id = pt.device_id
            JOIN events e ON ei.event_id = e.id
            LEFT JOIN churches c ON e.church_id = c.id
            WHERE ei.event_id = ?
        `, [eventId]);

        if (interested.length === 0) {
            return { success: true, sent: 0, message: 'Aucun utilisateur intéressé' };
        }

        // Préparer le message selon le type
        let title = '';
        let body = '';
        const eventTitle = interested[0].title;
        const churchName = interested[0].church_name;

        switch (notificationType) {
            case 'modified':
                title = '📅 Événement modifié';
                body = `"${eventTitle}" a été mis à jour`;
                if (churchName) body += ` - ${churchName}`;
                break;

            case 'cancelled':
                title = '🚫 Événement annulé';
                body = `"${eventTitle}" a été annulé`;
                if (churchName) body += ` - ${churchName}`;
                break;

            case 'reminder':
                title = '⏰ Rappel événement';
                body = `"${eventTitle}" commence bientôt!`;
                break;

            case 'new_info':
                title = 'ℹ️ Nouvelles informations';
                body = `"${eventTitle}" - Nouvelles infos disponibles`;
                break;

            default:
                title = '🔔 Notification';
                body = `Mise à jour pour "${eventTitle}"`;
        }

        // Extraire les tokens
        const pushTokens = interested.map(item => item.push_token);

        // Envoyer les notifications
        const result = await sendExpoNotifications(pushTokens, {
            title,
            body,
            data: {
                eventId: eventId.toString(),
                type: notificationType,
                ...customData
            }
        });

        return {
            ...result,
            message: `Notification envoyée à ${result.sent} utilisateur(s)`
        };
    } catch (error) {
        console.error('Erreur notification événement:', error);
        return {
            success: false,
            sent: 0,
            error: error.message
        };
    }
}

module.exports = {
    sendExpoNotifications,
    notifyEventInterested,
    cleanupInvalidTokens
};

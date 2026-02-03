const express = require('express');
const router = express.Router();

// Proxy pour l'API d'adresse du gouvernement français
// Évite les problèmes CORS côté client
router.get('/search', async (req, res) => {
    try {
        const { q, type, limit, autocomplete } = req.query;

        if (!q) {
            return res.status(400).json({ error: 'Le paramètre q est requis' });
        }

        const params = new URLSearchParams({
            q,
            ...(type && { type }),
            ...(limit && { limit }),
            ...(autocomplete && { autocomplete })
        });

        const response = await fetch(`https://api-adresse.data.gouv.fr/search/?${params}`);
        const data = await response.json();

        res.json(data);
    } catch (error) {
        console.error('Erreur proxy geo:', error);
        res.status(500).json({ error: 'Erreur lors de la recherche d\'adresse' });
    }
});

module.exports = router;

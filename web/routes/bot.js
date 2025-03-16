const express = require('express');
const router = express.Router();

// Endpoint pour récupérer la liste des salons du bot
router.get('/channels', async (req, res) => {
    try {
        const response = await fetch('http://localhost:27397/api/bot/channels');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erreur de communication avec le bot.' });
    }
});

module.exports = router;

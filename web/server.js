const express = require('express');
const app = express();
const PORT = 27397;
const io = require('socket.io-client');

// Middleware pour parser le JSON
app.use(express.json());

// Importer les routes pour gérer le bot
const botRoutes = require('./routes/bot');
app.use('/api/bot', botRoutes);

// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Panel Web en ligne sur http://localhost:${PORT}`);
});

// WEBSOCKET

const socket = io('http://localhost:27397');

socket.on('channelUpdate', (data) => {
    console.log('Mise à jour des salons :', data);
});

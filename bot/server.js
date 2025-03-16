const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config.json');

const { Server } = require('socket.io');
const http = require('http');

const app = express();
const PORT = 5000;  // Port pour l'API du bot

const bot = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

bot.login(process.env.TOKEN);

app.use(express.json());

// Endpoint pour récupérer les salons du serveur Discord
app.get('/api/bot/channels', async (req, res) => {
    try {
        const guild = bot.guilds.cache.get(config.guildId);
        if (!guild) return res.status(404).json({ error: 'Serveur non trouvé' });

        const channels = guild.channels.cache.map(channel => ({
            id: channel.id,
            name: channel.name,
            type: channel.type
        }));

        res.json(channels);
    } catch (error) {
        res.status(500).json({ error: 'Erreur interne du bot' });
    }
});

// Lancer l’API du bot
app.listen(PORT, () => {
    console.log(`API du bot en ligne sur http://localhost:${PORT}`);
});


// WEBSOCKET
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

bot.on('channelCreate', channel => {
    io.emit('channelUpdate', { action: 'create', id: channel.id, name: channel.name });
});

bot.on('channelDelete', channel => {
    io.emit('channelUpdate', { action: 'delete', id: channel.id });
});

server.listen(5000, () => {
    console.log('API du bot avec WebSocket en ligne sur http://localhost:5000');
});

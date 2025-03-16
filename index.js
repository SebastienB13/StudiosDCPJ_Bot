const { spawn } = require('child_process');
const path = require('path');

// Lancer le bot Discord
const botProcess = spawn('node', [path.join(__dirname, 'bot', 'server.js')], {
    stdio: 'inherit'
});

// Lancer le serveur web
const webProcess = spawn('node', [path.join(__dirname, 'web', 'server.js')], {
    stdio: 'inherit'
});

// Gérer les erreurs si un des deux process plante
botProcess.on('close', (code) => {
    console.log(`Le bot s'est arrêté avec le code ${code}`);
});

webProcess.on('close', (code) => {
    console.log(`Le serveur web s'est arrêté avec le code ${code}`);
});

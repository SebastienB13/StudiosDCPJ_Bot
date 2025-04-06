const { SlashCommandBuilder } = require('discord.js');
const Parser = require('rss-parser');
const parser = new Parser();

// Mapping des flux RSS par plateforme
const RSS_FEEDS = {
    Facebook: 'https://facebook.com/rss',    // Remplace par le vrai flux RSS de Facebook
    Instagram: 'https://instagram.com/rss',  // Remplace par le vrai flux RSS d'Instagram
    YouTube: 'https://youtube.com/rss',        // Remplace par le vrai flux RSS de YouTube
    LinkedIn: 'https://linkedin.com/rss'       // Remplace par le vrai flux RSS de LinkedIn
};

// Fonction pour récupérer le dernier article d'un flux donné
async function fetchRSSFeed(source) {
    if (!RSS_FEEDS[source]) return `❌ Source invalide : ${source}`;

    try {
        const feed = await parser.parseURL(RSS_FEEDS[source]);
        if (feed.items.length > 0) {
            return `📰 **${feed.title}**\n🔗 [${feed.items[0].title}](${feed.items[0].link})`;
        } else {
            return `🔍 Aucun article trouvé pour **${source}**.`;
        }
    } catch (error) {
        return `❌ Erreur lors de la récupération du flux **${source}**.`;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rss')
        .setDescription('Gère les flux RSS')
        .addStringOption(option =>
            option.setName('function')
                .setDescription('Action à effectuer')
                .setRequired(true)
                .addChoices(
                    { name: 'TEST', value: 'TEST' }
                ))
        .addStringOption(option =>
            option.setName('source')
                .setDescription('Source RSS à tester')
                .setRequired(true)
                .addChoices(
                    { name: 'Facebook', value: 'Facebook' },
                    { name: 'Instagram', value: 'Instagram' },
                    { name: 'YouTube', value: 'YouTube' },
                    { name: 'LinkedIn', value: 'LinkedIn' }
                )),
    async execute(interaction) {
        const func = interaction.options.getString('function');
        const source = interaction.options.getString('source');

        if (func === 'TEST') {
            await interaction.deferReply(); // Permet d'avoir plus de temps pour traiter la commande
            const response = await fetchRSSFeed(source);
            await interaction.editReply(response);
        } else {
            await interaction.reply('❌ Fonction inconnue.');
        }
    }
};

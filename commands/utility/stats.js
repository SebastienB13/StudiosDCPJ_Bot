const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");

const YOUTUBE_API_KEY = "AIzaSyCbN6WLN12Z8it4ouJnAa9x_f9AjmrmcDU";
const CHANNEL_ID = "ID_DE_LA_CHAINE";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stats")
        .setDescription("Obtenir les statistiques d'une chaîne YouTube")
        .addStringOption(option =>
            option.setName("option")
                .setDescription("Choisir la plateforme")
                .setRequired(true)
                .addChoices({ name: "YouTube", value: "youtube" })
        ),

    async execute(interaction) {
        const option = interaction.options.getString("option");

        if (option === "youtube") {
            await interaction.deferReply();

            try {
                const response = await axios.get(
                    `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`
                );

                const stats = response.data.items[0].statistics;
                const abonnés = stats.subscriberCount;
                const vuesTotales = stats.viewCount;
                const vidéos = stats.videoCount;

                await interaction.editReply(`📊 **Statistiques YouTube** :
                👥 **Abonnés** : ${abonnés}
                👀 **Vues Totales** : ${vuesTotales}
                🎥 **Vidéos** : ${vidéos}`);
            } catch (error) {
                console.error(error);
                await interaction.editReply("❌ Erreur lors de la récupération des statistiques.");
            }
        }
    }
};

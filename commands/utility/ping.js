const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Affiche la latence du bot."),
    
    async execute(interaction) {
        const sent = await interaction.reply({ content: "⏳ Calcul en cours...", fetchReply: true });

        const botLatency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);
        let responseTime;

        if (botLatency < 100) responseTime = "🚀 Ultra rapide";
        else if (botLatency < 200) responseTime = "⚡ Rapide";
        else if (botLatency < 400) responseTime = "⚠️ Moyenne";
        else responseTime = "🐌 Lente";

        const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("📡 Latence du Bot")
            .addFields(
                { name: "⏱️ Latence", value: `\`${botLatency} ms\``, inline: true },
                { name: "⚡ Temps de réponse", value: `\`${responseTime}\``, inline: true },
                { name: "🌐 Latence API", value: `\`${apiLatency} ms\``, inline: true }
            )
            .setTimestamp();

        const button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("Statut de Discord")
                .setStyle(ButtonStyle.Link)
                .setURL("https://discordstatus.com")
        );

        await interaction.editReply({ content: "", embeds: [embed], components: [button] });
    },
};

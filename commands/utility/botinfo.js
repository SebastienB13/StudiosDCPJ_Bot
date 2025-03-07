const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const os = require("os");
const moment = require("moment");
require("moment-duration-format");
const packageJson = require("../../package.json"); // Importer les dépendances

module.exports = {
    data: new SlashCommandBuilder()
        .setName("botinfo")
        .setDescription("Affiche des informations sur le bot."),
    
    async execute(interaction) {
        const client = interaction.client;
        const uptime = moment.duration(client.uptime).format("D [j] H [h] m [m] s [s]");
        const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        
        // Récupération des dépendances depuis package.json
        const dependencies = Object.keys(packageJson.dependencies).join(", ");

        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("📌 Informations sur le bot")
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: "🛠️ Créateur", value: "antoinemaxence", inline: false },
                { name: "⏳ Temps de fonctionnement", value: `${uptime}`, inline: false },
                { name: "👥 Nombre total d'utilisateurs", value: `${totalUsers}`, inline: false },
                { name: "📦 Version Discord.js", value: `v${require("discord.js").version}`, inline: true },
                { name: "📦 Version Node.js", value: `${process.version}`, inline: true },
                { name: "📦 Packages utilisés", value: `\`${dependencies}\``, inline: false },
            )
            .setFooter({ text: `Bot développé avec ❤️ par antoinemaxence • ${moment().format("DD/MM/YYYY HH:mm")}` });

        await interaction.reply({ embeds: [embed] });
    },
};

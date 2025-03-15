const { EmbedBuilder } = require("discord.js");
const config = require("../../config.json");

module.exports = {
    name: "guildBanAdd",
    async execute(ban) {
        try {
            const fetchedLogs = await ban.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_BAN_ADD' });
            const banLog = fetchedLogs.entries.first();
            const moderator = banLog ? banLog.executor : { tag: 'Inconnu', id: 'Inconnu' };
            const reason = banLog && banLog.reason ? banLog.reason : 'Aucune raison fournie';

            const embed = new EmbedBuilder()
                .setColor('DarkRed')
                .setTitle('Membre banni')
                .setDescription(`${ban.user.tag} a été banni du serveur.`)
                .addFields(
                    { name: 'Modérateur', value: `<@${moderator.id}>`, inline: true },
                    { name: 'Raison', value: reason, inline: false }
                )
                .setThumbnail(ban.user.displayAvatarURL())
                .setTimestamp();

            const logChannel = ban.guild.client.channels.cache.get(config.sdcpj.channels.logs.moderation);
            if (logChannel) logChannel.send({ embeds: [embed] }).catch(console.error);
        } catch (error) {
            console.error('Erreur lors de la récupération des logs d\'audit :', error);
        }
    },
};

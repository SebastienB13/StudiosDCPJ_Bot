const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "guildMemberAdd",
    execute(member) {
        const creationTimestamp = Math.floor(member.user.createdAt.getTime() / 1000);
        const rolesObtained = member.roles.cache
            .filter(role => role.id !== member.guild.id)
            .map(role => role.toString())
            .join(', ') || "Aucun rôle";

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Nouveau membre')
            .setDescription(`<@${member.user.id}> a rejoint le serveur.`)
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: "ID Utilisateur", value: member.user.id, inline: true },
                { name: "Création du compte", value: `<t:${creationTimestamp}:F>`, inline: true },
                { name: "Rôles", value: rolesObtained, inline: false }
            )
            .setTimestamp();

        const logChannel = member.client.channels.cache.get(require("../../config.json").sdcpj.channels.logs.moderation);
        if (logChannel) logChannel.send({ embeds: [embed] }).catch(console.error);
    },
};

const { EmbedBuilder } = require("discord.js");
const config = require("../../config.json");

module.exports = {
    name: "guildMemberRemove",
    execute(member) {
        const joinTimestamp = member.joinedAt ? Math.floor(member.joinedAt.getTime() / 1000) : 'Inconnue';
        const rolesHad = member.roles.cache
            .filter(role => role.id !== member.guild.id)
            .map(role => role.toString())
            .join(', ') || "Aucun rôle";

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Membre parti')
            .setDescription(`${member.user.tag} a quitté le serveur.`)
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: 'Date de rejoint', value: joinTimestamp !== 'Inconnue' ? `<t:${joinTimestamp}:F>` : 'Inconnue', inline: true },
                { name: 'Rôles détenus', value: rolesHad, inline: false }
            )
            .setTimestamp();

        const logChannel = member.client.channels.cache.get(config.sdcpj.channels.logs.moderation);
        if (logChannel) logChannel.send({ embeds: [embed] }).catch(console.error);
    },
};

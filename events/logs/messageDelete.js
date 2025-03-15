const { EmbedBuilder } = require("discord.js");
const config = require("../../config.json");

module.exports = {
    name: "messageDelete",
    execute(message) {
        if (!message.guild) return;

        const embed = new EmbedBuilder()
            .setColor('Orange')
            .setTitle('Message supprimé')
            .setDescription(`Message supprimé dans ${message.channel}`)
            .addFields(
                { name: 'Auteur', value: message.author ? message.author.tag : 'Inconnu', inline: true },
                { name: 'Contenu', value: message.content ? message.content.substring(0, 1024) : 'Aucun contenu', inline: false }
            )
            .setTimestamp();

        const logChannel = message.client.channels.cache.get(config.sdcpj.channels.logs.moderation);
        if (logChannel) logChannel.send({ embeds: [embed] }).catch(console.error);
    },
};

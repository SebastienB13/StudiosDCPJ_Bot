const { EmbedBuilder } = require("discord.js");
const config = require("../../config.json");

module.exports = {
    name: "messageUpdate",
    execute(oldMessage, newMessage) {
        if (!oldMessage.content || !newMessage.content || oldMessage.content === newMessage.content) return;

        const embed = new EmbedBuilder()
            .setColor('Yellow')
            .setTitle('Message modifié')
            .setDescription(`Un message a été modifié dans ${oldMessage.channel}`)
            .addFields(
                { name: 'Avant', value: oldMessage.content.substring(0, 1024) },
                { name: 'Après', value: newMessage.content.substring(0, 1024) }
            )
            .setFooter({ text: `Modification par ${oldMessage.author.tag}`, iconURL: oldMessage.author.displayAvatarURL() })
            .setTimestamp();

        const logChannel = oldMessage.client.channels.cache.get(config.sdcpj.channels.logs.moderation);
        if (logChannel) logChannel.send({ embeds: [embed] }).catch(console.error);
    },
};

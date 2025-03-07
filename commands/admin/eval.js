const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const util = require('util');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Exécute du code JavaScript.')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('Le code à exécuter')
                .setRequired(true)
        ),

    async execute(interaction) {
        const ownerId = '481700611952214016'; // Remplace par ton ID Discord

        if (interaction.user.id !== ownerId) {
            return interaction.reply({
                content: "🚫 Tu n'as pas la permission d'utiliser cette commande.",
                ephemeral: true
            });
        }

        const code = interaction.options.getString('code');

        try {
            let result = await eval(code);
            if (typeof result !== 'string') result = util.inspect(result, { depth: 1 });

            if (result.length > 1000) result = result.slice(0, 1000) + '...'; // Tronque si trop long

            const embed = new EmbedBuilder()
                .setColor('#2F3136')
                .setTitle('📤 Exécution de code')
                .addFields(
                    { name: '📜 Code effectué :', value: `\`\`\`js\n${code}\n\`\`\`` },
                    { name: '✅ Résultat :', value: `\`\`\`js\n${result}\n\`\`\`` }
                )
                .setFooter({ text: `Demandé par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

            interaction.reply({ embeds: [embed], ephemeral: true });

        } catch (err) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setTitle('⚠️ Erreur lors de l\'exécution')
                .addFields(
                    { name: '📜 Code effectué :', value: `\`\`\`js\n${code}\n\`\`\`` },
                    { name: '❌ Erreur :', value: `\`\`\`js\n${err}\n\`\`\`` }
                )
                .setFooter({ text: `Demandé par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};

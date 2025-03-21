const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('openpublic')
        .setDescription('Gère l\'état du Open Public.')
        .addStringOption(option =>
            option.setName('etat')
                .setDescription('Définissez l\'état : ouvert ou fermé.')
                .setRequired(true)
                .addChoices(
                    { name: 'Ouvert', value: 'ouvert' },
                    { name: 'Fermé', value: 'ferme' }
                )
        ),
    async execute(interaction) {
        const etat = interaction.options.getString('etat');
        const categoryID = '1321061027739336704';
        const guild = interaction.guild;
        const category = guild.channels.cache.get(categoryID);

        if (!category) {
            return interaction.reply({ content: 'Catégorie introuvable.', ephemeral: true });
        }

        if (etat === 'ouvert') {
            // Renommer la catégorie en "OPEN PUBLIC ( OUVERT )"
            await category.setName('OPEN PUBLIC ( OUVERT )');
            return interaction.reply({ content: 'Le Open Public a été ouvert.', ephemeral: true });
        }

        if (etat === 'ferme') {
            // Renommer la catégorie en "OPEN PUBLIC ( FERMÉ )"
            await category.setName('OPEN PUBLIC ( FERMÉ )');
            return interaction.reply({ content: 'Le Open Public a été fermé.', ephemeral: true });
        }
    }
};

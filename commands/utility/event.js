const { SlashCommandBuilder, AttachmentBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('event')
        .setDescription('Gestion des événements Discord')
        .setDefaultMemberPermissions(PermissionFlagsBits.CreateEvents)
        .addSubcommand(subcommand =>
            subcommand.setName('create')
                .setDescription('Créer un nouvel événement Discord')
                .addStringOption(option =>
                    option.setName('nom')
                        .setDescription('Nom de l\'événement')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Description de l\'événement')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('debut')
                        .setDescription('Date et heure de début (JJ/MM/AAAA HH:MM)')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('fin')
                        .setDescription('Date et heure de fin (JJ/MM/AAAA HH:MM)')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('type')
                        .setDescription('Type d\'événement')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Vocal', value: 2 },
                            { name: 'Externe', value: 3 }
                        ))
                .addStringOption(option =>
                    option.setName('lieu')
                        .setDescription('Lieu (lien ou ID du salon vocal, si applicable)')
                        .setRequired(false))
                .addAttachmentOption(option =>
                    option.setName('image')
                        .setDescription('Image de l\'événement (JPG/PNG de 16:9)')
                        .setRequired(false))),
    async execute(interaction) {
        const { guild } = interaction;
        const nom = interaction.options.getString('nom');
        const description = interaction.options.getString('description');
        const debutStr = interaction.options.getString('debut');
        const finStr = interaction.options.getString('fin');
        const type = interaction.options.getInteger('type');
        const lieu = interaction.options.getString('lieu');
        const image = interaction.options.getAttachment('image');

        function parseFrenchDate(dateStr) {
            const regex = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/;
            const match = dateStr.match(regex);
            if (!match) return null;

            const [, jour, mois, annee, heures, minutes] = match.map(Number);
            return new Date(Date.UTC(annee, mois - 1, jour, heures, minutes));
        }

        const debutDate = parseFrenchDate(debutStr);
        const finDate = parseFrenchDate(finStr);

        if (!debutDate || !finDate) {
            return interaction.reply({ content: '❌ Format de date invalide. Utilisez : **JJ/MM/AAAA HH:MM** (ex : `17/02/2025 14:30`)', ephemeral: true });
        }

        if (finDate <= debutDate) {
            return interaction.reply({ content: '❌ L\'heure de fin doit être après l\'heure de début.', ephemeral: true });
        }

        try {
            const event = await guild.scheduledEvents.create({
                name: nom,
                description,
                scheduledStartTime: debutDate.toISOString(),
                scheduledEndTime: finDate.toISOString(),
                entityType: type,
                privacyLevel: 2,
                channel: type === 2 ? lieu : null,
                entityMetadata: type === 3 ? { location: lieu } : undefined,
            });

            if (image) {
                const response = await fetch(image.url);
                const buffer = await response.arrayBuffer();
                await guild.scheduledEvents.setCoverImage(event.id, Buffer.from(buffer));
            }

            interaction.reply({
                content: `✅ **Événement créé !** 🎉\n📅 **${event.name}**\n🕒 Début : <t:${Math.floor(debutDate.getTime() / 1000)}:F>\n⏳ Fin : <t:${Math.floor(finDate.getTime() / 1000)}:F>`,
                ephemeral: false
            });
        } catch (error) {
            console.error(error);
            interaction.reply({ content: '❌ Erreur lors de la création de l\'événement.', ephemeral: true });
        }
    }
};

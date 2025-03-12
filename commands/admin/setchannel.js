const { SlashCommandBuilder, PermissionFlagsBits, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setchannel')
        .setDescription("Ajoute ou enlève une permission à un rôle sur un salon ou une catégorie")
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription("Le salon ou la catégorie à modifier")
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('role')
                .setDescription("Le rôle à modifier")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('permission')
                .setDescription("Permission à modifier")
                .setRequired(true)
                .addChoices(
                    { name: 'Voir le salon', value: 'ViewChannel' },
                    { name: 'Gérer le salon', value: 'ManageChannels' },
                    { name: 'Gérer les permissions', value: 'ManagePermissions' },
                    { name: 'Envoyer des messages', value: 'SendMessages' },
                    { name: 'Envoyer des messages dans un fil', value: 'SendMessagesInThreads' },
                    { name: 'Créer un fil public', value: 'CreatePublicThreads' },
                    { name: 'Créer un fil privé', value: 'CreatePrivateThreads' },
                    { name: 'Intégrer des liens', value: 'EmbedLinks' },
                    { name: 'Joindre des fichiers', value: 'AttachFiles' },
                    { name: 'Ajouter des Réactions', value: 'AddReactions' },
                    { name: 'Utiliser des emojis externes', value: 'UseExternalEmojis' },
                    { name: 'Mentionner @everyone, @here et tous les roles', value: 'MentionEveryone' },
                    { name: 'Gérer les messages', value: 'ManageMessages' },
                    { name: 'Gérer les fils', value: 'ManageThreads' },
                    { name: 'Voir les anciens messages', value: 'ReadMessageHistory' },
                    { name: 'Se Connecter', value: 'Connect' },
                    { name: 'Parler', value: 'Speak' },
                    { name: 'Diffuser', value: 'Stream' },
                    { name: 'Utiliser la détection de voix', value: 'UseVAD' },
                    { name: 'Rendre muet des membres', value: 'MuteMembers' },
                    { name: 'Rendre sourd des membres', value: 'DeafenMembers' },
                    { name: 'Déplacer des membres', value: 'MoveMembers' },
                )
        )
        .addBooleanOption(option =>
            option.setName('enable')
                .setDescription("Activer (true) ou désactiver (false) la permission")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const role = interaction.options.getRole('role');
        const permissionName = interaction.options.getString('permission');
        const enable = interaction.options.getBoolean('enable');

        try {
            // Résolution de la permission avec PermissionsBitField
            const permission = PermissionsBitField.resolve(permissionName);

            if (!permission) {
                throw new Error('Permission invalide');
            }

            if (channel.type === 'GUILD_CATEGORY') {
                // Si le canal est une catégorie, on applique la permission sur tous les salons de la catégorie
                const categoryChannels = channel.guild.channels.cache.filter(c => c.parentId === channel.id && c.type !== 'GUILD_CATEGORY');

                for (const ch of categoryChannels.values()) {
                    await ch.permissionOverwrites.edit(role, {
                        [permission]: enable
                    });
                }

                await interaction.reply({
                    content: `✅ La permission \`${permissionName}\` a été ${enable ? 'ajoutée' : 'retirée'} pour ${role} sur tous les salons de la catégorie ${channel.name}.`,
                    ephemeral: true
                });
            } else {
                // Si le canal est un salon spécifique
                await channel.permissionOverwrites.edit(role, {
                    [permission]: enable
                });

                await interaction.reply({
                    content: `✅ La permission \`${permissionName}\` a été ${enable ? 'ajoutée' : 'retirée'} pour ${role} sur ${channel.name}.`,
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "Une erreur s'est produite lors de la modification des permissions.",
                ephemeral: true
            });
        }
    }
};

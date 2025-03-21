const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setpermission')
        .setDescription("Ajoute ou enlève une permission à un rôle")
        .addRoleOption(option =>
            option.setName('role')
                .setDescription("Le rôle à modifier")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('permission')
                .setDescription("La permission à modifier")
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option.setName('enable')
                .setDescription("Activer (true) ou désactiver (false) la permission")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Nécessite la permission de gérer les rôles

    async execute(interaction) {
        const role = interaction.options.getRole('role');
        const permissionName = interaction.options.getString('permission');
        const enable = interaction.options.getBoolean('enable');

        // Vérifier si la permission existe dans Discord.js
        if (!PermissionFlagsBits[permissionName]) {
            return interaction.reply({ content: `La permission \`${permissionName}\` est invalide.`, ephemeral: true });
        }

        try {
            if (enable) {
                await role.setPermissions(role.permissions.add(PermissionFlagsBits[permissionName]));
                await interaction.reply({ content: `✅ La permission \`${permissionName}\` a été ajoutée au rôle ${role}.`, ephemeral: true });
            } else {
                await role.setPermissions(role.permissions.remove(PermissionFlagsBits[permissionName]));
                await interaction.reply({ content: `❌ La permission \`${permissionName}\` a été retirée du rôle ${role}.`, ephemeral: true });
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "Une erreur s'est produite lors de la modification des permissions.", ephemeral: true });
        }
    }
};
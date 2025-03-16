const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Met un utilisateur en timeout.')
        .addUserOption(option =>
            option
                .setName('membre')
                .setDescription('Le membre à mettre en timeout')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('temps')
                .setDescription('Durée du timeout (ex: 10m, 1h, 2d). Maximum : 7j')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('raison')
                .setDescription('Raison du timeout')
                .setRequired(false)
        )
        // Restreint l’usage de la commande aux membres pouvant gérer les timeouts
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),

    async execute(interaction) {
        const targetMember = interaction.options.getMember('membre');
        const timeString = interaction.options.getString('temps');
        const reason = interaction.options.getString('raison') ?? 'Aucune raison fournie';

        // Fonction pour parser la durée saisie (ex: "10m", "1h", "2d")
        function parseDuration(str) {
            // Regex simple pour capturer un nombre + une lettre (s, m, h, d)
            const match = str.match(/^(\d+)([smhd])$/i);
            if (!match) return null;

            let [, amount, unit] = match;
            amount = parseInt(amount, 10);
            let ms = 0;

            switch (unit.toLowerCase()) {
                case 's': // Secondes
                    ms = amount * 1000;
                    break;
                case 'm': // Minutes
                    ms = amount * 60 * 1000;
                    break;
                case 'h': // Heures
                    ms = amount * 60 * 60 * 1000;
                    break;
                case 'd': // Jours
                    ms = amount * 24 * 60 * 60 * 1000;
                    break;
            }
            return ms;
        }

        // Conversion du format string en millisecondes
        const durationMs = parseDuration(timeString);
        if (!durationMs) {
            return interaction.reply({
                content: "Format de temps invalide. Utilisez un format comme `10m`, `1h`, `2d`…",
                ephemeral: true
            });
        }

        // Vérifie que la durée ne dépasse pas 7 jours
        const maxDuration = 7 * 24 * 60 * 60 * 1000; // 7 jours en ms
        if (durationMs > maxDuration) {
            return interaction.reply({
                content: "La durée ne peut pas dépasser 7 jours.",
                ephemeral: true
            });
        }

        // Vérifie que le membre existe bien dans le serveur
        if (!targetMember) {
            return interaction.reply({
                content: "Le membre spécifié n'est pas présent sur ce serveur.",
                ephemeral: true
            });
        }

        // Empêche de se mettre soi-même en timeout
        if (targetMember.id === interaction.user.id) {
            return interaction.reply({
                content: "Vous ne pouvez pas vous mettre vous-même en timeout.",
                ephemeral: true
            });
        }

        // Applique le timeout
        try {
            await targetMember.timeout(durationMs, reason);
        } catch (error) {
            console.error("Erreur lors de l'application du timeout :", error);
            return interaction.reply({
                content: "Impossible de mettre ce membre en timeout. Vérifiez mes permissions ou votre hiérarchie de rôle.",
                ephemeral: true
            });
        }

        // Construction de l'embed de confirmation
        const embed = new EmbedBuilder()
            .setColor('Orange')
            .setTitle('Timeout appliqué')
            .setDescription(`${targetMember} a été mis en timeout pour \`${timeString}\`.`)
            .addFields({ name: 'Raison', value: reason })
            .setTimestamp();

        // Réponse finale
        return interaction.reply({ embeds: [embed] });
    }
};

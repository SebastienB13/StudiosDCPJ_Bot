const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Permet de bannir un utilisateur')
        .addUserOption(option =>
            option
                .setName('utilisateur')
                .setDescription('Membre à bannir')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('raison')
                .setDescription('La raison du bannissement'))
        .addStringOption(option =>
            option
                .setName('durée')
                .setDescription('Durée du bannissement (ex : 7J pour 7 jours, 1M pour 1 mois, 1A pour 1 an)'))
        .addBooleanOption(option =>
            option
                .setName('informer')
                .setDescription('Informer le membre par message privé (OUI / NON)'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    
    async execute(interaction) {
        const utilisateur = interaction.options.getUser('utilisateur');
        const raison = interaction.options.getString('raison') ?? 'Aucune raison fournie';
        const duréeTexte = interaction.options.getString('durée');
        const informer = interaction.options.getBoolean('informer') ?? false;

        let duréeEnMs = null;
        if (duréeTexte) {
            const match = duréeTexte.match(/^(\d+)([JMA])$/i);
            if (match) {
                const valeur = parseInt(match[1], 10);
                const unité = match[2].toUpperCase();

                switch (unité) {
                    case 'J':
                        duréeEnMs = valeur * 24 * 60 * 60 * 1000; // Jours
                        break;
                    case 'M':
                        duréeEnMs = valeur * 30 * 24 * 60 * 60 * 1000; // Mois (approximatif)
                        break;
                    case 'A':
                        duréeEnMs = valeur * 365 * 24 * 60 * 60 * 1000; // Années (approximatif)
                        break;
                    default:
                        return interaction.reply({ content: 'Durée invalide. Utilisez J pour jours, M pour mois, A pour années.', ephemeral: true });
                }
            } else {
                return interaction.reply({ content: 'Durée invalide. Format attendu : [nombre][J/M/A], ex : 7J pour 7 jours.', ephemeral: true });
            }
        }

        const BanMemberEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('Bannissement d\'un utilisateur')
            .addFields(
                { name: 'Utilisateur banni :', value: `${utilisateur.username}`, inline: true },
                { name: 'Raison :', value: `${raison}`, inline: true },
                { name: 'Durée :', value: duréeTexte ? `${duréeTexte}` : 'Permanent', inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Banni par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

        const MPEmbed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('Vous avez été banni')
            .setDescription(`**Serveur :** ${interaction.guild.name}\n**Raison :** ${raison}\n**Durée :** ${duréeTexte ? duréeTexte : 'Permanent'}`)
            .setTimestamp();

        try {
            if (informer) {
                try {
                    await utilisateur.send({ embeds: [MPEmbed] });
                } catch {
                    console.log(`Impossible d'envoyer un MP à ${utilisateur.tag}.`);
                }
            }

            await interaction.guild.members.ban(utilisateur, { reason: raison });
            await interaction.reply({ embeds: [BanMemberEmbed] });

            // Si une durée est définie, planifier la levée du ban
            if (duréeEnMs) {
                setTimeout(async () => {
                    try {
                        await interaction.guild.members.unban(utilisateur, 'Fin de la durée du bannissement');
                        console.log(`Le bannissement de ${utilisateur.tag} a été levé.`);
                    } catch (error) {
                        console.error(`Erreur lors de la levée du bannissement pour ${utilisateur.tag} :`, error);
                    }
                }, duréeEnMs);
            }
        } catch (error) {
            console.error('Erreur lors du bannissement :', error);
            await interaction.reply({ content: 'Une erreur est survenue lors du bannissement.', ephemeral: true });
        }
    },
};

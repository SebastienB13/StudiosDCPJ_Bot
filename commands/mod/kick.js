const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Permet d\'eclure un utilisateur du serveur')
        .addUserOption(option =>
            option
                .setName('utilisateur')
                .setDescription('Membre à bannir')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('raison')
                .setDescription('La raison du bannissement'))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    
    async execute(interaction) {
        const utilisateur = interaction.options.getUser('utilisateur');
        const raison = interaction.options.getString('raison') ?? 'Aucune raison fournie';

        const KickMemberEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('Exclusion d\'un utilisateur')
            .addFields(
                { name: 'Utilisateur banni :', value: `${utilisateur.username}`, inline: true },
                { name: 'Raison :', value: `${raison}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Exclu par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

        const ErrorKickMemberEmbed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('Oups... Une erreur est survenue')
            .setDescription(`Une erreur est survenue lors de la commande /kick.\nVeuillez contacter l'administrateur système pour en savoir plus !`)
            .setTimestamp();

        try {
            await interaction.guild.members.kick(utilisateur, { reason: raison });
            await interaction.reply({ embeds: [KickMemberEmbed] });
        } catch (error) {
            console.error('Erreur lors de l\'exclusion :', error);
            await interaction.reply({ embeds: [ErrorKickMemberEmbed], ephemeral: true });
        }
    },
};

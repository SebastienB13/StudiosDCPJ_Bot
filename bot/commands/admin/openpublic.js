const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const CATEGORY_ID = "1340401984917864499";
const CHANNELS = [
    "1340402101284503583", // chat-hrp
    "1340402158448934982", // Vocal HRP
    "1340402213662490654", // Vocal RP1
    "1340402233157746739", // Vocal RP2
    "1340402279420788827"  // Vocal RP3
];

const ROLE_PERMISSIONS = {
    all: ["1340400365954138195", "1340400318529278043", "1340400265060290571"],
    vip: ["1340400318529278043"],
    membre: ["1340400265060290571"]
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('openpublic')
        .setDescription("Ouvre ou ferme l'accès à la catégorie publique")
        .addStringOption(option =>
            option.setName('option')
                .setDescription('Ouvrir ou fermer la catégorie')
                .setRequired(true)
                .addChoices(
                    { name: 'Ouvert', value: 'ouvert' },
                    { name: 'Fermé', value: 'ferme' }
                )
        )
        .addStringOption(option =>
            option.setName('permissions')
                .setDescription('Choisir qui peut accéder aux salons')
                .addChoices(
                    { name: 'Tous', value: 'all' },
                    { name: 'VIP', value: 'vip' },
                    { name: 'Membres', value: 'membre' }
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        const option = interaction.options.getString('option');
        const permissionsOption = interaction.options.getString('permissions');
        const guild = interaction.guild;
        const category = guild.channels.cache.get(CATEGORY_ID);

        if (!category) return interaction.reply({ content: "Catégorie introuvable !", ephemeral: true });

        // Modifier le nom de la catégorie
        await category.setName(`OPEN PUBLIC ( ${option.toUpperCase()} )`);

        // Modifier les permissions des salons si une option est donnée
        if (permissionsOption) {
            const rolesToAllow = ROLE_PERMISSIONS[permissionsOption] || [];
            const overwrites = rolesToAllow.map(roleId => ({ id: roleId, allow: [PermissionFlagsBits.ViewChannel] }));

            for (const channelId of CHANNELS) {
                const channel = guild.channels.cache.get(channelId);
                if (channel) {
                    await channel.permissionOverwrites.set(overwrites);
                }
            }
        }

        await interaction.reply({ content: `Catégorie mise à jour : **OPEN PUBLIC ( ${option.toUpperCase()} )**`, ephemeral: false });
    }
};

const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prison')
        .setDescription('Outil de modération du Discord Studios DCPJ Public')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
        .addSubcommand(subcommand =>
            subcommand.setName('ajouter')
                .setDescription("Ajouter une personne en prison dorée")
                .addUserOption(option =>
                    option.setName('membre')
                        .setDescription("Le membre à envoyer en prison")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('raison')
                        .setDescription("La raison de l'emprisonnement")
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('retirer')
                .setDescription("Retirer une personne de la prison dorée")
                .addUserOption(option =>
                    option.setName('membre')
                        .setDescription("Le membre à libérer")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('raison')
                        .setDescription("La raison de la libération")
                        .setRequired(false)
                )
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const membre = interaction.options.getMember('membre');
        const raison = interaction.options.getString('raison') || "par mesure de sécurité";
        const prisonRoleId = "577187713497956353";
        const accessRoleId = "1340400365954138195";
        const prisonChannelId = "1341932436099170355";

        if (!membre) return interaction.reply({ content: "Membre introuvable.", ephemeral: true });

        if (subcommand === 'ajouter') {
            if (membre.roles.cache.has(prisonRoleId)) {
                return interaction.reply({ content: `${membre} est déjà en prison dorée.`, ephemeral: true });
            }

            await membre.roles.add(prisonRoleId);
            await membre.send(`Vous avez été placé en <#${prisonChannelId}> pour le motif : **${raison}**.`).catch(() => { });

            interaction.guild.channels.cache.forEach(channel => {
                if (channel.permissionsFor(accessRoleId)?.has(PermissionsBitField.Flags.SendMessages)) {
                    channel.permissionOverwrites.edit(membre, { SendMessages: false }).catch(() => { });
                }
            });

            return interaction.reply({ content: `${membre} a été placé en prison dorée.`, ephemeral: true });
        }

        if (subcommand === 'retirer') {
            if (!membre.roles.cache.has(prisonRoleId)) {
                return interaction.reply({ content: `${membre} n'est pas en prison dorée.`, ephemeral: true });
            }

            await membre.roles.remove(prisonRoleId);
            await membre.send("La vérification a été effectuée. Vous pouvez à nouveau parler dans l'ensemble des salons du Discord.").catch(() => { });

            interaction.guild.channels.cache.forEach(channel => {
                if (channel.permissionsFor(accessRoleId)?.has(PermissionsBitField.Flags.SendMessages)) {
                    channel.permissionOverwrites.edit(membre, { SendMessages: null }).catch(() => { });
                }
            });

            return interaction.reply({ content: `${membre} a été libéré de la prison dorée.`, ephemeral: true });
        }
    }
};

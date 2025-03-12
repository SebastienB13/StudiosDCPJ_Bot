const {
    ChannelType,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');
// Importer votre connexion MySQL
const db = require('../database/database');

// Map pour suivre les tickets actifs par utilisateur
const activeTickets = new Map();

function initTicketSystem(client) {
    // --- 1. Envoi de l'embed initial dans le salon ticket ---
    client.once('ready', async () => {
        const ticketChannel = client.channels.cache.get('ID_DU_SALON_TICKET'); // Remplacez par l'ID de votre salon
        if (!ticketChannel) return console.error("Salon ticket non trouvé !");

        const ticketEmbed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('Système de Ticket')
            .setDescription('Cliquez sur le bouton ci-dessous pour ouvrir un ticket en MP.');

        const button = new ButtonBuilder()
            .setCustomId('open_ticket')
            .setLabel('Ouvrir un ticket')
            .setStyle('Primary');

        const row = new ActionRowBuilder().addComponents(button);

        await ticketChannel.send({ embeds: [ticketEmbed], components: [row] });
    });

    // --- 2. Gestion des interactions ---
    client.on('interactionCreate', async interaction => {
        // Bouton dans le salon ticket
        if (interaction.isButton() && interaction.customId === 'open_ticket') {
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('Blue')
                    .setTitle('Création de Ticket')
                    .setDescription('Veuillez choisir la catégorie de votre ticket :');

                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('ticket_category')
                    .setPlaceholder('Sélectionnez une catégorie')
                    .addOptions([
                        { label: 'Support Général', value: 'general' },
                        { label: 'Recrutement en Jeu', value: 'recrutement_jeu' },
                        { label: 'Recrutement Opérateurs', value: 'recrutement_ope' }
                    ]);

                const row = new ActionRowBuilder().addComponents(selectMenu);

                await interaction.user.send({ embeds: [dmEmbed], components: [row] });
                await interaction.reply({ content: 'Consultez vos MP pour créer votre ticket.', ephemeral: true });
            } catch (err) {
                console.error("Erreur d'envoi de MP :", err);
                await interaction.reply({ content: "Impossible d'envoyer un MP. Vérifiez vos paramètres de confidentialité.", ephemeral: true });
            }
        }

        // Sélection dans le menu dans les MP
        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_category') {
            if (interaction.channel.type !== ChannelType.DM) return;

            const categoryValue = interaction.values[0]; // "general", "recrutement_jeu" ou "recrutement_ope"

            // Vérifier si l'utilisateur a déjà un ticket actif
            if (activeTickets.has(interaction.user.id)) {
                return interaction.reply({ content: "Vous avez déjà un ticket ouvert.", ephemeral: true });
            }

            // Paramètres en fonction de la catégorie choisie
            let categoryName, allowedRoleIDs;
            if (categoryValue === 'general') {
                categoryName = 'TICKETS - GENERAL';
                allowedRoleIDs = ['1340399852508676137', '1340399660220813433', '1340399080152629389', '1340399325129474118', '1340399293533655050', '1340399233014038711'];
            } else if (categoryValue === 'recrutement_jeu') {
                categoryName = 'TICKETS - RECRUTEMENT JEU';
                allowedRoleIDs = ['1340399932678340763', '1340399660220813433', '1340399080152629389', '1340399325129474118', '1340399293533655050', '1340399233014038711'];
            } else if (categoryValue === 'recrutement_ope') {
                categoryName = 'TICKETS - RECRUTEMENTS OPE';
                allowedRoleIDs = ['1340399976307495085', '1340399660220813433', '1340399080152629389', '1340399325129474118', '1340399293533655050', '1340399233014038711'];
            }

            // Récupérer la guilde (on suppose ici que le bot est dans une seule guilde)
            const guild = client.guilds.cache.first();
            if (!guild) return interaction.reply({ content: "Aucune guilde trouvée.", ephemeral: true });

            // Vérifier ou créer la catégorie de tickets
            let ticketCategory = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name === categoryName);
            if (!ticketCategory) {
                try {
                    ticketCategory = await guild.channels.create({
                        name: categoryName,
                        type: ChannelType.GuildCategory
                    });
                } catch (err) {
                    console.error("Erreur lors de la création de la catégorie :", err);
                    return interaction.reply({ content: "Erreur lors de la création de la catégorie de ticket.", ephemeral: true });
                }
            }

            // Créer le salon ticket dans la catégorie (nommé ticket-username)
            const channelName = `ticket-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
            try {
                const ticketChannel = await guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildText,
                    parent: ticketCategory.id,
                    permissionOverwrites: [
                        // Refuser l'accès à tout le monde
                        { id: guild.id, deny: ['ViewChannel'] },
                        // L'utilisateur ne voit pas ce salon en guilde
                        { id: interaction.user.id, deny: ['ViewChannel'] },
                        // Seuls les rôles autorisés peuvent voir et écrire
                        ...allowedRoleIDs.map(roleId => ({
                            id: roleId,
                            allow: ['ViewChannel', 'SendMessages']
                        }))
                    ]
                });

                // Marquer le ticket comme actif pour cet utilisateur
                activeTickets.set(interaction.user.id, ticketChannel.id);

                // Insertion dans la base de données
                db.query(
                    `INSERT INTO tickets (ticket_channel, user_id, category, status, created_at) VALUES (?, ?, ?, 'open', NOW())`,
                    [ticketChannel.id, interaction.user.id, categoryValue],
                    (err, results) => {
                        if (err) console.error("Erreur lors de l'insertion du ticket en base :", err);
                        else console.log("Ticket créé en base, ID :", results.insertId);
                    }
                );

                await interaction.reply({ content: `Votre ticket a été créé dans la catégorie **${categoryName}**.`, ephemeral: true });
            } catch (err) {
                console.error("Erreur lors de la création du salon ticket :", err);
                return interaction.reply({ content: "Erreur lors de la création de votre ticket.", ephemeral: true });
            }
        }
    });
}

module.exports = { initTicketSystem };

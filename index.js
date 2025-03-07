const { ActivityType, Client, Collection, GatewayIntentBits, Events, EmbedBuilder, Partials } = require("discord.js");
const Parser = require('rss-parser');
const parser = new Parser();
const fs = require("fs");
const path = require("path");
const config = require("./config.json");
const db = require('./database/database');

const client = new Client({
  intents: [
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.DirectMessagePolls,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildExpressions,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessagePolls,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.GuildScheduledEvent,
    Partials.Message,
    Partials.Reaction,
    Partials.ThreadMember,
    Partials.User,
  ],
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

//
//
// LOGS
//
//

// Remplacez par l'ID de votre salon de logs
const LOG_CHANNEL_ID = config.sdcpj.channels.logs.moderation;

/**
 * Fonction utilitaire pour envoyer l'embed dans le salon de logs.
 * @param {Client} client - Votre instance de bot.
 * @param {EmbedBuilder} embed - L'embed à envoyer.
 */

function sendLog(client, embed) {
  const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
  if (logChannel) {
    logChannel.send({ embeds: [embed] }).catch(console.error);
  }
}

// --- Événement : Arrivée d'un membre ---
client.on('guildMemberAdd', member => {
  // Convertit la date de création du compte en timestamp (secondes)
  const creationTimestamp = Math.floor(member.user.createdAt.getTime() / 1000);

  // Liste les rôles du membre (hors @everyone)
  const rolesObtained = member.roles.cache
    .filter(role => role.id !== member.guild.id)
    .map(role => role.toString())
    .join(', ') || "Aucun rôle";

  const embed = new EmbedBuilder()
    .setColor('Green')
    .setTitle('Nouveau membre')
    .setDescription(`<@${member.user.id}> a rejoint le serveur.`)
    .setThumbnail(member.user.displayAvatarURL())
    .addFields(
      {
        name: "Identifiant de l'utilisateur",
        value: member.user.id,
        inline: true
      },
      {
        name: 'Création du compte',
        value: `<t:${creationTimestamp}:F>`,
        inline: true
      },
      {
        name: 'Rôles',
        value: rolesObtained,
        inline: false
      }
    )
    .setTimestamp();

  // Envoie l'embed dans le salon de logs (fonction personnalisée)
  sendLog(member.client, embed);
});


// --- Événement : Départ d'un membre ---
client.on('guildMemberRemove', member => {
  // Récupérer le timestamp de la date d'arrivée en secondes
  const joinTimestamp = member.joinedAt ? Math.floor(member.joinedAt.getTime() / 1000) : 'Inconnue';

  // Récupérer les rôles détenus par le membre (excluant @everyone)
  const rolesHad = member.roles.cache
    .filter(role => role.id !== member.guild.id)
    .map(role => role.toString())
    .join(', ') || "Aucun rôle";

  const embed = new EmbedBuilder()
    .setColor('Red')
    .setTitle('Membre parti')
    .setDescription(`${member.user.tag} a quitté le serveur.`)
    .setThumbnail(member.user.displayAvatarURL())
    .addFields(
      { name: 'Date de rejoint', value: joinTimestamp !== 'Inconnue' ? `<t:${joinTimestamp}:F>` : 'Inconnue', inline: true },
      { name: 'Rôles détenus', value: rolesHad, inline: false }
    )
    .setTimestamp();

  sendLog(member.client, embed);
});


// --- Événement : Message supprimé ---
client.on('messageDelete', message => {
  // On vérifie que le message vient d'un serveur
  if (!message.guild) return;

  const embedMessageDelete = new EmbedBuilder()
    .setColor('Orange')
    .setTitle('Message supprimé')
    .setDescription(`Message supprimé dans ${message.channel}`)
    .addFields({
      name: 'Auteur',
      value: message.author ? message.author.tag : 'Inconnu',
      inline: true
    }, {
      name: 'Contenu',
      value: message.content ? message.content.substring(0, 1024) : 'Aucun contenu',
      inline: false
    })
    .setTimestamp();
  sendLog(message.client, embedMessageDelete);
});

// --- Événement : Moderation - Ban d'un membre ---
client.on('guildBanAdd', async ban => {
  try {
    // Récupération des logs d'audit pour déterminer le modérateur et la raison
    const fetchedLogs = await ban.guild.fetchAuditLogs({
      limit: 1,
      type: 'MEMBER_BAN_ADD',
    });
    const banLog = fetchedLogs.entries.first();
    const moderator = banLog ? banLog.executor : { tag: 'Inconnu', id: 'Inconnu' };
    const reason = banLog && banLog.reason ? banLog.reason : 'Aucune raison fournie';

    const embedGuildBanAdd = new EmbedBuilder()
      .setColor('DarkRed')
      .setTitle('Membre banni')
      .setDescription(`${ban.user.tag} a été banni du serveur.`)
      .addFields(
        { name: 'Modérateur', value: `<@${moderator.id}>`, inline: true },
        { name: 'Raison', value: reason, inline: false }
      )
      .setThumbnail(ban.user.displayAvatarURL())
      .setTimestamp();

    sendLog(ban.guild.client, embedGuildBanAdd);
  } catch (error) {
    console.error('Erreur lors de la récupération des logs d\'audit :', error);
  }
});


// --- Événement : Mise à jour d'un salon ---
/**
 * Compare les PermissionOverwrites entre l'ancien et le nouveau salon et retourne une chaîne décrivant les différences.
 * @param {GuildChannel['permissionOverwrites']} oldOverwrites - Les permissions avant modification.
 * @param {GuildChannel['permissionOverwrites']} newOverwrites - Les permissions après modification.
 * @returns {string} Une chaîne décrivant les changements, ou une chaîne vide s'il n'y a aucun changement.
 */
function diffPermissionOverwrites(oldOverwrites, newOverwrites) {
  let changes = [];

  // Itération sur les nouveaux overwrites
  newOverwrites.cache.forEach(newOverwrite => {
    const oldOverwrite = oldOverwrites.cache.get(newOverwrite.id);
    if (!oldOverwrite) {
      // Nouvel overwrite ajouté
      changes.push(`**Nouvelle permission pour** ${newOverwrite.type} (ID: ${newOverwrite.id}):\n- Allowed: ${newOverwrite.allow.toArray().join(', ') || 'Aucun'}\n- Denied: ${newOverwrite.deny.toArray().join(', ') || 'Aucun'}`);
    } else {
      // Comparaison des overwrites existants
      const oldAllow = oldOverwrite.allow.toArray();
      const newAllow = newOverwrite.allow.toArray();
      const oldDeny = oldOverwrite.deny.toArray();
      const newDeny = newOverwrite.deny.toArray();
      if (JSON.stringify(oldAllow) !== JSON.stringify(newAllow) || JSON.stringify(oldDeny) !== JSON.stringify(newDeny)) {
        changes.push(`**Modification pour** ${newOverwrite.type} (ID: ${newOverwrite.id}):\n- Avant: Allowed: ${oldAllow.join(', ') || 'Aucun'}, Denied: ${oldDeny.join(', ') || 'Aucun'}\n- Après: Allowed: ${newAllow.join(', ') || 'Aucun'}, Denied: ${newDeny.join(', ') || 'Aucun'}`);
      }
    }
  });

  // Vérifier les overwrites supprimés
  oldOverwrites.cache.forEach(oldOverwrite => {
    if (!newOverwrites.cache.has(oldOverwrite.id)) {
      changes.push(`**Permission supprimée pour** ${oldOverwrite.type} (ID: ${oldOverwrite.id}):\n- Avant: Allowed: ${oldOverwrite.allow.toArray().join(', ') || 'Aucun'}, Denied: ${oldOverwrite.deny.toArray().join(', ') || 'Aucun'}`);
    }
  });

  return changes.join('\n');
}


client.on('channelUpdate', (oldChannel, newChannel) => {
  const embedChannelUpdate = new EmbedBuilder()
    .setColor('Blue')
    .setTitle('Modification de salon')
    .setTimestamp();

  // Affiche l'ancien et le nouveau nom uniquement si le nom a changé
  if (oldChannel.name !== newChannel.name) {
    embedChannelUpdate.addFields(
      { name: 'Avant', value: oldChannel.name, inline: true },
      { name: 'Après', value: newChannel.name, inline: true }
    );
    embedChannelUpdate.setDescription(`Le nom du salon a été modifié.`);
  } else {
    // Sinon, indique simplement que le salon a été modifié
    embedChannelUpdate.setDescription(`Le salon **${newChannel.name}** a été modifié.`);
  }

  // Récupération et ajout des modifications de permissions, si présentes
  const permissionChanges = diffPermissionOverwrites(oldChannel.permissionOverwrites, newChannel.permissionOverwrites);
  if (permissionChanges) {
    embedChannelUpdate.addFields({ name: 'Permissions modifiées', value: permissionChanges });
  }

  sendLog(newChannel.client, embedChannelUpdate);
});


// --- Modification d'un message ---
client.on('messageUpdate', (oldMessage, newMessage) => {
  // Vérifier que le message n'est pas partiel et que le contenu a bien changé
  if (oldMessage.partial || newMessage.partial) return;
  if (!oldMessage.content || !newMessage.content) return;
  if (oldMessage.content === newMessage.content) return;

  const embedMessageUpdate = new EmbedBuilder()
    .setColor('Yellow')
    .setTitle('Message modifié')
    .setDescription(`Un message a été modifié dans ${oldMessage.channel}`)
    .addFields(
      { name: 'Avant', value: oldMessage.content.substring(0, 1024) },
      { name: 'Après', value: newMessage.content.substring(0, 1024) }
    )
    .setFooter({ text: `Modification par ${oldMessage.author.tag}`, iconURL: oldMessage.author.displayAvatarURL() })
    .setTimestamp();
  sendLog(oldMessage.client, embedMessageUpdate);
});

// --- Creation de role ---
client.on('roleCreate', role => {
  // Récupérer tous les drapeaux de permission disponibles
  const allPerms = Object.keys(PermissionsBitField.Flags);
  const activePerms = [];
  const neutralPerms = [];

  // Pour chaque permission, on vérifie si le rôle l'a activée
  allPerms.forEach(perm => {
    if (role.permissions.has(perm)) {
      activePerms.push(perm);
    } else {
      neutralPerms.push(perm);
    }
  });

  // Préparer les chaînes de caractères pour l'embed
  let activeString = activePerms.join(', ');
  if (!activeString) activeString = "Aucune";
  else if (activeString.length > 1024) activeString = activeString.substring(0, 1021) + '...';

  let neutralString = neutralPerms.join(', ');
  if (!neutralString) neutralString = "Aucune";
  else if (neutralString.length > 1024) neutralString = neutralString.substring(0, 1021) + '...';

  const refusedPerms = "Aucune permission refusée"; // Pour un rôle, ce champ n'est pas applicable

  const embedRoleCreate = new EmbedBuilder()
    .setColor('Green')
    .setTitle('Rôle créé')
    .setDescription(`Le rôle **${role.name}** a été créé.`)
    .addFields(
      { name: 'ID', value: role.id, inline: true },
      { name: 'Couleur', value: role.hexColor, inline: true },
      { name: 'Permissions actives', value: activeString, inline: false },
      { name: 'Permissions neutres', value: neutralString, inline: false },
      { name: 'Permissions refusées', value: refusedPerms, inline: false }
    )
    .setTimestamp();

  sendLog(role.client, embedRoleCreate);
});


// --- Role supprimé ---
client.on('roleDelete', role => {
  const embedRoleDelete = new EmbedBuilder()
    .setColor('Red')
    .setTitle('Rôle supprimé')
    .setDescription(`Le rôle **${role.name}** a été supprimé.`)
    .addFields(
      { name: 'ID', value: role.id, inline: true },
      { name: 'Couleur', value: role.hexColor, inline: true }
    )
    .setTimestamp();
  sendLog(role.client, embedRoleDelete);
});

// --- Modification du serveur ---
client.on('guildUpdate', (oldGuild, newGuild) => {
  let description = '';
  if (oldGuild.name !== newGuild.name) {
    description += `**Nom**: ${oldGuild.name} → ${newGuild.name}\n`;
  }
  if (oldGuild.description !== newGuild.description) {
    description += `**Description**: ${oldGuild.description || 'Aucune'} → ${newGuild.description || 'Aucune'}\n`;
  }
  // Vous pouvez ajouter d'autres comparaisons de propriétés ici...

  const embedGuildUpdate = new EmbedBuilder()
    .setColor('Blue')
    .setTitle('Mise à jour du serveur')
    .setDescription(description || 'Aucun changement notable détecté.')
    .setTimestamp();
  sendLog(newGuild.client, embedGuildUpdate);
});

client.login(config.token);

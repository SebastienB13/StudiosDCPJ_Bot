const { ActivityType, Events, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const config = require('../config.json');

const FIVEM_SERVER_IP = "serveur.studiosdcpj.org";
const FIVEM_SERVER_PORT = "30120"; // Remplace par le bon port si différent

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    let playerCount = 0; // Stocke le nombre de joueurs actuels

    async function fetchPlayerCount() {
      try {
        const response = await axios.get(`http://${FIVEM_SERVER_IP}:${FIVEM_SERVER_PORT}/players.json`);
        playerCount = response.data.length;
      } catch (error) {
        console.error("[BOT] Erreur lors de la récupération du nombre de joueurs:", error.message);
        playerCount = "N/A"; // Si erreur, afficher "N/A"
      }
    }

    const activities = [
      { name: "Studios DCPJ", type: ActivityType.Playing },
      { name: "les logs", type: ActivityType.Watching },
      { name: "les nouveaux arrivants", type: ActivityType.Watching },
      { name: "les tickets", type: ActivityType.Watching },
      { name: "les membres", type: ActivityType.Listening },
      { name: "les stats YouTube", type: ActivityType.Watching },
      { name: () => `${playerCount} joueurs en ligne`, type: ActivityType.Watching }, // Ajout du nombre de joueurs
    ];

    let currentIndex = 0;

    function updateActivity() {
      if (client.user) {
        const activity = activities[currentIndex];
        const activityName = typeof activity.name === "function" ? activity.name() : activity.name;
        client.user.setActivity(activityName, { type: activity.type });
        currentIndex = (currentIndex + 1) % activities.length;
      } else {
        console.error("client.user est toujours null.");
      }
    }

    console.log(`Ready! Logged in as ${client.user.tag}`);

    updateActivity();
    client.user.setStatus("online");

    setInterval(updateActivity, 5000); // Change d'activité toutes les 5 sec
    setInterval(fetchPlayerCount, 30000); // Met à jour le nombre de joueurs toutes les 30 sec

    // EMBED BOT ONLINE
    /*
        const channelId = config.sdcpj.channels.logs.statusChannelId;
    
        const channel = client.channels.cache.get(channelId);
        if (!channel) {
          console.log(`❌ Le salon avec l'ID ${channelId} est introuvable.`);
          return;
        }
        
            // Création de l'embed
            const embed = new EmbedBuilder()
              .setColor("Green")
              .setTitle(`${client.user.username} est en ligne !`)
              .setDescription("Le bot est prêt à fonctionner 🚀")
              .setTimestamp();
        
            channel.send({ embeds: [embed] }).catch(console.error);
        */
  },
};

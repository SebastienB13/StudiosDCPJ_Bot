const { ActivityType, Events, EmbedBuilder } = require("discord.js");
const config = require('../config.json');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    const activities = [
      { name: "Studios DCPJ", type: ActivityType.Playing },
      { name: "les logs", type: ActivityType.Watching },
      { name: "les nouveaux arrivants", type: ActivityType.Watching },
      { name: "les tickets", type: ActivityType.Watching },
      { name: "les membres", type: ActivityType.Listening },
      { name: "les stats YouTube", type: ActivityType.Watching },
      { name: "Studios DCPJ", type: ActivityType.Playing },
    ];

    let currentIndex = 0;

    function updateActivity() {
      if (client.user) {
        const activity = activities[currentIndex];
        client.user.setActivity(activity.name, { type: activity.type });
        currentIndex = (currentIndex + 1) % activities.length;
      } else {
        console.error("client.user est toujours null.");
      }
    }

    console.log(`Ready! Logged in as ${client.user.tag}`);

    updateActivity();
    client.user.setStatus("online");

    setInterval(updateActivity, 5000);

    // EMBED BOT ONLINE

    const channelId = config.sdcpj.channels.logs.statusChannelId;

    const channel = client.channels.cache.get(channelId);
    if (!channel) {
      console.log(`❌ Le salon avec l'ID ${channelId} est introuvable.`);
      return;
    }
    /*
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

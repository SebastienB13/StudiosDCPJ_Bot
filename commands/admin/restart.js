const { exec } = require("child_process");

module.exports = {
    name: "restart",
    description: "Redémarre le bot.",
    execute(interaction) {
        const ownerId = "481700611952214016";

        if (interaction.user.id !== ownerId) {
            return interaction.reply("❌ Tu n'as pas la permission d'exécuter cette commande.");
        }

        interaction.reply("🔄 Redémarrage en cours...").then(() => {
            process.exit(1); // Arrête le bot, un script externe doit le relancer
        });
    },
};

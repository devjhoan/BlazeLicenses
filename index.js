const { Client, Collection } = require("discord.js");
const fs = require("fs");
const yaml = require("js-yaml");

const client = new Client({
    intents: 32767,
});
module.exports = client;

// Global Variables
client.commands = new Collection();
client.permissions = [];
client.config = yaml.load(fs.readFileSync("config/config.yml", "utf8"), 4);
client.noRegister = (interaction) => {
    return interaction.reply({embeds: [
        new MessageEmbed()
            .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
            .setTitle("❌ You are not registered!")
            .setDescription("You need have a user registered for use this command!")
            .setFooter({text: "Blaze Licenses"})
            .setColor("RED")
    ], ephemeral: true});
}

// Initializing the project
require("./handler")(client);

client.login(client.config.BOT_CONFIG.TOKEN);
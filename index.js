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

// Initializing the project
require("./handler")(client);

client.login(client.config.BOT_CONFIG.TOKEN);
const { Blaze } = require("./typings/Client");

const client = new Blaze();
module.exports = client;

// Initializing the project
require("./handler")(client);

client.login(client.config.BOT_CONFIG.TOKEN);
const { Client, Collection, MessageEmbed } = require("discord.js");
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
client.commandsFile = yaml.load(fs.readFileSync("config/commands.yml", "utf8"), 4);
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
client.checkPermissions = (message, command, reply = "reply") => {
	if (!client.commandsFile.PERMISSIONS[command]) {
		console.error("\u001b[31m[ERROR]\u001b[0m Permissions for command " + command + " not found.");
        message[reply]("This command doesn't have any permissions.");
		return false;
	}
    if (!message.member.roles.cache.some(r => client.commandsFile.PERMISSIONS[command].includes(r.name)) && !message.member.roles.cache.some(r => client.commandsFile.PERMISSIONS[command].includes(r.id))) {
        message[reply]({embeds: [
            new MessageEmbed()
                .setAuthor({ name: `Request by ${message.member.user.username}`, iconURL: message.member.user.avatarURL() })
                .setDescription("You do not have sufficient permissions to execute this command.")
                .setColor("RED")
        ], ephemeral: true});
		return false;
	} else return true
}

// Initializing the project
require("./handler")(client);

client.login(client.config.BOT_CONFIG.TOKEN);
const { Client, Collection, MessageEmbed } = require("discord.js");
const yaml = require("js-yaml");
const fs = require("fs");

/**
 * I can code in a better way, but I'm not sure how to do it.
 * @typedef {Blaze} Blaze
 * @extends {Client}
 */
class Blaze extends Client {
    constructor() {
        super({
            intents: 32767
        });

        this.commands = new Collection();
        checkFile("config/config.yml", "config/config.example.yml");
        this.config = yaml.load(fs.readFileSync("config/config.yml", "utf8"), 4);
        this.commandsFile = yaml.load(fs.readFileSync("config/commands.yml", "utf8"), 4);
        this.noRegister = (interaction) => {
            return interaction.reply({embeds: [
                new MessageEmbed()
                    .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                    .setTitle("❌ You are not registered!")
                    .setDescription("You need have a user registered for use this command!")
                    .setFooter({text: "Blaze Licenses"})
                    .setColor("RED")
            ], ephemeral: true});
        }
        this.checkPermissions = (message, command, reply = "reply") => {
            if (!this.commandsFile.PERMISSIONS[command]) {
                console.error("\u001b[31m[ERROR]\u001b[0m Permissions for command " + command + " not found.");
                message[reply]("This command doesn't have any permissions.");
                return false;
            }
            if (!message.member.roles.cache.some(r => this.commandsFile.PERMISSIONS[command].includes(r.name)) && !message.member.roles.cache.some(r => this.commandsFile.PERMISSIONS[command].includes(r.id))) {
                message[reply]({embeds: [
                    new MessageEmbed()
                        .setAuthor({ name: `Request by ${message.member.user.username}`, iconURL: message.member.user.avatarURL() })
                        .setDescription("You do not have sufficient permissions to execute this command.")
                        .setColor("RED")
                ], ephemeral: true});
                return false;
            } else return true
        }
    }
};

function checkFile(file, clone) {
    const check = fs.existsSync(file);
    if (!check) {
        console.error(`\u001b[31m[ERROR]\u001b[0m ${file} not found.`);
        const cloneFile = fs.readFileSync(clone, "utf8");
        fs.writeFileSync(file, cloneFile, "utf8");
        console.log(`\u001b[32m[INFO]\u001b[0m ${file} created.\nPlease edit it.`);
        process.exit(1);
    } else {
        return true;
    }
}

module.exports = { Blaze };
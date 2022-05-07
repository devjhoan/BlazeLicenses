const { connect } = require('mongoose');
const { promisify } = require("util");
const { glob } = require("glob");
const globPromise = promisify(glob);
const chalk = require('chalk');

/**
 * 
 * @param {import('../typings/Client').Blaze} client 
 */
module.exports = async (client) => {
    // Events
    console.log(chalk.cyan.bold('EVENTS STATUS━━━━━━━━━━━━━━━━━━━━┓'));
    const eventFiles = await globPromise(`${process.cwd()}/events/*.js`);
    eventFiles.map((value) => {
        require(value);
        let eventName = value.split("/")[value.split("/").length - 1].split(".")[0];
        console.log(`${chalk.cyan.bold('┃')} Loaded: ✅ ${chalk.cyan.bold('┃')} ${eventName}`);
    });
    console.log(chalk.cyan.bold('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'));

    // Slash Commands
    console.log(chalk.yellow.bold('SLASH COMMANDS━━━━━━━━━━━━━━━━━━━┓'));
    const slashCommands = await globPromise(
        `${process.cwd()}/commands/*.js`
    );

    const CommandsArray = [];
    slashCommands.map((value) => {
        const file = require(value);
        const cmdName = file.name ? file.name : "No name";
        const cmdOption = file.name ? "✅" : "❌";
        
        client.commands.set(file.name, file);

        CommandsArray.push(file);
        console.log(`${chalk.yellow.bold('┃')} Loaded: ${cmdOption} ${chalk.yellow.bold('┃')} ${cmdName}`);
    });
    console.log(chalk.yellow.bold('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'));
    
    client.on("ready", async () => {
        const guild = client.guilds.cache.get(client.config.BOT_CONFIG.GUILD_ID);
        console.log(chalk.red.bold('BOT INFO━━━━━━━━━━━━━━━━━━━━━━━━━┓'));
        console.log(`${chalk.red.bold('┃')} Logged in ${client.user.tag}`);
        connect(client.config.MONGO_URI).then(() => {
            console.log(`${chalk.red.bold('┃')} Connected to MongoDB`);
        }).catch(() => {
            console.log(`${chalk.red.bold('┃')} Error connecting to MongoDB`);
            process.exit(1);
        });
        console.log(chalk.red.bold('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'));
        await guild.commands.set(CommandsArray).catch((error) => {
            console.log(chalk.red.bold('BOT ERROR━━━━━━━━━━━━━━━━━━━━━━━━━┓'));
            console.log(`${chalk.red.bold('┃')} ${error}`);
            console.log(`${chalk.red.bold('┃')} strider.cloud/discord`);
            console.log(chalk.red.bold('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'));
        });
        require("../api/app");
    });
};
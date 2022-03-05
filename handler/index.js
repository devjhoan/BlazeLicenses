const { loadPermissions } = require("../functions/Utils");
const { glob } = require("glob");
const { promisify } = require("util");
const mongoose = require("mongoose");
const globPromise = promisify(glob);
const chalk = require('chalk');

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
        let cmdName;
        let cmdOption;
        if (!file?.name) return cmdName = 'No cmd name', cmdOption = '❌';
        else {
            cmdName = file.name;
            cmdOption = '✅';
        }
        
        client.commands.set(file.name, file);

        if (["MESSAGE", "USER"].includes(file.type)) delete file.description;
        CommandsArray.push(file);
        client.permissions.push(file);
        console.log(`${chalk.yellow.bold('┃')} Loaded: ${cmdOption} ${chalk.yellow.bold('┃')} ${cmdName}`);
    });
    console.log(chalk.yellow.bold('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'));
    
    client.on("ready", async () => {
        const MONGO_URI = client.config.BOT_CONFIG.MONGO_URI;
        console.log(chalk.red.bold('BOT INFO━━━━━━━━━━━━━━━━━━━━━━━━━┓'));
        console.log(`${chalk.red.bold('┃')} Logged in ${client.user.tag}`);
        if (MONGO_URI) await mongoose.connect(MONGO_URI).then(() => console.log(`${chalk.red.bold('┃')} Connected to MongoDB`));
        
        const guild = client.guilds.cache.get(client.config.BOT_CONFIG.GUILD_ID);
        await loadPermissions(guild, client).then((x) => {
            console.log(chalk.red.bold('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'));
        }).catch((error) => {
            console.log(chalk.red.bold('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'));
            console.log(chalk.red.bold('BOT ERROR━━━━━━━━━━━━━━━━━━━━━━━━━┓'));
            console.log(`${chalk.red.bold('┃')} ${error}`);
            console.log(chalk.red.bold('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'));
        })
        require("../api/app");
    });
};
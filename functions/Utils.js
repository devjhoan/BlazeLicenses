const { Client, MessageActionRow, MessageButton, Message, CommandInteraction, Guild } = require("discord.js")
const ms = require("ms")

/**
 * 
 * @param {Guild} guild 
 * @param {Client} client 
 * @returns 
 */
async function loadPermissions(guild, client) {
    return new Promise(async (resolve, reject) => {
        try {
            const commandsLoaded = [];
            const CommandsArray = client.permissions;
            await guild.commands.set(CommandsArray).then((cmd) => {
                const fileCommands = client.commandsFile;
                const getRoles = (command_name) => {
                    const commandPermission = CommandsArray.find((x) => {
                        return x.name === command_name;
                    })?.permission || [];
                    if (commandPermission.length > 0) commandsLoaded.push(command_name);
                    else return false;
        
                    const arrayRoles = fileCommands.PERMISSIONS[commandPermission];
                    return guild.roles.cache.filter(x => arrayRoles?.includes(x.id) || arrayRoles?.includes(x.name));
                };
        
                const fullPermissions = cmd.reduce((accumulator, x) => {   
                    const roles = getRoles(x.name);
                    if (!roles) return accumulator;
        
                    const permissions = roles.reduce((a, v) => {
                        return [
                            ...a,
                            {
                                id: v.id,
                                type: "ROLE",
                                permission: true,
                            },
                            {
                                id: guild.id,
                                type: "ROLE",
                                permission: false,
                            }
                        ]
                    }, []);
        
                    return [
                        ...accumulator,
                        {
                            id: x.id,
                            permissions,
                        }
                    ]
                }, []);
                guild.commands.permissions.set({ fullPermissions }).then(() => {
                    resolve(CommandsArray)
                });
            });
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * 
 * @param {CommandInteraction} interaction 
 * @param {Array} emojis 
 * @param {Array} embeds 
 * @param {ms} timeout 
 * @param {Boolean} ephemeral 
 * @returns 
 */

async function paginationEmbed(interaction, emojis, embeds, timeout, ephemeral) {
    if (embeds.length <= 0) return interaction.reply({embeds: [
        new MessageEmbed()
            .setTitle("No embeds to paginate!")
            .setColor("RED")
    ]});

    if (embeds.length == 1) return interaction.reply({embeds: [embeds[0]]});

    let current = 0
    const row = (state) => [
        new MessageActionRow().addComponents(
            new MessageButton()
                .setEmoji(emojis[0])
                .setDisabled(state)
                .setStyle("SECONDARY")
                .setCustomId("btn1"),
            new MessageButton()
                .setLabel(emojis[1])
                .setDisabled(state)
                .setStyle("PRIMARY")
                .setCustomId("btn2"),
            new MessageButton()
                .setLabel("Delete")
                .setDisabled(state)
                .setStyle('DANGER')
                .setCustomId("btnx"),
            new MessageButton()
                .setLabel(emojis[2])
                .setDisabled(state)
                .setStyle("PRIMARY")
                .setCustomId("btn3"),
            new MessageButton()
                .setEmoji(emojis[3])
                .setDisabled(state)
                .setStyle("SECONDARY")
                .setCustomId("btn4")
        )
    ]

    const curPage = await interaction.reply({
        embeds: [embeds[current].setTitle(`Currently on page ${current + 1} of ${embeds.length}`)],
        components: row(false),
        fetchReply: true,
        ephemeral
    }).catch(() => { throw new Error("Cannot send messages!") })

    const collector = curPage.createMessageComponentCollector({
        filter: (m) => m.user.id === interaction.member.id,
        componentType: "BUTTON",
        time: ms(timeout),
    });

    collector.on("collect", async (collected) => {
        if      (collected.customId === "btn1") current = 0
        else if (collected.customId === "btn2") current--
        else if (collected.customId === "btn3") current++
        else if (collected.customId === "btn4") current = embeds.length - 1
        else if (collected.customId === "btnx") collector.stop();

        if (current < 0) current = embeds.length - 1
        if (current >= embeds.length) current = 0

        interaction.editReply({
            embeds: [embeds[current].setTitle(`Currently on page ${current + 1} of ${embeds.length}`)],
            ephemeral
        }).catch((e) => { console.error(e) });

        collected.deferUpdate();
    })

    collector.on("end", async () => {
        curPage.edit({
            embeds: [embeds[current].setColor("RED")],
            components: row(true),
            ephemeral
        }).catch(() => { });
    });
}

function generateLicense (length = 25) {
    const strings = "ABCDEFGHIJKLMNIOPQRSTUVWXYZ0123456789";
    let license = "";
    for (let i = 0; i < length; i++) {
        license += strings[Math.floor(Math.random() * strings.length)];
    }
    license = license.replace(/([a-zA-Z0-9]{5})/g, "$1-").slice(0, -1);
    return license;
}

function cancelAsk(fetchMessage, answer, interaction) {
    if (!answer) {
        interaction.editReply({embeds: [fetchMessage.embeds[0].setColor("RED")]})
        return true;
    } else {
        return false;
    }
}

async function ask(question, interaction, reply = true) {
    if (reply) await interaction.reply(question);
    const message = await interaction.fetchReply();
    if (!reply) await interaction.editReply(question);
    /**@type Message */
    let answer;

    await message.channel.awaitMessages({
        filter: (m) => m.author.id === interaction.user.id,
        time: 30000,
        max: 1
    }).then((x) => {
        answer = x.first();
    });
    answer.delete();
    if (answer.content == "cancel") {
        return false;
    }
    return answer;
}
/**
 * 
 * @param {Array} array 
 * @param {String} id 
 * @param {String} style 
 * @returns 
 */

async function countButtons(array, style = "SECONDARY") {
    if (array.length > 10) {
        return console.error("Too many buttons! Max 10 buttons!");
    }
    const components = [];
    lastComponents = new MessageActionRow;
    const emojis = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];
    for (let i = 0; i < array.length; i++) {
        const productName = array[i].name;
        const button = new MessageButton()
            .setEmoji(emojis[i])
            .setCustomId(productName)
            .setStyle("SECONDARY");
        lastComponents.addComponents(button);
        if (lastComponents.components.length === 5) {
            components.push(lastComponents)
            lastComponents = new MessageActionRow();
        };
    };
    if (lastComponents.components.length > 0) {components.push(lastComponents)};
    return components;
};

module.exports = {
    generateLicense,
    paginationEmbed,
    loadPermissions,
    countButtons,
    cancelAsk,
    ask
}
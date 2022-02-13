const { MessageActionRow, MessageButton, Message } = require("discord.js")
const licenseModel = require("../models/licenseModel");
const usersModel = require("../models/usersModel");
const ms = require("ms")

async function reloadPermissions(guild, client, debug = false) {
    const CommandsArray = client.permissions;

    const getAllCustomers = async () => {
        const users = await licenseModel.find();
        if(users?.length == 0) return [client.user.id];
        return users.map(x => x.discord_id);
    }

    const getAllUsers = async () => {
        const user = await usersModel.find();
        if(user?.length == 0) return [client.user.id];
        return user.map(x => x.user_id);
    }

    const getUsersAdmin = async () => {
        const user = await usersModel.find({role: "admin"});
        if(user?.length == 0) return [guild.ownerId];
        const usersMap = user.map(x => x.user_id);
        return usersMap;
    }

    const adminPerms  =  await getUsersAdmin();
    const licenseAcc  =  await getAllUsers();
    const customers   =  await getAllCustomers();
    
    await guild.commands.set(CommandsArray).then((cmd) => {
        const getUsers = (command) => {
            if(command == "self")          return guild.members.cache.filter(x => customers.includes(x.id));
            else if(command == "license")  return guild.members.cache.filter(x => licenseAcc.includes(x.id));
            else if(command == "product")  return guild.members.cache.filter(x => adminPerms.includes(x.id));
            else if(command == "config")   return guild.members.cache.filter(x => adminPerms.includes(x.id));
            else if(command == "users")    return guild.members.cache.filter(x => adminPerms.includes(x.id));
        };

        const fullPermissions = cmd.reduce((accumulator, x) => {
            const users = getUsers(x.name);
            if(!users) return accumulator

            const permissions = users.reduce((a, v) => {
                
                return [
                    ...a,
                    {
                        id: v.id,
                        type: "USER",
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

        }, [])
        guild.commands.permissions.set({ fullPermissions }).then(() => {
            if(debug) console.log("Permissions updated!");
        });
    });
}

async function paginationEmbed(interaction, emojis, embeds, timeout, ephemeral) {
    if(embeds.length <= 0) return interaction.reply({embeds: [
        new MessageEmbed()
            .setTitle("No embeds to paginate!")
            .setColor("RED")
    ]});

    if(embeds.length == 1) return interaction.reply({embeds: [embeds[0]]});

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
        time: ms(timeout)
    })

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

function generateApi(length = 48) {
    const string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let api = "";
    for(let i = 0; i < length; i++) {
        api += string[Math.floor(Math.random() * string.length)];
    }
    return api;
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
    if(!answer) {
        interaction.editReply({embeds: [fetchMessage.embeds[0].setColor("RED")]})
        return true;
    } else {
        return false;
    }
}

async function ask(question, interaction, reply = true) {
    if(reply) await interaction.reply(question);
    if(!reply) await interaction.editReply(question);
    const message = await interaction.fetchReply();
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
    if(answer.content == "cancel") {
        return false;
    }
    return answer;
}

module.exports = {
    reloadPermissions,
    generateLicense,
    paginationEmbed,
    generateApi,
    cancelAsk,
    ask,
}
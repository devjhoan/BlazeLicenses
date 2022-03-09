const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const blacklistModel = require("../models/blacklistModel");
const { paginationEmbed } = require("../functions/Utils");

module.exports = {
    name: "blacklist",
    description: "Manage the blacklist system",
    type: 'CHAT_INPUT',
    permission: "BLACKLIST",
    options: [
        {
            name: 'add',
            description: 'Add IP or HWID to the blacklist',
            type: 'SUB_COMMAND',
            options: [
                {
                    name: 'type',
                    description: 'Is this an IP or HWID?',
                    type: 'STRING',
                    choices: [
                        {
                            name: 'IP',
                            value: 'ip'
                        },
                        {
                            name: 'HWID',
                            value: 'hwid'
                        }
                    ],
                    required: true
                },
                {
                    name: 'value',
                    description: 'The IP or HWID to add to the blacklist',
                    type: 'STRING',
                    required: true
                }
            ]
        },
        {
            name: 'remove',
            description: 'Remove IP or HWID from the blacklist',
            type: 'SUB_COMMAND',
            options: [
                {
                    name: 'type',
                    description: 'Is this an IP or HWID?',
                    type: 'STRING',
                    choices: [
                        {
                            name: 'IP',
                            value: 'ip'
                        },
                        {
                            name: 'HWID',
                            value: 'hwid'
                        }
                    ],
                    required: true
                },
                {
                    name: 'value',
                    description: 'The IP or HWID to remove from the blacklist',
                    type: 'STRING',
                    required: true
                }
            ]
        },
        {
            name: 'list',
            description: 'List all IPs and HWIDs in the blacklist',
            type: 'SUB_COMMAND',
        }
    ],
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        // User Check
        const vanish = client.config.LICENSES_CONFIG.GENERAL_SETTINGS.VISIBLE_MESSAGES || true;
        if (!client.checkPermissions(interaction, "BLACKLIST")) return;

        const [SubCommand] = args;
        if (SubCommand === "add") {
            const type = interaction.options.getString("type");
            const value = interaction.options.getString("value");

            if (type === "ip") {
                const checkValid = await blacklistModel.findOne({ blacklisted: value, type: "ip" });
                if (checkValid) {
                    return interaction.reply({embeds: [
                        new MessageEmbed()
                            .setColor("RED")
                            .setDescription(`IP ${value} is already blacklisted`)
                    ], ephemeral: vanish});
                }
                await blacklistModel.create({
                    blacklisted: value,
                    type: "ip",
                    blocked_connections: 0,
                    created_by: interaction.user.id,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                return interaction.reply({embeds: [
                    new MessageEmbed()
                        .setAuthor({name: interaction.user.tag, iconURL: interaction.user.avatarURL()})
                        .addField("Blacklisted IP", "```yaml\n" + value + "```", false)
                        .addField("Blacklisted By", interaction.user.tag, true)
                        .addField("Blacklisted Since", `<t:${Math.floor(Date.now() / 1000)}:R>`, true)
                        .addField("Blocked Connections", "0", true)
                        .setImage("https://i.stack.imgur.com/Fzh0w.png")
                        .setColor("GREEN")
                ], ephemeral: vanish});
            } else if (type === "hwid") {
                const checkValid = await blacklistModel.findOne({ blacklisted: value, type: "hwid" });
                if (checkValid) {
                    return interaction.reply({embeds: [
                        new MessageEmbed()
                            .setColor("RED")
                            .setDescription(`HWID ${value} is already blacklisted`)
                    ], ephemeral: vanish});
                }
                await blacklistModel.create({
                    blacklisted: value,
                    type: "hwid",
                    blocked_connections: 0,
                    created_by: interaction.user.id,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                return interaction.reply({embeds: [
                    new MessageEmbed()
                        .setAuthor({name: interaction.user.tag, iconURL: interaction.user.avatarURL()})
                        .addField("Blacklisted HWID", "```yaml\n" + value + "```", false)
                        .addField("Blacklisted By", interaction.user.tag, true)
                        .addField("Blacklisted Since", `<t:${Math.floor(Date.now() / 1000)}:R>`, true)
                        .addField("Blocked Connections", "0", true)
                        .setImage("https://i.stack.imgur.com/Fzh0w.png")
                        .setColor("GREEN")
                ], ephemeral: vanish});
            }
        } else if (SubCommand === "remove") {
            const type = interaction.options.getString("type");
            const value = interaction.options.getString("value");

            if (type === "ip") {
                const checkValid = await blacklistModel.findOne({ blacklisted: value, type: "ip" });
                if (!checkValid) {
                    return interaction.reply({embeds: [
                        new MessageEmbed()
                            .setColor("RED")
                            .setDescription(`IP ${value} is not blacklisted`)
                    ], ephemeral: vanish});
                }
                await blacklistModel.deleteOne({ blacklisted: value, type: "ip" });
                return interaction.reply({embeds: [
                    new MessageEmbed()
                        .setAuthor({name: interaction.user.tag, iconURL: interaction.user.avatarURL()})
                        .addField("Un-Blacklisted IP", "```yaml\n" + value + "```", false)
                        .addField("Un-Blacklisted By", interaction.user.tag, true)
                        .addField("Blacklisted Since", `<t:${Math.floor(checkValid.createdAt / 1000)}:R>`, true)
                        .addField("Blocked Connections", checkValid.blocked_connections.toString(), true)
                        .setImage("https://i.stack.imgur.com/Fzh0w.png")
                        .setColor("GREEN")
                ], ephemeral: vanish});
            } else if (type === "hwid") {
                const checkValid = await blacklistModel.findOne({ blacklisted: value, type: "hwid" });
                if (!checkValid) {
                    return interaction.reply({embeds: [
                        new MessageEmbed()
                            .setColor("RED")
                            .setDescription(`HWID ${value} is not blacklisted`)
                    ], ephemeral: vanish});
                }
                await blacklistModel.deleteOne({ blacklisted: value, type: "hwid" });
                return interaction.reply({embeds: [
                    new MessageEmbed()
                        .setAuthor({name: interaction.user.tag, iconURL: interaction.user.avatarURL()})
                        .addField("Un-Blacklisted HWID", "```yaml\n" + value + "```", false)
                        .addField("Un-Blacklisted By", interaction.user.tag, true)
                        .addField("Blacklisted Since", `<t:${Math.floor(checkValid.createdAt / 1000)}:R>`, true)
                        .addField("Blocked Connections", checkValid.blocked_connections.toString(), true)
                        .setImage("https://i.stack.imgur.com/Fzh0w.png")
                        .setColor("GREEN")
                ], ephemeral: vanish});
            }
        } else if (SubCommand === "list") {
            const blacklisted = await blacklistModel.find({});
            if (blacklisted?.length <= 0) {
                return interaction.reply({embeds: [
                    new MessageEmbed()
                        .setColor("RED")
                        .setDescription("There are no blacklisted items")
                ], ephemeral: vanish});
            }
            const embeds = [];
            for (let i = 0; i < blacklisted.length; i++) {
                const data = blacklisted[i];
                embeds.push(new MessageEmbed()
                    .setAuthor({name: "Request by: " + interaction.user.tag, iconURL: interaction.user.avatarURL()})
                    .addField("Blacklisted " + `${data.type.toUpperCase()}`, "```yaml\n" + data.blacklisted + "```", false)
                    .addField("Blacklisted By", (interaction.guild.members.cache.get(data.created_by)).user.tag, true)
                    .addField("Blacklisted since", `<t:${Math.floor(data.createdAt / 1000)}:R>`, true)
                    .addField("Blocked connections", data.blocked_connections.toString(), true)
                    .setImage("https://i.stack.imgur.com/Fzh0w.png")
                    .setColor("AQUA")
                );
            }
            paginationEmbed(interaction, ["⏪", "Previous", "Next", "⏩"], embeds, "60s", vanish);
        }
    },
};
const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const reloadPermissions = require("../functions/reloadPermissions");
const paginationEmbed = require("../functions/paginationEmbed");
const usersModel = require("../models/usersModel");

module.exports = {
    name: "users",
    description: "Blaze Licenses",
    type: 'CHAT_INPUT',
    options: [
        {
            name: 'create',
            description: 'Create a new user',
            type: 'SUB_COMMAND',
            options: [
                {
                    name: 'name',
                    description: 'Name of the user',
                    type: 'STRING',
                    required: true
                },
                {
                    name: 'role',
                    description: 'Role of the user',
                    type: 'STRING',
                    choices: [
                        {
                            name: 'Administrator',
                            value: 'admin'
                        },
                        {
                            name: 'Moderator',
                            value: 'mod'
                        }
                    ],
                    required: true
                },
                {
                    name: 'discord',
                    description: 'Discord id of the user',
                    type: 'USER',
                    required: true
                }
            ]
        },
        {
            name: 'list',
            description: 'List all users',
            type: 'SUB_COMMAND',
        },
        {
            name: 'remove',
            description: 'Remove a user',
            type: 'SUB_COMMAND',
            options: [
                {
                    name: 'discord',
                    description: 'Discord of the user',
                    type: 'USER',
                    required: true
                }
            ]
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
        const userX = await usersModel.findOne({user_id: interaction.user.id});
        if(userX?.role !== "admin" && !interaction.member.permissions.has("ADMINISTRATOR")) {
            return interaction.reply({embeds: [
                new MessageEmbed()
                    .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                    .setTitle("❌ You are not registered!")
                    .setDescription("You need have a user registered for use this command!")
                    .setFooter({text: "Blaze Licenses"})
                    .setColor("RED")
            ], ephemeral: true});
        }

        const [SubCommand] = args;
        if(SubCommand == "create") {
            // Options of the subcommad
            const name = interaction.options.getString('name');
            const role = interaction.options.getString('role');
            const user = interaction.options.getUser('discord');

            // Check if have guildData
            const guildData = await usersModel.find();
            if(guildData.length == 0) {
                if(user.id !== interaction.user.id) {
                    return interaction.reply({embeds: [
                        new MessageEmbed()
                            .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                            .setTitle("❌ Need have an account!")
                            .setDescription("First create your account before another user!")
                            .setFooter({text: "Blaze Licenses"})
                            .setColor("RED")
                    ], ephemeral: true});
                }
            }

            // Create the user
            const userModel = new usersModel({
                name,
                user_id: user.id,
                role,
                licenses_created: 0,
                created_by: interaction.user.id,
                created_at: new Date(),
            })

            if(role == "admin") {
                const genApi = (times) => {
                    const string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                    let api = "";
                    for(let i = 0; i < times; i++) {
                        api += string[Math.floor(Math.random() * string.length)];
                    }
                    return api;
                }
                userModel.api_key = genApi(40);
            }

            // Save the user
            await userModel.save();

            // Reload permissions
            await reloadPermissions(interaction.guild, client);

            // Send a message to the user that the user was created
            interaction.reply({embeds: [
                new MessageEmbed()
                    .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                    .setTitle("✅ User created")
                    .addField("**❯ User name**", name)
                    .addField("**❯ User role**", role.replace("mod", "Moderator").replace("admin", "Administrator"))
                    .addField("**❯ User ID**", user.id)
                    .setTimestamp()
                    .setColor("AQUA")
                    .setFooter({text: "Blaze Licenses"})
            ]});
        } else if(SubCommand == "list") {
            // Get all the users
            const users = await usersModel.find({});
            if(!users || users?.length == 0) return interaction.reply("❌ There are no users");
            let embeds = [];

            // Create the embeds
            for(let i = 0; i < users.length; i++) {
                const user = users[i];
                embeds.push(new MessageEmbed()
                    .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                    .addField("**❯ User name**", user.name, true)
                    .addField("**❯ User role**", user.role.replace("mod", "Moderator").replace("admin", "Administrator"), true)
                    .addField("**❯ Licenses created**", user.licenses_created.toString(), true)
                    .addField("**❯ User ID**", user.user_id, true)
                    .addField("**❯ Created by**",  (await client.users.fetch(user.created_by)).tag, true)
                    .addField("**❯ Created at**", `<t:${(user.created_at / 1000 | 0).toString()}:R>`, true)
                    .setTimestamp()
                    .setColor("AQUA")
                    .setFooter({text: "Blaze Licenses"})
                );
            }
            if(embeds.length == 1) return interaction.reply({embeds});
            paginationEmbed(interaction, ["⏪", "Previous", "Next", "⏩"], embeds, "60s");
        } else if(SubCommand == "remove") {
            // Options of the subcommad
            const user = interaction.options.getUser('discord');

            // Check if the user exists
            const userModel = await usersModel.findOne({user_id: user.id});
            if(!userModel) return interaction.reply("❌ The user doesn't exist");

            // Remove the user
            await usersModel.deleteOne({user_id: user.id});

            // Reload permissions
            await reloadPermissions(interaction.guild, client);

            interaction.reply({embeds: [
                new MessageEmbed()
                    .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                    .setTitle("✅ User removed")
                    .addField("**❯ User name**", userModel.name, true)
                    .addField("**❯ User role**", userModel.role.replace("mod", "Moderator").replace("admin", "Administrator"), true)
                    .addField("**❯ Licenses created**", userModel.licenses_created.toString(), true)
                    .addField("**❯ User ID**", userModel.user_id, true)
                    .addField("**❯ Created by**",  (await client.users.fetch(userModel.created_by)).tag, true)
                    .addField("**❯ Created at**", `<t:${(userModel.created_at / 1000 | 0)}:R>`, true)
                    .setTimestamp()
                    .setColor("AQUA")
                    .setFooter({text: "Blaze Licenses"})
            ]})
        }
    },
};
const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const { reloadPermissions, paginationEmbed, generateApi } = require("../functions/Utils");
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
            if(guildData?.length == 0) {
                    if(role !== "admin") {
                        return interaction.reply({embeds: [
                            new MessageEmbed()
                                .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                                .setTitle("❌ First user must be an admin!")
                                .setDescription("The first user must be an admin!")
                                .setFooter({text: "Blaze Licenses"})
                                .setColor("RED")
                        ], ephemeral: true});
                    }
            };

            // Search in the database if the user is already registered
            const userExist = await usersModel.findOne({user_id: user.id});
            if(userExist) {
                return interaction.reply({embeds: [
                    new MessageEmbed()
                        .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                        .setTitle("❌ User already registered!")
                        .setDescription("The user is already registered!")
                        .setFooter({text: "Blaze Licenses"})
                        .setColor("RED")
                ], ephemeral: true});
            };

            // Create the user
            const userModel = new usersModel({
                name: name,
                user_id: user.id,
                role: role,
                licenses_created: 0,
                created_by: interaction.user.id,
                created_at: new Date(),
            });

            if(role == "admin") {
                userModel.api_key = generateApi(48);
            };

            // Save the user
            await userModel.save();

            // Send a message to the user that the user was created
            interaction.reply({embeds: [
                new MessageEmbed()
                    .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                    .setTitle("✅ User created")
                    .addField("**❯ User name**", name)
                    .addField("**❯ User role**", role.replace("mod", "Moderator").replace("admin", "Administrator"))
                    .addField("**❯ User ID**", user.id)
                    .setFooter({text: "Blaze Licenses"})
                    .setColor("AQUA")
                    .setTimestamp()
            ]});

            // Reload permissions
            return await reloadPermissions(interaction.guild, client);
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
                    .setFooter({text: "Blaze Licenses"})
                    .setColor("AQUA")
                    .setTimestamp()
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
            // Reload permissions
            await reloadPermissions(interaction.guild, client);
        }
    },
};
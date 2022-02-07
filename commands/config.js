const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const usersModel = require("../models/usersModel");

module.exports = {
    name: "config",
    description: "Blaze Licenses",
    type: 'CHAT_INPUT',
    options: [
        {
            name: 'api-keys',
            description: 'Get your API-keys!',
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
        const [SubCommand] = args;
        if (SubCommand === "api-keys") {
            // Check if the user have a user in the database
            const user = await usersModel.findOne({ user_id: interaction.user.id });
            if (!user) client.noRegister(interaction);

            // If the user no is admin, return an error
            if (user.role !== "admin") {
                return interaction.reply({embeds: [
                    new MessageEmbed()
                    .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                    .setTitle("❌ You don't have permission")
                    .setDescription("You need to be an admin to get your API-keys")
                    .setFooter({text: "Blaze Licenses"})
                    .setColor("RED")
                    .setTimestamp()
                ], ephemeral: true});
            }

            // Send the API-keys
            interaction.reply({embeds: [
                new MessageEmbed()
                    .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                    .setTitle("API-Keys")
                    .addField("**❯ Public key:**", "```yaml\n" + user.api_key + "```")
                    .setFooter({text: "Blaze Licenses"})
                    .setColor("AQUA")
                    .setTimestamp()
            ], ephemeral: true});
        }
    },
};
const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const { paginationEmbed, makeLicenseEmbed } = require("../functions/Utils");
const licenseModel = require("../models/licenseModel");
const { Command } = require("../typings/Command");

module.exports = new Command({
    name: "self",
    description: "Blaze Licenses",
    type: 'CHAT_INPUT',
    permission: "SELF_LICENSES",
    options: [
        {
            name: "licenses",
            description: "Get list of your licenses",
            type: "SUB_COMMAND",
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
        if (!client.checkPermissions(interaction, "SELF_LICENSES")) return;
        
        if (SubCommand == "licenses") {
            // Get the licenses of the user
            const licenses = await licenseModel.find({ discord_id: interaction.user.id });
            if (!licenses || licenses.length == 0) {
                return interaction.reply({embeds: [
                    new MessageEmbed()
                        .setTitle("❌ No licenses found")
                        .setDescription("You don't have any licenses!")
                        .setFooter({text: "Blaze Licenses"})
                        .setColor("RED")
                        .setTimestamp()
                ], ephemeral: true});   
            }
            
            // Save in a array the licenses that were found
            let embeds = [];
            for (let i = 0; i < licenses.length; i++) {
                const license = licenses[i];
                embeds.push(
                    makeLicenseEmbed(license, interaction)
                )
            };

            if (embeds.length == 1) return interaction.reply({embeds, ephemeral: true});
            paginationEmbed(interaction, ["⏪", "Previous", "Next", "⏩"], embeds, "15s", true);
        } 
    },
});
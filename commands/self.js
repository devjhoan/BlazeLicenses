const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const { paginationEmbed } = require("../functions/Utils");
const licenseModel = require("../models/licenseModel");

module.exports = {
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

                // Map Ip-List
                const ipList = license.ip_list.map((ip, i) => `${i+1}: ${ip}`)
                if (ipList.length == 0) ipList.push("1: None");

                // Map Hwid-List
                const hwidList = license.hwid_list.map((hwid, i) => `${i+1}: ${hwid.substring(0, 40)}${hwid.length > 40 ? "..." : ""}`)
                if (hwidList.length == 0) hwidList.push("1: None");

                // Send a message to the user that the license was removed
                embeds.push(
                    new MessageEmbed()
                        .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                        .addField("**License key**", "```yaml\n" + license.licensekey + "```")
                        .addField("**Client name**", license.clientname, true)
                        .addField("**Discord id**", license.discord_id, true)
                        .addField("**Discord username**", license.discord_username, true)
                        .addField("**Product**", license.product_name, true)
                        .addField("**Created by**", license.created_by ? license.created_by : "none", true)
                        .addField("**IP-Cap**", `${license.ip_list.length}/${license.ip_cap}`, true)
                        .addField("**HWID-Cap**", `${license.hwid_list.length}/${license.hwid_cap}`, true)
                        .addField("**Latest IP**", license.latest_ip ? license.latest_ip : "none", true)
                        .addField("**Latest HWID**", license.latest_hwid ? license.latest_hwid : "none", true)
                        .addField("**Created at**", `<t:${(license.createdAt / 1000 | 0)}:R>`, true)
                        .addField("**Updated at**", `<t:${(license.updatedAt / 1000 | 0)}:R>`, true)
                        .addField("**IP-list**", "```yaml\n"+ ipList.join("\n").toString() +"```", false)
                        .addField("**Hwid-list**", "```yaml\n"+ hwidList.join("\n").toString() +"```", false)
                        .setFooter({text: "Blaze Licenses"})
                        .setColor("AQUA")
                        .setTimestamp()
                )
            };

            if (embeds.length == 1) return interaction.reply({embeds, ephemeral: true});
            paginationEmbed(interaction, ["⏪", "Previous", "Next", "⏩"], embeds, "15s", true);
        } 
    },
};
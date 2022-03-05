const { Client, CommandInteraction, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu, WebhookClient } = require("discord.js");
const { generateLicense, paginationEmbed, ask, cancelAsk, countButtons } = require("../functions/Utils");
const productModel = require("../models/productsModel");
const licenseModel = require("../models/licenseModel");

module.exports = {
    name: "license",
    description: "Blaze licenses",
    type: 'CHAT_INPUT',
    permission: "LICENSE",
    options: [
        {
            name: "create",
            description: "Create a new license key!",
            type: "SUB_COMMAND",
        },
        {
            name: "list",
            description: "Get list of all your licenses!",
            type: "SUB_COMMAND",
        },
        {
            name: "remove",
            description: "Remove specific license key!",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "value",
                    description: "License key that should be removed?",
                    type: "STRING",
                    required: true,
                }
            ]
        },
        {
            name: "get",
            description: "Get details of specific license key!",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "mode",
                    description: "Strict search finds direct match and loose find multiple licenses by given query!",
                    type: "STRING",
                    choices: [
                        {
                            name: "strict",
                            value: "strict"
                        },
                        {
                            name: "loose",
                            value: "loose"
                        }
                    ],
                    required: true,
                },
                {
                    name: "value",
                    description: "Query for license searching. This can be license key, tag, clientname or Discord ID",
                    type: "STRING",
                    required: true,
                }
            ]
        },
        {
            name: "cleardata",
            description: "Clear IP data of a specific license key!",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "value",
                    description: "License key that should be cleared?",
                    type: "STRING",
                    required: true,
                }
            ]
        },
        {
            name: "edit",
            description: "Edit specific license key!",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "value",
                    description: "License key that should be edited?",
                    type: "STRING",
                    required: true,
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
        const vanish = client.config.LICENSES_CONFIG.GENERAL_SETTINGS.VISIBLE_MESSAGES || true;
        if (!client.checkPermissions(interaction, "LICENSE")) return;

        const [SubCommand] = args;
        if (SubCommand == "create") {
            const products = await productModel.find();

            if (!products || products?.length == 0) return interaction.reply(`🚫 there are no products!`);
            const i_name = products.map((product, i) => `${i + 1}: ${product.name} [${product.price === 0 ? "FREE" : `$${product.price}`}]`);

            let productName = "";
            await interaction.reply({embeds: [
                new MessageEmbed()
                    .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                    .setDescription("You started license creation process. You have 2 minutes to finish creating a new license key. All you need to do is answer to my questions.")
                    .addField("**❯ Question [1/6]**", "To what product should this license key to be binded to? You need to give me a valid product name!")
                    .addField("**❯ Your products**", "```yaml\n" + i_name.join("\n") + "```")
                    .addField("**❯ Attention**", "You can cancel this license creation any time via writing cancel to the chat. License creation will automatically timeout after 2 minutes from start.")
                    .setFooter({text: "Blaze Licenses"})
                    .setTimestamp()
                    .setColor("AQUA")
            ], components: await countButtons(products, "product", "SECONDARY"), ephemeral: vanish}).then(async (x) => {
                const message = await interaction.fetchReply();
                const collector = message.createMessageComponentCollector({
                    filter: (m) => m.user.id === interaction.member.id,
                    componentType: "BUTTON",
                    time: 600000,
                });

                collector.on("collect", async (collected) => {
                    await collected.deferUpdate();
                    productName = collected.customId;
                    collector.stop();
                    const fetchMessage = await interaction.fetchReply();

                    const product = products.find((product) => product.name.toLowerCase() == productName.toLowerCase());
                    if (!product) return interaction.editReply({embeds: [fetchMessage.embeds[0].setColor("RED").setTitle("**❌ Invalid product name!**")]});
                    const licenseKey =  generateLicense();
        
                    const clientName = (await ask({embeds: [
                        new MessageEmbed()
                            .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                            .addField("**❯ Question [2/6]**", "What is the name of the client who is using this license?")
                            .addField("**❯ Progress**", "```yaml\n" + `Product: ${product.name}` + "```")
                            .addField("**❯ License key**", "```yaml\n" + licenseKey + "```")
                            .addField("**❯ Attention**", "You can cancel this license creation any time via writing cancel to the chat. License creation will automatically timeout after 2 minutes from start.")
                            .setFooter({text: "Blaze Licenses"})
                            .setTimestamp()
                            .setColor("AQUA")
                    ], components: []}, interaction, false))?.content;
        
                    const fetchMessage2 = await interaction.fetchReply();
                    if (cancelAsk(fetchMessage2, clientName, interaction)) return;
        
                    const discordClient = await ask({embeds: [
                        new MessageEmbed()
                            .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                            .addField("**❯ Question [3/6]**", "Does this client have a Discord account? mention/discord id")
                            .addField("**❯ Progress**", "```yaml\n" + `Product: ${product.name}\nClient name: ${clientName}` + "```")
                            .addField("**❯ License key**", "```yaml\n" + licenseKey + "```")
                            .addField("**❯ Attention**", "You can cancel this license creation any time via writing cancel to the chat. License creation will automatically timeout after 2 minutes from start.")
                            .setFooter({text: "Blaze Licenses"})
                            .setTimestamp()
                            .setColor("AQUA")
                    ]}, interaction, false);
        
                    const fetchMessage3 = await interaction.fetchReply();
                    if (cancelAsk(fetchMessage3, discordClient, interaction)) return;
                    
                    const discordId = discordClient.mentions.users.first() || client.users.cache.get(discordClient.content);
                    if (!discordId) return interaction.editReply({embeds: [fetchMessage.embeds[0].setColor("RED").setTitle("**❌ Invalid Discord ID!**")]});
        
                    const ipCap = (await ask({embeds: [
                        new MessageEmbed()
                            .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                            .addField("**❯ Question [4/6]**", "Set IP-Cap for this license! number/none")
                            .addField("**❯ Progress**", "```yaml\n" + `Product: ${product.name}\nClient name: ${clientName}\nDiscord id: ${discordId.id}` + "```")
                            .addField("**❯ License key**", "```yaml\n" + licenseKey + "```")
                            .addField("**❯ Attention**", "You can cancel this license creation any time via writing cancel to the chat. License creation will automatically timeout after 2 minutes from start.")
                            .setFooter({text: "Blaze Licenses"})
                            .setTimestamp()
                            .setColor("AQUA")
                    ]}, interaction, false))?.content;
                    let ip_cap;
        
                    const fetchMessage4 = await interaction.fetchReply();
                    if (cancelAsk(fetchMessage4, ipCap, interaction)) return;
                    
                    if (ipCap.toLowerCase() == "none" || !parseInt(ipCap)) ip_cap = 0;
                    else ip_cap = parseInt(ipCap);
                
                    const Hwid_CAP = (await ask({embeds: [
                        new MessageEmbed()
                            .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                            .addField("**❯ Question [5/6]**", "Set HWID-CAP for this license! number/none")
                            .addField("**❯ Progress**", "```yaml\n" + `Product: ${product.name}\nClient name: ${clientName}\nDiscord id: ${discordId.id}\nIP-Cap: ${ip_cap}` + "```")
                            .addField("**❯ License key**", "```yaml\n" + licenseKey + "```")
                            .addField("**❯ Attention**", "You can cancel this license creation any time via writing cancel to the chat. License creation will automatically timeout after 2 minutes from start.")
                            .setFooter({text: "Blaze Licenses"})
                            .setTimestamp()
                            .setColor("AQUA")
                    ]}, interaction, false))?.content;
                    let hwid_cap;
        
                    const fetchMessage7 = await interaction.fetchReply();
                    if (cancelAsk(fetchMessage7, Hwid_CAP, interaction)) return;
                    
                    if (Hwid_CAP.toLowerCase() == "none" || !parseInt(Hwid_CAP)) hwid_cap = 0;
                    else hwid_cap = parseInt(Hwid_CAP);

                    let createLicense = "yes";
                    await interaction.editReply({embeds: [
                        new MessageEmbed()
                            .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                            .addField("**❯ Question [5/6]**", "Do you want to create this license key? true/false")
                            .addField("**❯ Progress**", "```yaml\n" + `Product: ${product.name}\nClient name: ${clientName}\nDiscord id: ${discordId.id}\nIP-Cap: ${ip_cap}\nHWID-Cap: ${hwid_cap}` + "```")
                            .addField("**❯ License key**", "```yaml\n" + licenseKey + "```")
                            .addField("**❯ Attention**", "You can cancel this license creation any time via writing cancel to the chat. License creation will automatically timeout after 2 minutes from start.")
                            .setFooter({text: "Blaze Licenses"})
                            .setTimestamp()
                            .setColor("AQUA")
                    ], components: [
                        new MessageActionRow().addComponents(
                            new MessageButton()
                                .setEmoji("✅")
                                .setStyle("SECONDARY")
                                .setCustomId("yes"),
                            new MessageButton()
                                .setEmoji("❌")
                                .setStyle("SECONDARY")
                                .setCustomId("no")
                        )
                    ]}).then(async (msg) => {
                        const message = await interaction.fetchReply();
                        const collector = message.createMessageComponentCollector({
                            filter: (m) => m.user.id === interaction.member.id,
                            componentType: "BUTTON",
                            time: 600000,
                        });

                        collector.on("collect", async (collected) => {
                            await collected.deferUpdate();
                            createLicense = collected.customId;
                            if (createLicense === "true" || createLicense === "yes") {
                                await interaction.editReply({embeds: [
                                    new MessageEmbed()
                                        .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                                        .setTitle("**⚠ License is being created!**")
                                        .addField("**❯ Progress**", "```yaml\n" + `Product: ${product.name}\nClient name: ${clientName}\nDiscord id: ${discordId.id}\nIP-Cap: ${ip_cap}\nHWID-Cap: ${hwid_cap}` + "```")
                                        .addField("**❯ License key**", "```yaml\n" + licenseKey + "```")
                                        .setFooter({text: "Blaze Licenses"})
                                        .setTimestamp()
                                        .setColor("ORANGE")
                                ], components: []});
                                const newLicense = new licenseModel({
                                    product_name: product.name,
                                    licensekey: licenseKey,
                                    clientname: clientName,
                                    discord_id: discordId.id,
                                    discord_username: discordId.username,
                                    discord_tag: discordId.tag,
                                    ip_cap: ip_cap,
                                    hwid_cap: hwid_cap,
                                    created_by: interaction.user.tag,
                                    createdAt: Date.now(),
                                    updatedAt: Date.now()
                                });
                                await newLicense.save();
                
                                product.total_purchases += 1;
                                await product.save();
                                
                                interaction.editReply({embeds: [
                                    new MessageEmbed()
                                    .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                                    .setTitle("**✅ License created!**")
                                    .addField("**❯ License Info**", "```yaml\n" + `Product: ${product.name}\nClient name: ${clientName}\nDiscord id: ${discordId.id}\nIP-Cap: ${ip_cap}\nHWID-Cap: ${hwid_cap}` + "```")
                                    .addField("**❯ License key**", "```yaml\n" + licenseKey + "```")
                                    .addField("**❯ Created by**", interaction.user.tag)
                                    .setFooter({text: "Blaze Licenses"})
                                    .setTimestamp()
                                    .setColor("GREEN")
                                ]}).then((msg) => {
                                    if (client.config.LICENSES_CONFIG.LOG_SYSTEM.ENABLED) {
                                        const webhook = new WebhookClient({url: client.config.LICENSES_CONFIG.LOG_SYSTEM.WEBHOOK_URL});
                                        webhook.send({embeds: [
                                            new MessageEmbed()
                                                .setAuthor({ name: `Created by: ${interaction.user.id}`, iconURL: interaction.user.avatarURL() })
                                                .setTitle("**✅ License created!**")
                                                .addField("**❯ License Info**", "```yaml\n" + `Product: ${product.name}\nClient name: ${clientName}\nDiscord id: ${discordId.id}\nIP-Cap: ${ip_cap}` + "```")
                                                .addField("**❯ License key**", "```yaml\n" + licenseKey + "```")
                                                .addField("**❯ Created by**", interaction.user.tag)
                                                .setFooter({text: "Blaze Licenses"})
                                                .setTimestamp()
                                                .setColor("GREEN")                                        
                                        ]});
                                    }
                                });
                            } else {
                                interaction.editReply({embeds: [
                                    new MessageEmbed()
                                        .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                                        .setTitle("**❌ License creation canceled!**")
                                        .addField("**❯ Progress**", "```yaml\n" + `Product: ${product.name}\nClient name: ${clientName}\nDiscord id: ${discordId.id}\nIP-Cap: ${ip_cap}` + "```")
                                        .addField("**❯ License key**", "```yaml\n" + licenseKey + "```")
                                        .setFooter({text: "Blaze Licenses"})
                                        .setTimestamp()
                                        .setColor("RED")
                                ]});
                            } 
                        });
                    });
                });

                collector.on("end", async () => {
                    await interaction.editReply({
                        components: []
                    });
                });
            })
        } else if (SubCommand === "list") {
            // Get all licenses
            const licenses = await licenseModel.find();
            if (!licenses || licenses?.length == 0) return interaction.reply(`🚫 there are no licenses yet!`);
            let embeds = [];

            // Add the license to the embeds array
            for (let i = 0; i < licenses.length; i++) {
                const license = licenses[i];

                const ipList = license.ip_list.map((ip, i) => `${i+1}: ${ip}`)
                if (ipList.length == 0) ipList.push("1: None");

                const hwidList = license.hwid_list.map((hwid, i) => `${i+1}: ${hwid.substring(0, 40)}${hwid.length > 40 ? "..." : ""}`)
                if (hwidList.length == 0) hwidList.push("1: None");

                embeds.push(new MessageEmbed()
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
                    .addField("**Created at**", `<t:${(licenses[i].createdAt / 1000 | 0)}:R>`, true)
                    .addField("**Updated at**", `<t:${(licenses[i].updatedAt / 1000 | 0)}:R>`, true)
                    .addField("**IP-list**", "```yaml\n"+ ipList.join("\n").toString() +"```", false)
                    .addField("**Hwid-list**", "```yaml\n"+ hwidList.join("\n").toString() +"```", false)
                    .setFooter({text: "Blaze Licenses"})
                    .setColor("AQUA")
                    .setTimestamp()
                );
            }
            if (embeds.length == 1) return interaction.reply({embeds});
            paginationEmbed(interaction, ["⏪", "Previous", "Next", "⏩"], embeds, "60s", vanish);
        } else if (SubCommand === "remove") {
            // Options of the SubCommand
            const license_key = interaction.options.getString("value");

            await interaction.reply({embeds: [
                new MessageEmbed()
                    .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                    .setTitle("**Please, wait a moment...\nThe license will be removed in a few seconds...**")
                    .setFooter({text: "Blaze Licenses"})
                    .setTimestamp()
                    .setColor("AQUA")
            ], ephemeral: vanish});

            // Check if the license exists
            const check = await licenseModel.findOne({licensekey: license_key});
            if (!check) return interaction.editReply(`🚫 license with key ${license_key} does not exist!`);

            // Remove the license
            await licenseModel.findOneAndDelete({licensekey: license_key});

            // Map Ip-List
            const ipList = check.ip_list.map((ip, i) => `${i+1}: ${ip}`)
            if (ipList.length == 0) ipList.push("1: None");

            // Map Hwid-List
            const hwidList = license.hwid_list.map((hwid, i) => `${i+1}: ${hwid.substring(0, 40)}${hwid.length > 40 ? "..." : ""}`)
            if (hwidList.length == 0) hwidList.push("1: None");

            // Send a message to the user that the license was removed
            interaction.editReply({embeds: [
                new MessageEmbed()
                    .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                    .setTitle("**✅ License removed!**")
                    .addField("**License key**", "```yaml\n" + license_key + "```")
                    .addField("**Client name**", check.clientname, true)
                    .addField("**Discord id**", check.discord_id, true)
                    .addField("**Discord username**", check.discord_username, true)
                    .addField("**Product**", check.product_name, true)
                    .addField("**Created by**", check.created_by ? check.created_by : "none", true)
                    .addField("**IP-Cap**", `${check.ip_list.length}/${check.ip_cap}`, true)
                    .addField("**HWID-Cap**", `${license.hwid_list.length}/${license.hwid_cap}`, true)
                    .addField("**Latest IP**", check.latest_ip ? check.latest_ip : "none", true)
                    .addField("**Latest HWID**", license.latest_hwid ? license.latest_hwid : "none", true)
                    .addField("**Created at**", `<t:${(check.createdAt / 1000 | 0)}:R>`, true)
                    .addField("**Updated at**", `<t:${(check.updatedAt / 1000 | 0)}:R>`, true)
                    .addField("**IP-list**", "```yaml\n"+ ipList.join("\n").toString() +"```", false)
                    .addField("**Hwid-list**", "```yaml\n"+ hwidList.join("\n").toString() +"```", false)
                    .setFooter({text: "Blaze Licenses"})
                    .setColor("AQUA")
                    .setTimestamp()
            ]}).then(() => {
                if (client.config.LICENSES_CONFIG.LOG_SYSTEM.ENABLED) {
                    const webhook = new WebhookClient({url: client.config.LICENSES_CONFIG.LOG_SYSTEM.WEBHOOK_URL});
                    webhook.send({embeds: [
                        new MessageEmbed()
                            .setAuthor({ name: `Removed by: ${interaction.user.id}`, iconURL: interaction.user.avatarURL() })
                            .setTitle("**✅ License removed!**")
                            .addField("**License key**", "```yaml\n" + license_key + "```")
                            .addField("**Client name**", check.clientname, true)
                            .addField("**Discord id**", check.discord_id, true)
                            .addField("**Discord username**", check.discord_username, true)
                            .addField("**Product**", check.product_name, true)
                            .addField("**Created by**", check.created_by ? check.created_by : "none", true)
                            .addField("**IP-Cap**", `${check.ip_list.length}/${check.ip_cap}`, true)
                            .addField("**Latest IP**", check.latest_ip ? check.latest_ip : "none", true)
                            .addField("**Latest HWID**", license.latest_hwid ? license.latest_hwid : "none", true)
                            .addField("**Created at**", `<t:${(check.createdAt / 1000 | 0)}:R>`, true)
                            .addField("**Updated at**", `<t:${(check.updatedAt / 1000 | 0)}:R>`, true)
                            .addField("**IP-list**", "```yaml\n"+ ipList.join("\n").toString() +"```", false)
                            .addField("**Hwid-list**", "```yaml\n"+ hwidList.join("\n").toString() +"```", false)
                            .setFooter({text: "Blaze Licenses"})
                            .setColor("AQUA")
                            .setTimestamp()
                    ]});
                }
            });
        } else if (SubCommand === "get") {
            // Options of the SubCommand
            const mode = interaction.options.getString("mode");
            const value = interaction.options.getString("value");

            if (mode == "strict") {
                // Get the license
                const license = await licenseModel.findOne(value ? {$or: [{clientname: value}, {product_name: value}, {discord_id: value}, {discord_username: value}, {latest_ip: value}, {licensekey: value}]} : {});
                if (!license) return interaction.reply(`🚫 license with the ${value} does not exist!`);

                // Map Ip-List
                const ipList = license.ip_list.map((ip, i) => `${i+1}: ${ip}`)
                if (ipList.length == 0) ipList.push("1: None");

                // Map Hwid-List
                const hwidList = license.hwid_list.map((hwid, i) => `${i+1}: ${hwid.substring(0, 40)}${hwid.length > 40 ? "..." : ""}`)
                if (hwidList.length == 0) hwidList.push("1: None");

                // Send a message to the user that the license was removed
                interaction.reply({embeds: [
                    new MessageEmbed()
                        .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                        .setTitle("**✅ License found!**")
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
                ], ephemeral: vanish})
            } else if (mode == "loose") {
                // Get the license
                const licenses = await licenseModel.find(value ? {$or: [{clientname: value}, {product_name: value}, {discord_id: value}, {discord_username: value}, {latest_ip: value}, {licensekey: value}]} : {});
                if (!licenses || licenses.length == 0) return interaction.reply(`🚫 license with the value: \`${value}\` does not exist!`);                
                let embeds = [];

                // Save in a array the licenses that were found
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

                if (embeds.length == 1) return interaction.reply({embeds});
                paginationEmbed(interaction, ["⏪", "Previous", "Next", "⏩"], embeds, "60s", vanish);
            }
        } else if (SubCommand === "cleardata") {
            // Options of the SubCommand
            const value = interaction.options.getString("value");

            // Get the license
            const license = await licenseModel.findOne({licensekey: value});
            if (!license) return interaction.reply(`🚫 license \`${value}\` does not exist!`);

            // Map Ip-List
            const ipList = license.ip_list.map((ip, i) => `${i+1}: ${ip}`)
            if (ipList.length == 0) ipList.push("1: None");

            // Map Hwid-List
            const hwidList = license.hwid_list.map((hwid, i) => `${i+1}: ${hwid.substring(0, 40)}${hwid.length > 40 ? "..." : ""}`)
            if (hwidList.length == 0) hwidList.push("1: None");

            const buttons = new MessageActionRow().addComponents(
                new MessageButton()
                    .setLabel("Clear IP's")
                    .setEmoji("🗑️")
                    .setStyle("PRIMARY")
                    .setCustomId("clearip"),
                new MessageButton()
                    .setLabel("Clear HWID's")
                    .setEmoji("🗑️")
                    .setStyle("PRIMARY")
                    .setCustomId("clearhwid")
            )

            await interaction.reply({embeds: [
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
                    .addField("**Created at**", `<t:${(license.createdAt / 1000 | 0)}:R>`, true)
                    .addField("**Updated at**", `<t:${(license.updatedAt / 1000 | 0)}:R>`, true)
                    .addField("**IP-list**", "```yaml\n"+ ipList.join("\n").toString() +"```", false)
                    .addField("**Hwid-list**", "```yaml\n"+ hwidList.join("\n").toString() +"```", false)
                    .setFooter({text: "Blaze Licenses"})
                    .setColor("AQUA")
                    .setTimestamp()
            ], ephemeral: vanish, components: [buttons]});

            // Listen for the user to click on a button
            const msg = await interaction.fetchReply();
            const collector = msg.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.user.id && i.customId, time: 10000, max: 1 });

            collector.on("collect", async (ints) => {
                const button = ints.customId;
                if (button === "clearip") {
                    await license.updateOne({ip_list: []});

                    interaction.editReply({embeds:  [
                        new MessageEmbed()
                            .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                            .setTitle("**✅ License ip's cleared!**")
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
                            .addField("**IP-list**", "```yaml\n1: None```", false)
                            .addField("**Hwid-list**", "```yaml\n"+ hwidList.join("\n").toString() +"```", false)
                            .setFooter({text: "Blaze Licenses"})
                            .setColor("AQUA")
                            .setTimestamp()
                    ], components: []})
                } else if (button === "clearhwid") {
                    await license.updateOne({hwid_list: []});

                    interaction.editReply({embeds:  [
                        new MessageEmbed()
                            .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                            .setTitle("**✅ License hwid's cleared!**")
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
                            .addField("**Hwid-list**", "```yaml\n1: None```", false)
                            .setFooter({text: "Blaze Licenses"})
                            .setColor("AQUA")
                            .setTimestamp()
                    ], components: []})
                }
            });


        } else if (SubCommand === "edit") {
            // Options of the SubCommand
            const value = interaction.options.getString("value");

            // Check if the license already exists
            const license = await licenseModel.findOne({licensekey: value});
            if (!license) return interaction.reply(`🚫 license \`${value}\` does not exist!`);

            // Map Ip-List
            const ipList = license.ip_list.map((ip, i) => `${i+1}: ${ip}`)
            if (ipList.length == 0) ipList.push("1: None");

            // Map Hwid-List
            const hwidList = license.hwid_list.map((hwid, i) => `${i+1}: ${hwid.substring(0, 40)}${hwid.length > 40 ? "..." : ""}`)
            if (hwidList.length == 0) hwidList.push("1: None");

            // Component fot the embed (buttons)
            const row = new MessageActionRow().addComponents(
                new MessageButton()
                    .setLabel("Client name")
                    .setEmoji("👤")
                    .setCustomId("clientname")
                    .setStyle("PRIMARY"),
                new MessageButton()
                    .setLabel("Discord ID")
                    .setEmoji("🆔")
                    .setCustomId("discord_id")
                    .setStyle("PRIMARY"),
                new MessageButton()
                    .setLabel("Product")
                    .setEmoji("🛒")
                    .setCustomId("product_name")
                    .setStyle("PRIMARY"),
                new MessageButton()
                    .setLabel("IP-Cap")
                    .setEmoji("📡")
                    .setCustomId("ip_cap")
                    .setStyle("PRIMARY"),
                new MessageButton()
                    .setLabel("HWID-Cap")
                    .setEmoji("🔑")
                    .setCustomId("hwid_cap")
                    .setStyle("PRIMARY"),
            )

            // Send a message to the user with the license info to edit
            await interaction.reply({embeds: [
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
            ], components: [row], ephemeral: vanish});

            // Listen for the user to click on a button
            const msg = await interaction.fetchReply();
            const collector = msg.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.user.id && i.customId, time: 10000, max: 1 })
            collector.on("collect", async (ints) => {
                await ints.deferUpdate();
                if (ints.customId == "clientname") {
                    const filter = (m) => m.author.id === interaction.user.id;
                    await interaction.editReply({embeds: [
                        new MessageEmbed()
                            .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                            .setDescription("Set new value for client name by typing it to this channel. Client name must be 3 - 30 characters long!")
                            .addField("**Current clientname**", "```yaml\n" + license.clientname + "```", true)
                            .setFooter({text: "Blaze Licenses"})
                            .setColor("AQUA")
                            .setTimestamp()
                    ], components: []}).then(async (msg) => {
                        try {
                            await msg.channel.awaitMessages({ filter: filter, max: 1 }).then(async (val) => {
                                await val.first().delete();
                                const newClientName = val.first().content;
                                if (newClientName.length < 3 || newClientName.length > 30) return interaction.reply({embeds: [
                                    new MessageEmbed()
                                        .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                                        .setTitle("**❌ Invalid client name!**")
                                        .setDescription("Client name must be 3 - 30 characters long!")
                                        .setFooter({text: "Blaze Licenses"})
                                        .setColor("RED")
                                        .setTimestamp()
                                ]});
                                
                                license.clientname = newClientName;
                                license.updatedAt = Date.now();
                                await license.save();

                                const newLicense = await licenseModel.findOne({licensekey: value});
                                const ip_list = newLicense.ip_list.map((ip, i) => `${i+1}: ${ip}`)
                                if (ip_list.length == 0) ip_list.push("1: None");

                                await interaction.fetchReply();
                                interaction.editReply({embeds: [
                                    new MessageEmbed()
                                        .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                                        .setTitle("**✅ License updated!**")
                                        .addField("**License key**", "```yaml\n" + license.licensekey + "```")
                                        .addField("**Client name**", newLicense.clientname, true)
                                        .addField("**Discord id**", newLicense.discord_id, true)
                                        .addField("**Discord username**", newLicense.discord_username, true)
                                        .addField("**Product**", newLicense.product_name, true)
                                        .addField("**Created by**", newLicense.created_by ? newLicense.created_by : "none", true)
                                        .addField("**IP-Cap**", `${newLicense.ip_list.length}/${newLicense.ip_cap}`, true)
                                        .addField("**Hwid-Cap**", `${newLicense.hwid_list.length}/${newLicense.hwid_cap}`, true)
                                        .addField("**Latest IP**", newLicense.latest_ip ? newLicense.latest_ip : "none", true)
                                        .addField("**Latest HWID**", newLicense.latest_hwid ? newLicense.latest_hwid : "none", true)
                                        .addField("**Created at**", `<t:${(newLicense.createdAt / 1000 | 0)}:R>`, true)
                                        .addField("**Updated at**", `<t:${(newLicense.updatedAt / 1000 | 0)}:R>`, true)
                                        .addField("**IP-list**", "```yaml\n"+ ipList.join("\n").toString() +"```", false)
                                        .addField("**Hwid-list**", "```yaml\n"+ hwidList.join("\n").toString() +"```", false)
                                        .setFooter({text: "Blaze Licenses"})
                                        .setColor("AQUA")
                                        .setTimestamp()
                                ]}).then((msg) => {
                                    if (client.config.LICENSES_CONFIG.LOG_SYSTEM.ENABLED) {
                                        const webhook = new WebhookClient({url: client.config.LICENSES_CONFIG.LOG_SYSTEM.WEBHOOK_URL});
                                        webhook.send({embeds: [
                                            new MessageEmbed()
                                                .setAuthor({ name: `Request by ${interaction.user.id}`, iconURL: interaction.user.avatarURL() })
                                                .setTitle("**✅ License updated!**")
                                                .addField("**License key**", "```yaml\n" + license.licensekey + "```")
                                                .addField("**Client name**", newLicense.clientname, true)
                                                .addField("**Discord id**", newLicense.discord_id, true)
                                                .addField("**Discord username**", newLicense.discord_username, true)
                                                .addField("**Product**", newLicense.product_name, true)
                                                .addField("**Created by**", newLicense.created_by ? newLicense.created_by : "none", true)
                                                .addField("**IP-Cap**", `${newLicense.ip_list.length}/${newLicense.ip_cap}`, true)
                                                .addField("**Hwid-Cap**", `${newLicense.hwid_list.length}/${newLicense.hwid_cap}`, true)
                                                .addField("**Latest IP**", newLicense.latest_ip ? newLicense.latest_ip : "none", true)
                                                .addField("**Latest HWID**", newLicense.latest_hwid ? newLicense.latest_hwid : "none", true)
                                                .addField("**Created at**", `<t:${(newLicense.createdAt / 1000 | 0)}:R>`, true)
                                                .addField("**Updated at**", `<t:${(newLicense.updatedAt / 1000 | 0)}:R>`, true)
                                                .addField("**IP-list**", "```yaml\n"+ ipList.join("\n").toString() +"```", false)
                                                .addField("**Hwid-list**", "```yaml\n"+ hwidList.join("\n").toString() +"```", false)
                                                .setFooter({text: "Blaze Licenses"})
                                                .setColor("AQUA")
                                                .setTimestamp()
                                        ]});
                                    }
                                })
                            });
                        } catch (error) {
                            
                        }
                    })
                } else if (ints.customId == "discord_id") {
                    const filter = (m) => m.author.id === interaction.user.id;
                    await interaction.editReply({embeds: [
                        new MessageEmbed()
                            .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                            .setDescription("Set new value for Discord ID by typing it to this channel. Discord IDs are 17-18 characters long!")
                            .addField("**Current discord id**", "```yaml\n" + license.discord_id + "```", true)
                            .setFooter({text: "Blaze Licenses"})
                            .setColor("AQUA")
                            .setTimestamp()
                    ], components: []}).then(async (msg) => {
                        try {
                            await msg.channel.awaitMessages({ filter: filter, max: 1 }).then(async (val) => {
                                val.first().delete();
                                const newDiscordId = val.first().content;
                                if (newDiscordId.length < 17 || newDiscordId.length > 18) return interaction.editReply({embeds: [
                                    new MessageEmbed()
                                        .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                                        .setTitle("**❌ Invalid discord id!**")
                                        .setDescription("Discord id must be 17-18 characters long")
                                        .setFooter({text: "Blaze Licenses"})
                                        .setColor("RED")
                                        .setTimestamp()
                                ]});
                                const user = await client.users.fetch(newDiscordId);
                                if (!user) return interaction.editReply({embeds: [
                                    new MessageEmbed()
                                        .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                                        .setTitle("**❌ Invalid discord id!**")
                                        .setDescription("Discord id must be a valid user id!")
                                        .setFooter({text: "Blaze Licenses"})
                                        .setColor("RED")
                                        .setTimestamp()
                                ]})
                                
                                license.discord_id = user.id;
                                license.discord_username = user.username;
                                license.discord_tag = user.tag;
                                license.updatedAt = Date.now();
                                await license.save();

                                const newLicense = await licenseModel.findOne({licensekey: value});
                                const ip_list = newLicense.ip_list.map((ip, i) => `${i+1}: ${ip}`)
                                if (ip_list.length == 0) ip_list.push("1: None");

                                interaction.editReply({embeds: [
                                    new MessageEmbed()
                                        .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                                        .setTitle("**✅ License updated!**")
                                        .addField("**License key**", "```yaml\n" + license.licensekey + "```")
                                        .addField("**Client name**", newLicense.clientname, true)
                                        .addField("**Discord id**", newLicense.discord_id, true)
                                        .addField("**Discord username**", newLicense.discord_username, true)
                                        .addField("**Product**", newLicense.product_name, true)
                                        .addField("**Created by**", newLicense.created_by ? newLicense.created_by : "none", true)
                                        .addField("**IP-Cap**", `${newLicense.ip_list.length}/${newLicense.ip_cap}`, true)
                                        .addField("**HWID-Cap**", `${newLicense.hwid_list.length}/${newLicense.hwid_cap}`, true)
                                        .addField("**Latest IP**", newLicense.latest_ip ? newLicense.latest_ip : "none", true)
                                        .addField("**Latest HWID**", newLicense.latest_hwid ? newLicense.latest_hwid : "none", true)
                                        .addField("**Created at**", `<t:${(newLicense.createdAt / 1000 | 0)}:R>`, true)
                                        .addField("**Updated at**", `<t:${(newLicense.updatedAt / 1000 | 0)}:R>`, true)
                                        .addField("**IP-list**", "```yaml\n"+ ipList.join("\n").toString() +"```", false)
                                        .addField("**Hwid-list**", "```yaml\n"+ hwidList.join("\n").toString() +"```", false)
                                        .setFooter({text: "Blaze Licenses"})
                                        .setColor("AQUA")
                                        .setTimestamp()
                                ]}).then((msg) => {
                                    if (client.config.LICENSES_CONFIG.LOG_SYSTEM.ENABLED) {
                                        const webhook = new WebhookClient({url: client.config.LICENSES_CONFIG.LOG_SYSTEM.WEBHOOK_URL});
                                        webhook.send({embeds: [
                                            new MessageEmbed()
                                                .setAuthor({ name: `Updated by: ${interaction.user.id}`, iconURL: interaction.user.avatarURL() })
                                                .setTitle("**✅ License updated!**")
                                                .addField("**License key**", "```yaml\n" + license.licensekey + "```")
                                                .addField("**Client name**", newLicense.clientname, true)
                                                .addField("**Discord id**", newLicense.discord_id, true)
                                                .addField("**Discord username**", newLicense.discord_username, true)
                                                .addField("**Product**", newLicense.product_name, true)
                                                .addField("**Created by**", newLicense.created_by ? newLicense.created_by : "none", true)
                                                .addField("**IP-Cap**", `${newLicense.ip_list.length}/${newLicense.ip_cap}`, true)
                                                .addField("**HWID-Cap**", `${newLicense.hwid_list.length}/${newLicense.hwid_cap}`, true)
                                                .addField("**Latest IP**", newLicense.latest_ip ? newLicense.latest_ip : "none", true)
                                                .addField("**Latest HWID**", newLicense.latest_hwid ? newLicense.latest_hwid : "none", true)
                                                .addField("**Created at**", `<t:${(newLicense.createdAt / 1000 | 0)}:R>`, true)
                                                .addField("**Updated at**", `<t:${(newLicense.updatedAt / 1000 | 0)}:R>`, true)
                                                .addField("**IP-list**", "```yaml\n"+ ipList.join("\n").toString() +"```", false)
                                                .addField("**Hwid-list**", "```yaml\n"+ hwidList.join("\n").toString() +"```", false)
                                                .setFooter({text: "Blaze Licenses"})
                                                .setColor("AQUA")
                                                .setTimestamp()
                                        ]});
                                    }
                                })
                            });
                        } catch (error) {
                            console.error(error);
                        }
                    });                        
                } else if (ints.customId == "product_name") {
                    // Search for products
                    const products = await productModel.find();
                    const options = products.map(async (product, i) => {
                        return {
                            label: product.name,
                            description: await client.users.fetch(product.created_by).then(user => `Created by ${user.tag}`),
                            value: product.name,
                        }
                    })
                    const productOptions = await Promise.all(options);

                    // Components for the embed (menu)
                    const row = new MessageActionRow().addComponents(
                        new MessageSelectMenu()
                            .setCustomId("product_name")
                            .setOptions(productOptions)
                            .setMaxValues(1)
                    )

                    await interaction.editReply({embeds: [
                        new MessageEmbed()
                            .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                            .setDescription("Select new value for license product! You can select the value from menu below")
                            .addField("**Current product name**", "```yaml\n" + license.product_name + "```", true)
                            .setFooter({text: "Blaze Licenses"})
                            .setColor("AQUA")
                            .setTimestamp()
                    ], components: [row]})
                    await collector.stop();

                    const msg2 = await interaction.fetchReply();
                    const collector2 = msg2.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.user.id && i.customId, time: 300000 })
                    collector2.on('collect', async (ints) => {
                        await ints.deferUpdate();
                        const product = await productModel.findOne({name: ints.values[0]});
                        if (!product) return interaction.editReply({embeds: [
                            new MessageEmbed()
                                .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                                .setTitle("**❌ Invalid product**")
                                .setDescription("Product must be a valid product id!")
                                .setFooter({text: "Blaze Licenses"})
                                .setColor("RED")
                                .setTimestamp()
                        ]})

                        const product2 = await productModel.findOne({name: license.product_name});
                        if (!product2) return interaction.editReply({embeds: [
                            new MessageEmbed()
                                .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                                .setTitle("**❌ Invalid product**")
                                .setDescription("Product must be a valid product id!")
                                .setFooter({text: "Blaze Licenses"})
                                .setColor("RED")
                                .setTimestamp()
                        ]})

                        license.product_name = product.name;
                        license.updatedAt = Date.now();
                        await license.save();

                        product.total_purchases += 1;
                        product.updatedAt = Date.now();
                        await product.save();

                        product2.total_purchases -= 1;
                        product2.updatedAt = Date.now();
                        await product2.save();

                        const newLicense = await licenseModel.findOne({licensekey: value});

                        const ip_list = newLicense.ip_list.map((ip, i) => `${i+1}: ${ip}`)
                        if (ip_list.length == 0) ip_list.push("1: None");

                        // Map Hwid-List
                        const hwidList = license.hwid_list.map((hwid, i) => `${i+1}: ${hwid.substring(0, 40)}${hwid.length > 40 ? "..." : ""}`)
                        if (hwidList.length == 0) hwidList.push("1: None");

                        interaction.editReply({embeds: [
                            new MessageEmbed()
                                .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                                .setTitle("**✅ License updated!**")
                                .addField("**License key**", "```yaml\n" + license.licensekey + "```")
                                .addField("**Client name**", newLicense.clientname, true)
                                .addField("**Discord id**", newLicense.discord_id, true)
                                .addField("**Discord username**", newLicense.discord_username, true)
                                .addField("**Product**", newLicense.product_name, true)
                                .addField("**Created by**", newLicense.created_by ? newLicense.created_by : "none", true)
                                .addField("**IP-Cap**", `${newLicense.ip_list.length}/${newLicense.ip_cap}`, true)
                                .addField("**HWID-Cap**", `${newLicense.hwid_list.length}/${newLicense.hwid_cap}`, true)
                                .addField("**Latest IP**", newLicense.latest_ip ? newLicense.latest_ip : "none", true)
                                .addField("**Latest HWID**", newLicense.latest_hwid ? newLicense.latest_hwid : "none", true)
                                .addField("**Created at**", `<t:${(newLicense.createdAt / 1000 | 0)}:R>`, true)
                                .addField("**Updated at**", `<t:${(newLicense.updatedAt / 1000 | 0)}:R>`, true)
                                .addField("**IP-list**", "```yaml\n"+ ip_list.join("\n").toString() +"```", false)
                                .addField("**HWID-list**", "```yaml\n"+ hwidList.join("\n").toString() +"```", false)
                                .setFooter({text: "Blaze Licenses"})
                                .setColor("AQUA")
                                .setTimestamp()
                        ], components: []}).then((msg) => {
                            if (client.config.LICENSES_CONFIG.LOG_SYSTEM.ENABLED) {
                                const webhook = new WebhookClient({url: client.config.LICENSES_CONFIG.LOG_SYSTEM.WEBHOOK_URL});
                                webhook.send({embeds: [
                                    new MessageEmbed()
                                        .setAuthor({ name: `Update by: ${interaction.user.id}`, iconURL: interaction.user.avatarURL() })
                                        .setTitle("**✅ License updated!**")
                                        .addField("**License key**", "```yaml\n" + license.licensekey + "```")
                                        .addField("**Client name**", newLicense.clientname, true)
                                        .addField("**Discord id**", newLicense.discord_id, true)
                                        .addField("**Discord username**", newLicense.discord_username, true)
                                        .addField("**Product**", newLicense.product_name, true)
                                        .addField("**Created by**", newLicense.created_by ? newLicense.created_by : "none", true)
                                        .addField("**IP-Cap**", `${newLicense.ip_list.length}/${newLicense.ip_cap}`, true)
                                        .addField("**HWID-Cap**", `${newLicense.hwid_list.length}/${newLicense.hwid_cap}`, true)
                                        .addField("**Latest IP**", newLicense.latest_ip ? newLicense.latest_ip : "none", true)
                                        .addField("**Latest HWID**", newLicense.latest_hwid ? newLicense.latest_hwid : "none", true)
                                        .addField("**Created at**", `<t:${(newLicense.createdAt / 1000 | 0)}:R>`, true)
                                        .addField("**Updated at**", `<t:${(newLicense.updatedAt / 1000 | 0)}:R>`, true)
                                        .addField("**IP-list**", "```yaml\n"+ ip_list.join("\n").toString() +"```", false)
                                        .addField("**HWID-list**", "```yaml\n"+ hwidList.join("\n").toString() +"```", false)
                                        .setFooter({text: "Blaze Licenses"})
                                        .setColor("AQUA")
                                        .setTimestamp()
                                ]});
                            }
                        });
                    });
                } else if (ints.customId == "ip_cap") {
                    const filter = (i) => i.author.id === interaction.user.id;
                    await interaction.editReply({embeds: [
                        new MessageEmbed()
                            .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                            .setDescription("Set new value for IP-cap by typing it to this channel. IP-Cap must be greater than zero! `Number / None`")
                            .addField("**Current IP-cap**", "```yaml\n" + license.ip_cap + "```", true)
                            .setFooter({text: "Blaze Licenses"})
                            .setColor("AQUA")
                            .setTimestamp()
                    ], components: []}).then(async (msg) => {
                        try {
                            await msg.channel.awaitMessages({ filter: filter, max: 1 }).then(async (val) => {
                                val.first().delete();
                                const ip_cap = val.first().content;
                                if (ip_cap.toLowerCase() == "none") license.ip_cap = 0;
                                else license.ip_cap = parseInt(ip_cap);
                                
                                license.updatedAt = Date.now();
                                await license.save();

                                const newLicense = await licenseModel.findOne({licensekey: value});

                                const ipList = newLicense.ip_list.map((ip, i) => `${i+1}: ${ip}`)
                                if (ipList.length == 0) ipList.push("1: None");

                                // Map Hwid-List
                                const hwidList = license.hwid_list.map((hwid, i) => `${i+1}: ${hwid.substring(0, 40)}${hwid.length > 40 ? "..." : ""}`)
                                if (hwidList.length == 0) hwidList.push("1: None");

                                interaction.editReply({embeds: [
                                    new MessageEmbed()
                                        .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                                        .setTitle("**✅ License updated!**")
                                        .addField("**License key**", "```yaml\n" + license.licensekey + "```")
                                        .addField("**Client name**", newLicense.clientname, true)
                                        .addField("**Discord id**", newLicense.discord_id, true)
                                        .addField("**Discord username**", newLicense.discord_username, true)
                                        .addField("**Product**", newLicense.product_name, true)
                                        .addField("**Created by**", newLicense.created_by ? newLicense.created_by : "none", true)
                                        .addField("**IP-Cap**", `${newLicense.ip_list.length}/${newLicense.ip_cap}`, true)
                                        .addField("**HWID-Cap**", `${newLicense.hwid_list.length}/${newLicense.hwid_cap}`, true)
                                        .addField("**Latest IP**", newLicense.latest_ip ? newLicense.latest_ip : "none", true)
                                        .addField("**Latest HWID**", newLicense.latest_hwid ? newLicense.latest_hwid : "none", true)
                                        .addField("**Created at**", `<t:${(newLicense.createdAt / 1000 | 0)}:R>`, true)
                                        .addField("**Updated at**", `<t:${(newLicense.updatedAt / 1000 | 0)}:R>`, true)
                                        .addField("**IP-list**", "```yaml\n"+ ipList.join("\n").toString() +"```", false)
                                        .addField("**HWID-list**", "```yaml\n"+ hwidList.join("\n").toString() +"```", false)
                                        .setFooter({text: "Blaze Licenses"})
                                        .setColor("AQUA")
                                        .setTimestamp()
                                ]}).then((msg) => {
                                    if (client.config.LICENSES_CONFIG.LOG_SYSTEM.ENABLED) {
                                        const webhook = new WebhookClient({url: client.config.LICENSES_CONFIG.LOG_SYSTEM.WEBHOOK_URL});
                                        webhook.send({embeds: [
                                            new MessageEmbed()
                                                .setAuthor({ name: `Updated by: ${interaction.user.id}`, iconURL: interaction.user.avatarURL() })
                                                .setTitle("**✅ License updated!**")
                                                .addField("**License key**", "```yaml\n" + license.licensekey + "```")
                                                .addField("**Client name**", newLicense.clientname, true)
                                                .addField("**Discord id**", newLicense.discord_id, true)
                                                .addField("**Discord username**", newLicense.discord_username, true)
                                                .addField("**Product**", newLicense.product_name, true)
                                                .addField("**Created by**", newLicense.created_by ? newLicense.created_by : "none", true)
                                                .addField("**IP-Cap**", `${newLicense.ip_list.length}/${newLicense.ip_cap}`, true)
                                                .addField("**HWID-Cap**", `${newLicense.hwid_list.length}/${newLicense.hwid_cap}`, true)
                                                .addField("**Latest IP**", newLicense.latest_ip ? newLicense.latest_ip : "none", true)
                                                .addField("**Latest HWID**", newLicense.latest_hwid ? newLicense.latest_hwid : "none", true)
                                                .addField("**Created at**", `<t:${(newLicense.createdAt / 1000 | 0)}:R>`, true)
                                                .addField("**Updated at**", `<t:${(newLicense.updatedAt / 1000 | 0)}:R>`, true)
                                                .addField("**IP-list**", "```yaml\n"+ ipList.join("\n").toString() +"```", false)
                                                .addField("**HWID-list**", "```yaml\n"+ hwidList.join("\n").toString() +"```", false)
                                                .setFooter({text: "Blaze Licenses"})
                                                .setColor("AQUA")
                                                .setTimestamp()
                                        ]});
                                    }
                                })
                            })
                        } catch (error) {
                            console.error(error);
                        }
                    })
                } else if (ints.customId == "hwid_cap") {
                    interaction.editReply({embeds: [
                        new MessageEmbed()
                            .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                            .setTitle("**Set HWID-Cap**")
                            .setDescription("Please enter the new HWID-Cap.\n**Note:** You can set the HWID-Cap to 0 to disable it.")
                            .addField("**Current HWID-Cap**", license.hwid_cap.toString(), true)
                            .setFooter({text: "Blaze Licenses"})
                            .setColor("AQUA")
                            .setTimestamp()
                    ], components: []}).then(async (msg) => {
                        const filter = (m) => m.author.id == interaction.user.id && !isNaN(m.content);
                        try {
                            await msg.channel.awaitMessages({ filter: filter, max: 1 }).then(async (val) => {
                                val.first().delete();
                                const hwid_cap = val.first().content;
                                if (hwid_cap.toLowerCase() == "none") license.hwid_cap = 0;
                                else license.hwid_cap = parseInt(hwid_cap);
                                
                                license.updatedAt = Date.now();
                                await license.save();

                                const newLicense = await licenseModel.findOne({licensekey: value});

                                const ipList = newLicense.ip_list.map((ip, i) => `${i+1}: ${ip}`)
                                if (ipList.length == 0) ipList.push("1: None");

                                // Map Hwid-List
                                const hwidList = license.hwid_list.map((hwid, i) => `${i+1}: ${hwid.substring(0, 40)}${hwid.length > 40 ? "..." : ""}`)
                                if (hwidList.length == 0) hwidList.push("1: None");

                                interaction.editReply({embeds: [
                                    new MessageEmbed()
                                        .setAuthor({ name: `Updated by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                                        .setTitle("**✅ License updated!**")
                                        .addField("**License key**", "```yaml\n" + license.licensekey + "```")
                                        .addField("**Client name**", newLicense.clientname, true)
                                        .addField("**Discord id**", newLicense.discord_id, true)
                                        .addField("**Discord username**", newLicense.discord_username, true)
                                        .addField("**Product**", newLicense.product_name, true)
                                        .addField("**Created by**", newLicense.created_by ? newLicense.created_by : "none", true)
                                        .addField("**IP-Cap**", `${newLicense.ip_list.length}/${newLicense.ip_cap}`, true)
                                        .addField("**HWID-Cap**", `${newLicense.hwid_list.length}/${newLicense.hwid_cap}`, true)
                                        .addField("**Latest IP**", newLicense.latest_ip ? newLicense.latest_ip : "none", true)
                                        .addField("**Latest HWID**", newLicense.latest_hwid ? newLicense.latest_hwid : "none", true)
                                        .addField("**Created at**", `<t:${(newLicense.createdAt / 1000 | 0)}:R>`, true)
                                        .addField("**Updated at**", `<t:${(newLicense.updatedAt / 1000 | 0)}:R>`, true)
                                        .addField("**IP-list**", "```yaml\n"+ ipList.join("\n").toString() +"```", false)
                                        .addField("**HWID-list**", "```yaml\n"+ hwidList.join("\n").toString() +"```", false)
                                        .setFooter({text: "Blaze Licenses"})
                                        .setColor("AQUA")
                                        .setTimestamp()
                                ]});
                            });
                        } catch (error) {
                            console.error(error);
                        }
                    });
                }
            });
        }
    },
};
const { Client, CommandInteraction, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const productModel = require("../models/productsModel");
const paginationEmbed = require("../functions/paginationEmbed");

module.exports = {
    name: "product",
    description: "Blaze License",
    type: 'CHAT_INPUT',
    options: [
        {
            name: "create",
            description: "Create a new product",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "name",
                    description: "What is the name of the product?",
                    type: "STRING",
                    required: true
                },
                {
                    name: "version",
                    description: "What is the version of the product?",
                    type: "STRING",
                    required: true
                },
                {
                    name: "price",
                    description: "What is the price of the product?",
                    type: "INTEGER",
                    required: true
                },
            ],
        },
        {
            name: "edit",
            description: "Edit a specific product",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "name",
                    description: "Give the name of the product you want to edit",
                    type: "STRING",
                    required: true
                },
            ]
        },
        {
            name: "remove",
            description: "Remove a specific product",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "name",
                    description: "Give the name of the product you want to remove",
                    type: "STRING",
                    required: true
                },
            ]
        },
        {
            name: "list",
            description: "List all products",
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
        if(SubCommand == "create") {
            // Options of the product
            const name = interaction.options.getString("name");
            const version = interaction.options.getString("version");
            const price = interaction.options.getInteger("price");

            // Check if the product already exists
            const check = await productModel.findOne({ name: name });
            if(check) return interaction.reply(`🚫 that product already exists!`);

            // Create the product
            const product = new productModel({
                name,
                version,
                price,
                total_purchases: 0,
                created_by: interaction.user.id,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            // Save the product
            await product.save();

            // Send a message to the user that the product was created
            interaction.reply({embeds: [new MessageEmbed()
                .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                .setTitle("**New product created**")
                .addField("**❯ Product name:**", name.toString())
                .addField("**❯ Product version:**", version.toString())
                .addField("**❯ Product price:**", price.toString())
                .setFooter({text: "Blaze License"})
                .setColor("AQUA")
                .setTimestamp()
            ]});
        } else if(SubCommand == "edit") {
            // Options of the subcommand
            const name = interaction.options.getString("name");

            // Check if the product already exists
            const product = await productModel.findOne({ name: name });
            if(!product) return interaction.reply(`🚫 that product doesn't exist!`);

            // Components for the embed (buttons)
            const row = new MessageActionRow().addComponents(
                new MessageButton()
                    .setLabel("Name")
                    .setEmoji("📝")
                    .setCustomId("edit_name")
                    .setStyle("PRIMARY"),
                new MessageButton()
                    .setLabel("Version")
                    .setEmoji("🛠")
                    .setCustomId("edit_version")
                    .setStyle("PRIMARY"),
                new MessageButton()
                    .setLabel("Price")
                    .setEmoji("💰")
                    .setCustomId("edit_price")
                    .setStyle("PRIMARY"),
                new MessageButton()
                    .setLabel("Cancel")
                    .setEmoji("⛔")
                    .setCustomId("cancel")
                    .setStyle("DANGER")
            );

            // Send a message to the user with the product info to edit
            await interaction.reply({embeds: [
                new MessageEmbed()
                    .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                    .setTitle("**Edit product**")
                    .addField("**❯ Product:**", name.toString())
                    .addField("**❯ Created by:**", await client.users.fetch(product.created_by).then(user => user.tag))
                    .addField("**❯ Version:**", product.version.toString())
                    .addField("**❯ Choose value to edit:**", "You need to choose value to edit by pressing one the buttons bellow!")
                    .setFooter({text: "Blaze License"})
                    .setColor("AQUA")
                    .setTimestamp()
            ], components: [row]});

            // Listen for the user to click on a button
            const msg = await interaction.fetchReply();
            const collector = msg.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.user.id && i.customId, time: 10000 })
            collector.on("collect", async (ints) => {
                if(ints.customId == "edit_name") {
                    // Ask the user for the new name
                    const filter = (m) => m.author.id === interaction.user.id;
                    await interaction.editReply({embeds: [
                        new MessageEmbed()
                            .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                            .setTitle("**Edit product name**")
                            .addField("**❯ Current name:**", name.toString())
                            .addField("**New value:**", "Type new value for product name to the chat!")
                            .setFooter({text: "Blaze License"})
                            .setColor("AQUA")
                            .setTimestamp()
                    ], components: []}).then(async (msg) => {
                        try {
                            await msg.channel.awaitMessages({ filter: filter, max: 1 }).then(async (val) => {
                                // find if the product already exists
                                val.first().delete();
                                const check = await productModel.findOne({ name: val.first().content });
                                if(check) return interaction.editReply(`${interaction.user}, that product already exists!`);

                                // Update the name of the product
                                await productModel.findOneAndUpdate({ name: name }, { name: val.first().content, updatedAt: new Date() });
                                // Send a message to the user that the product was updated
                                interaction.editReply({embeds: [new MessageEmbed()
                                    .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                                    .setTitle("**Product name changed successfully**")
                                    .addField("**❯ Product:**", product.name.toString())
                                    .addField("**❯ Old product name:**", product.name.toString())
                                    .addField("**❯ New product name:**", val.first().content.toString())
                                    .setFooter({text: "Blaze License"})
                                    .setColor("AQUA")
                                    .setTimestamp()
                                ]});
                            })
                        } catch (error) {
                            console.error(error);
                        }
                    })
                } else if(ints.customId == "edit_version") {
                    // Ask the user for the new version
                    const filter = (m) => m.author.id === interaction.user.id;
                    await interaction.editReply({embeds: [
                        new MessageEmbed()
                            .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                            .setTitle("**Edit product version**")
                            .addField("**❯ Current version:**", product.version.toString())
                            .addField("**New value:**", "Type new value for product version to the chat!")
                            .setFooter({text: "Blaze License"})
                            .setColor("AQUA")
                            .setTimestamp()
                    ], components: []}).then(async (msg) => {
                        try {
                            await msg.channel.awaitMessages({ filter: filter, max: 1 }).then(async (val) => {
                                // Update the version of the product
                                val.first().delete();
                                await productModel.findOneAndUpdate({ name: name }, { version: val.first().content, updatedAt: new Date() });
                                // Send a message to the user that the product was updated
                                interaction.editReply({embeds: [new MessageEmbed()
                                    .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                                    .setTitle("**Product version changed successfully**")
                                    .addField("**❯ Product:**", product.name.toString())
                                    .addField("**❯ Old product version:**", product.version.toString())
                                    .addField("**❯ New product version:**", val.first().content.toString())
                                    .setFooter({text: "Blaze License"})
                                    .setColor("AQUA")
                                    .setTimestamp()
                                ]});
                            })
                        } catch (error) {
                            console.error(error);
                        }
                    })
                } else if(ints.customId == "edit_price") {
                    // Ask the user for the new price
                    const filter = (m) => m.author.id === interaction.user.id;
                    await interaction.editReply({embeds: [
                        new MessageEmbed()
                            .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                            .setTitle("**Edit product price**")
                            .addField("**❯ Current price:**", product.price.toString())
                            .addField("**New value:**", "Type new value for product price to the chat!")
                            .setFooter({text: "Blaze License"})
                            .setColor("AQUA")
                            .setTimestamp()
                    ], components: []}).then(async (msg) => {
                        try {
                            await msg.channel.awaitMessages({ filter: filter, max: 1 }).then(async (val) => {
                                // Update the price of the product
                                val.first().delete();
                                await productModel.findOneAndUpdate({ name: name }, { price: val.first().content, updatedAt: new Date() });
                                // Send a message to the user that the product was updated
                                interaction.editReply({embeds: [new MessageEmbed()
                                    .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                                    .setTitle("**Product price changed successfully**")
                                    .addField("**❯ Product:**", product.name.toString())
                                    .addField("**❯ Old product price:**", product.price.toString())
                                    .addField("**❯ New product price:**", val.first().content.toString())
                                    .setFooter({text: "Blaze License"})
                                    .setColor("AQUA")
                                    .setTimestamp()
                                ]});
                            })
                        } catch (error) {
                            console.error(error);
                        }
                    })
                } else if(ints.customId == "cancel") {
                    interaction.editReply({embeds: [
                        new MessageEmbed()
                            .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                            .setTitle("**Edit product**")
                            .addField("**❯ Product:**", name.toString())
                            .addField("**❯ Created by:**", await client.users.fetch(product.created_by).then(user => user.tag))
                            .addField("**❯ Version:**", product.version.toString())
                            .addField("**❯ Choose value to edit:**", "You need to choose value to edit by pressing one the buttons bellow!")
                            .setFooter({text: "Blaze License"})
                            .setColor("RED")
                            .setTimestamp()
                    ], components: []});
                    return collector.stop();
                }
            })

            collector.on("end", async (ints) => {
                interaction.editReply({embeds: [
                    new MessageEmbed()
                        .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                        .setTitle("**Edit product**")
                        .addField("**❯ Product:**", name.toString())
                        .addField("**❯ Created by:**", await client.users.fetch(product.created_by).then(user => user.tag))
                        .addField("**❯ Version:**", product.version.toString())
                        .addField("**❯ Choose value to edit:**", "You need to choose value to edit by pressing one the buttons bellow!")
                        .setFooter({text: "Blaze License"})
                        .setColor("RED")
                        .setTimestamp()
                ], components: []});
            })
        } else if(SubCommand == "list") {
            // Get all the products
            const products = await productModel.find();
            if(!products || products?.length == 0) return interaction.reply(`🚫 there are no products!`);
            let embeds = [];

            // Add the products to the embeds array
            for(let i = 0; i < products.length; i++) {
                embeds.push(new MessageEmbed()
                    .setAuthor({ name: `License list`, iconURL: client.user.avatarURL() })
                    .addField("**Product name**", "```yaml\n" + products[i].name + "```")
                    .addField("**Total purchases**", products[i].total_purchases.toString(), true)
                    .addField("**Version**", products[i].version.toString(), true)
                    .addField("**Created by**", await client.users.fetch(products[i].created_by).then(user => user.tag), true)
                    .addField("**Price**", products[i].price.toString(), true)
                    .addField("**Created at**", `<t:${(products[i].createdAt / 1000 | 0).toString()}:R>`, true)
                    .addField("**Last updated at**", `<t:${(products[i].updatedAt / 1000 | 0).toString()}:R>`, true)
                    .setFooter({text: "Blaze License"})
                    .setColor("AQUA")
                    .setTimestamp()
                );
            }
            if(embeds.length == 1) return interaction.reply({embeds});
            paginationEmbed(interaction, ["⏪", "Previous", "Next", "⏩"], embeds, "60s");
        } else if(SubCommand == "remove") {
            // Options of the subcommand
            const name = interaction.options.getString("name");

            // Check if the product already exists
            const check = await productModel.findOne({ name: name });
            if(!check) return interaction.reply(`🚫 **${name}** doesn't exist!`);

            // Delete the product
            await productModel.findOneAndDelete({ name: name });

            // Send a message to the user that the product was deleted
            interaction.reply({embeds: [new MessageEmbed()
                .setAuthor({ name: `Request by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                .setTitle("**Product successfully deleted**")
                .addField("**❯ Deleted product:**", check.name.toString())
                .addField("**❯ Product version:**", check.version.toString())
                .addField("**❯ Total purchases:**", check.total_purchases.toString())
                .addField("**❯ Created by:**", await client.users.fetch(check.created_by).then(user => user.tag))
                .setFooter({text: "Blaze License"})
                .setColor("AQUA")
                .setTimestamp()
            ]});
        }
    },
};
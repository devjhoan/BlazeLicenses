// Packages required:
const { MessageEmbed, WebhookClient } = require("discord.js");
const express = require("express");
const fs = require("fs");
const yaml = require("js-yaml");
const config = yaml.load(fs.readFileSync("config/config.yml", "utf8"));
const bodyParser = require('body-parser');
const app = express();

// Config Server
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
let hook;
if (config.LICENSES_CONFIG.LOG_SYSTEM.ENABLED) hook = new WebhookClient({url: config.LICENSES_CONFIG.LOG_SYSTEM.WEBHOOK_URL});

// Models Mongoose
const licenseModel = require('../models/licenseModel');
const productsModel = require('../models/productsModel');

// Routes
app.post('/api/client/', async (req, res) => {
    // Importing variables
    const { licensekey, product, version, hwid } = req.body;
    const ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
    const authorization_key = req.headers.authorization;

    // Checking if the license is valid
    if (licensekey && product && version && authorization_key) {
        if (!authorization_key === config.LICENSES_CONFIG.API_KEY) {
            return res.send({
                "status_msg": "FAILED_AUTHENTICATION",
                "status_overview": "failed",
                "status_code": 400
            });
        } else {
            const product_db = await productsModel.findOne({ name: product });
            if (product_db) {
                const license_db = await licenseModel.findOne({ licensekey });
                if (license_db) {
                    if (license_db.product_name === product) {
                        if (license_db.ip_cap !== 0) {
                            if (license_db.ip_list.length >= license_db.ip_cap) {
                                return res.send({
                                    "status_msg": "MAX_IP_CAP",
                                    "status_overview": "failed",
                                    "status_code": 401 
                                });
                            }
                        }
                        
                        if (!license_db.ip_list.includes(ip)) license_db.ip_list.push(ip);
                        if (license_db.latest_ip !== ip) license_db.latest_ip = ip;

                        if (hwid) {
                            if (license_db.hwid_cap !== 0) {
                                if (license_db.hwid_list.length >= license_db.hwid_cap) {
                                    return res.send({
                                        "status_msg": "MAX_HWID_CAP",
                                        "status_overview": "failed",
                                        "status_code": 401 
                                    });
                                }
                            }

                            if (!license_db.hwid_list.includes(hwid)) license_db.hwid_list.push(hwid);
                            if (license_db.latest_hwid !== hwid) license_db.latest_hwid = hwid;
                        }

                        license_db.total_requests++;
                        await license_db.save();

                        const ip_list = license_db.ip_list.map((ip, i) => `${i + 1}: ${ip}`)
                        if (ip_list.length == 0) ip_list.push("1: None");

                        const hwidList = license.hwid_list.map((hwid, i) => `${i+1}: ${hwid.substring(0, 40)}${hwid.length > 40 ? "..." : ""}`)
                        if (hwidList.length == 0) hwidList.push("1: None");

                        try {
                            if (hook) {
                                hook.send({embeds: [
                                    new MessageEmbed()
                                        .setAuthor({name: "Successful authentication", iconURL: config.LICENSES_CONFIG.LOG_SYSTEM.WEBHOOK_IMAGE})
                                        .setColor("GREEN")
                                        .addFields([
                                            { name: "License Key", value: "```yaml\n" + licensekey + "```", inline: false },
                                            { name: "Clientname", value: license_db.clientname, inline: true },
                                            { name: "Discord ID", value: license_db.discord_id, inline: true },
                                            { name: "Discord username", value: license_db.discord_username, inline: true },
                                            { name: "Version", value: version.toString(), inline: true },
                                            { name: "Product", value: product, inline: true },
                                            { name: "Created by", value: license_db.created_by, inline: true },
                                            { name: "Created at", value: `<t:${(license_db.createdAt / 1000 | 0)}:R>`, inline: true },
                                            { name: "IP-cap", value: `${license_db.ip_list.length}/${license_db.ip_cap}`, inline: true },
                                            { name: "HWID-cap", value: `${license_db.hwid_list.length}/${license_db.hwid_cap}`, inline: true },
                                            { name: "IP-list", value: "```yaml\n" + ip_list.join("\n") + "```", inline: false },
                                            { name: "HWID-list", value: "```yaml\n" + hwidList.join("\n") + "```", inline: false },
                                        ])
                                ]})
                            };
                        } catch (error) {
                            logger.error(error);
                        }

                        return res.send({
                            "status_msg": "SUCCESSFUL_AUTHENTICATION",
                            "status_overview": "success",
                            "status_code": 200,
                            "status_id": "SUCCESS",
                            "version": product_db.version.toString(),
                            "clientname": license_db.clientname.toString(),
                            "discord_username": license_db.discord_username.toString(),
                            "discord_tag": license_db.discord_tag.toString(),
                            "discord_id": license_db.discord_id.toString(),
                        });
                    } else {
                        return res.send({
                            "status_msg": "INVALID_PRODUCT",
                            "status_overview": "failed",
                            "status_code": 401
                        });
                    }
                } else {
                    try {
                        if (hook) {
                            hook.send({embeds: [
                                new MessageEmbed()
                                    .setAuthor({name: "Invalid licensekey", iconURL: config.LICENSES_CONFIG.LOG_SYSTEM.WEBHOOK_IMAGE})
                                    .setColor("DARK_RED")
                                    .addField("**Licensekey**", "```yaml\n" + licensekey + "```")
                                    .addField("**IP-Address**", ip, false)
                                    .addField("**Product**", product, true)
                                    .addField("**Version**", version, true)
                                    .setFooter({text: "Blaze Licenses"})
                                    .setTimestamp()
                            ]});
                        }
                    } catch (error) {
                        logger.error(error);
                    }
                    return res.send({
                        "status_msg": "INVALID_LICENSEKEY",
                        "status_overview": "failed",
                        "status_code": 401
                    });
                }
            } else {
                return res.send({
                    "status_msg": "PRODUCT_NOT_FOUND",
                    "status_overview": "failed",
                    "status_code": 401
                });
            }
        }
    } else {
        return res.send({
            "status_msg": "INVALID_REQUEST",
            "status_overview": "failed",
            "status_code": 400
        });
    }
});

app.get('*', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.send("");
});

// Start Server
app.listen(config.LICENSES_CONFIG.WEB_PORT || 3000, () => {
    
});
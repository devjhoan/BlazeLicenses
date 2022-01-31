// Packages required:
const express = require("express");
const fs = require("fs");
const yaml = require("js-yaml");
const config = yaml.load(fs.readFileSync("config/config.yml", "utf8"));
const bodyParser = require('body-parser');
const app = express();

// Config Server
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Models Mongoose
const licenseModel = require('../models/licenseModel');
const productsModel = require('../models/productsModel');
const usersModel = require("../models/usersModel");

// Routes
app.post('/api/client/', async (req, res) => {
    // Importing variables
    const { licensekey, product, version } = req.body;
    const authorization_key = req.headers.authorization;

    // Checking if the license is valid
    if(licensekey && product && version && authorization_key) {
        const findAuthKey = await usersModel.findOne({ api_key: authorization_key });
        if(!findAuthKey) {
            return res.send({
                "status_msg": "FAILED_AUTHENTICATION",
                "status_overview": "failed",
                "status_code": 400
            });
        } else {
            const product_db = await productsModel.findOne({ name: product });
            if(product_db) {
                const license_db = await licenseModel.findOne({ licensekey });
                if(license_db) {

                    /**
                     * hardoced? (fix u idiot)
                     * hardoced? (fix u idiot)
                     * hardoced? (fix u idiot)
                     * hardoced? (fix u idiot)
                     */

                    if(license_db.product_name == product) {
                        if(!license_db.ip_cap == 0) {
                            if(license_db.ip_list.length >= license_db.ip_cap) {
                                return res.send({
                                    "status_msg": "MAX_IP_CAP",
                                    "status_overview": "failed",
                                    "status_code": 401 
                                });
                            }
                        }
                        
                        const ip = req.socket?.remoteAddress.replace(/^.*:/, '');
                        if(!license_db.ip_list.includes(ip)) license_db.ip_list.push(ip);

                        if(license_db.latest_ip != ip) license_db.latest_ip = ip;

                        license_db.total_requests++;
                        await license_db.save();

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
                    return res.send({
                        "status_msg": "INVALID_LICENSEKEY",
                        "status_overview": "failed",
                        "status_code": 401
                    });
                }
            } else {
                return res.send({
                    "status_msg": "INVALID_PRODUCT",
                    "status_overview": "failed",
                    "status_code": 401
                });
            }
        }
    } else {
        return res.send({
            "status_msg": "FAILED_AUTHENTICATION",
            "status_overview": "failed",
            "status_code": 400
        });
    }
});

// Start Server
app.listen(config.LICENSES_CONFIG.WEB_PORT || 3000, () => {
    console.log("REST API Server started on port 3000");
});
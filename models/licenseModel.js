const mongoose = require('mongoose');

const schema = new mongoose.Schema ({
    product_name: String,
    licensekey: String,
    clientname: String,
    discord_id: String,
    discord_username: String,
    discord_tag: String,
    ip_list: [Object],
    ip_cap: Number,
    total_requests: {
        type: Number,
        default: 0
    },
    created_by: String,
    createdAt: Date,
    updatedAt: Date,
    latest_ip: {
        type: String,
        default: ""
    }
});

module.exports = mongoose.model('licenses', schema);
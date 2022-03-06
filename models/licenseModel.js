const mongoose = require('mongoose');

const schema = new mongoose.Schema ({
    product_name: String,
    licensekey: String,
    clientname: String,
    discord_id: String,
    discord_username: String,
    discord_tag: String,
    ip_list: [{
        ip: String,
        created_at: Date,
        _id: false
    }],
    hwid_list: [{
        hwid: String,
        created_at: Date,
        _id: false
    }],
    ip_cap: Number,
    hwid_cap: Number,
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
    },
    latest_hwid: {
        type: String,
        default: ""
    }
});

module.exports = mongoose.model('licenses', schema);
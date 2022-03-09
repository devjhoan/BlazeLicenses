const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    blacklisted: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    blocked_connections: {
        type: Number,
        required: true,
        default: 0
    },
    created_by: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
    },
    updatedAt: {
        type: Date,
        required: true,
    }
});

module.exports = mongoose.model('blacklists', schema);
const mongoose = require('mongoose');

const schema = new mongoose.Schema ({
    name: String,
    user_id: String,
    role: String,
    licenses_created: Number,
    api_key: String,
    created_by: String,
    created_at: Date,
});

module.exports = mongoose.model('users', schema);
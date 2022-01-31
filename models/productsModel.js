const mongoose = require('mongoose');

const schema = new mongoose.Schema ({
    name: String,
    price: Number,
    version: String,
    total_purchases: Number,
    created_by: String,
    createdAt: Date,
    updatedAt: Date,
});

module.exports = mongoose.model('products', schema);
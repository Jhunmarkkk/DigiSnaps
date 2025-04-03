const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    category: {
        type: String,
        required: [true, 'Please enter category name']
    },
    images: [
        {
            public_id: String,
            url: String
        }
    ]
});

module.exports = mongoose.model('Category', categorySchema); 
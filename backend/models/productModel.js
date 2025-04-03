const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter product name']
    },
    description: {
        type: String,
        required: [true, 'Please enter product description']
    },
    price: {
        type: Number,
        required: [true, 'Please enter product price']
    },
    stock: {
        type: Number,
        required: [true, 'Please enter product stock'],
        default: 1
    },
    category: {
        type: String,
        required: [true, 'Please enter product category']
    },
    images: [
        {
            public_id: String,
            url: String
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema); 
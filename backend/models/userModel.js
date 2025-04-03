const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name']
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        validate: [validator.isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in normal queries
    },
    address: {
        type: String,
        required: [true, 'Please enter your address']
    },
    city: {
        type: String,
        required: [true, 'Please enter your city']
    },
    country: {
        type: String,
        required: [true, 'Please enter your country']
    },
    pinCode: {
        type: String,
        required: [true, 'Please enter your pin code']
    },
    avatar: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Remove all indexes before creating new ones
userSchema.pre('save', async function(next) {
    try {
        await mongoose.model('User').collection.dropIndexes();
    } catch (error) {
        console.log('Error dropping indexes:', error);
    }
    next();
});

// Create only the indexes we need
userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

module.exports = User; 
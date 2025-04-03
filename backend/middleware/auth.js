const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const auth = async (req, res, next) => {
    try {
        let token;
        
        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            console.log('Token from Authorization header:', token);
        }
        // Also check cookies for backward compatibility
        else if (req.cookies.token) {
            token = req.cookies.token;
            console.log('Token from cookies:', token);
        }

        if (!token) {
            console.log('No token found in request');
            return res.status(401).json({
                success: false,
                message: 'Please login to access this resource'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded token:', decoded);

            // Get user from token
            const user = await User.findById(decoded.id);
            if (!user) {
                console.log('No user found with token ID:', decoded.id);
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            req.user = user;
            next();
        } catch (error) {
            console.log('Token verification error:', error.message);
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

module.exports = auth; 
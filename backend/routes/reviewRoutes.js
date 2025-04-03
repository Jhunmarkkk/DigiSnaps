const express = require('express');
const router = express.Router();
const Review = require('../models/reviewModel');
const Product = require('../models/productModel');

// Create new review or update existing review
router.post('/new', async (req, res) => {
    try {
        const { rating, comment, productId } = req.body;

        const review = await Review.create({
            rating,
            comment,
            product: productId,
            user: req.user._id
        });

        // Calculate average rating for the product
        const reviews = await Review.find({ product: productId });
        const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

        // Update product with new average rating
        await Product.findByIdAndUpdate(productId, {
            ratings: avgRating
        });

        res.status(201).json({
            success: true,
            review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get all reviews for a product
router.get('/product/:id', async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.id })
            .populate('user', 'name avatar');

        res.status(200).json({
            success: true,
            reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get user's reviews
router.get('/my', async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user._id })
            .populate('product', 'name images');

        res.status(200).json({
            success: true,
            reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update review
router.put('/:id', async (req, res) => {
    try {
        let review = await Review.findById(req.params.id);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if the review belongs to the user
        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own reviews'
            });
        }

        review = await Review.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        // Recalculate average rating
        const reviews = await Review.find({ product: review.product });
        const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

        await Product.findByIdAndUpdate(review.product, {
            ratings: avgRating
        });

        res.status(200).json({
            success: true,
            review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete review
router.delete('/:id', async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if the review belongs to the user
        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own reviews'
            });
        }

        const productId = review.product;
        await review.deleteOne();

        // Recalculate average rating
        const reviews = await Review.find({ product: productId });
        const avgRating = reviews.length > 0 
            ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
            : 0;

        await Product.findByIdAndUpdate(productId, {
            ratings: avgRating
        });

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router; 
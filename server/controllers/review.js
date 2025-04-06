import { User } from "../models/user.js";
import { Order } from "../models/order.js";
import { Review } from "../models/review.js";
import { asyncError } from "../middlewares/error.js";

export const getAllReviews = asyncError(async (req, res, next) => {
  try {
    const productId = req.params.productId;
    console.log(`Server fetching reviews for product: ${productId}`);
    
    // Find all reviews for this product and sort by newest first
    const reviews = await Review.find({ product: productId })
      .sort({ createdAt: -1 });
    
    console.log(`Server found ${reviews.length} reviews:`, JSON.stringify(reviews));
    
    // Return the reviews array
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Server error fetching reviews:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export const getProductRatings = asyncError(async (req, res, next) => {
  try {
    const productId = req.params.productId;

    const reviews = await Review.find({ product: productId });

    if (reviews.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No ratings found for this product" });
    }

    let totalRating = 0;
    reviews.forEach((review) => {
      totalRating += review.rating;
    });
    const averageRating = totalRating / reviews.length;

    res.status(200).json({ success: true, averageRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Add and Update
export const addReview = asyncError(async (req, res, next) => {
  try {
    const { comment, productId, userId, rating } = req.body;
    
    console.log("Adding review with user:", userId);
    console.log("Adding review for product:", productId);
    console.log("Rating:", rating);
    console.log("Comment:", comment);
    
    // Check if userId is a valid MongoDB ObjectId
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(userId);
    
    // Find the user document
    let user;
    if (isValidObjectId) {
      // If it's a valid ObjectId, find by _id
      user = await User.findById(userId);
    } else {
      // If not a valid ObjectId, it might be a Google ID
      console.log("User ID is not a valid MongoDB ObjectId, trying to find by googleId or email");
      user = await User.findOne({ googleId: userId });
      
      // If not found by googleId, try finding by basic info if available
      if (!user && req.user) {
        user = await User.findById(req.user._id);
      }
    }
    
    // If user still not found, return error
    if (!user) {
      console.error("User not found with ID:", userId);
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    
    console.log("Adding review with data:", {
      comment, 
      productId, 
      userId: user._id.toString(),
      rating
    });
    
    // Check if the user has ordered and received the product
    const userOrder = await Order.findOne({
      "orderItems.product": productId,
      user: user._id,
      orderStatus: "Delivered",
    });

    if (!userOrder) {
      return res.status(400).json({
        success: false,
        message: "You can only review on delivered products",
      });
    }

    if (!user.reviews) {
      user.reviews = [];
    }

    const existingReview = await Review.findOne({
      user: user._id,
      product: productId,
    });

    if (existingReview) {
      existingReview.comment = comment;
      existingReview.rating = rating;

      await existingReview.save();

      return res.status(200).json({
        success: true,
        message: "Review Updated Successfully",
      });
    }

    const newReview = await Review.create({
      comment,
      product: productId,
      user: user._id,
      rating,
    });

    await newReview.save();

    user.reviews.push(newReview);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Reviewed Successfully",
    });
  } catch (error) {
    console.error("Review error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export const deleteReview = asyncError(async (req, res, next) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    if (review.user.toString() !== userId && req.user.role !== "Admin") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Unauthorized to delete this review",
        });
    }

    await review.deleteOne();

    if (req.user.role !== "admin") {
      const user = await User.findById(userId);
      if (user) {
        user.reviews = user.reviews.filter(
          (review) => review.toString() !== reviewId
        );
        await user.save();
      }
    }

    res
      .status(200)
      .json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

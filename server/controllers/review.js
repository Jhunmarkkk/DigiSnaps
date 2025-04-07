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
    
    console.log("Received review request with data:", {
      comment,
      productId,
      userId,
      rating,
      authenticatedUser: req.user?._id
    });
    
    // Basic validation
    if (!comment || !productId || !userId || rating === undefined) {
      console.error("Missing required fields for review:", {
        comment: !!comment,
        productId: !!productId,
        userId: !!userId,
        rating: rating
      });
      return res.status(400).json({
        success: false,
        message: "Missing required fields for review"
      });
    }
    
    // Check if the authenticated user matches the userId
    if (req.user._id.toString() !== userId) {
      console.error("User ID mismatch:", {
        requestUserId: userId,
        authenticatedUserId: req.user._id.toString()
      });
      return res.status(403).json({
        success: false,
        message: "You can only submit reviews as yourself"
      });
    }

    // Check for delivered order
    console.log("Looking for delivered order with product:", productId, "and user:", userId);
    const userOrder = await Order.findOne({
      "orderItems.product": productId,
      user: userId,
      orderStatus: "Delivered",
    });

    if (!userOrder) {
      console.error("No delivered order found for review submission");
      return res.status(400).json({
        success: false,
        message: "You can only review products from delivered orders"
      });
    }
    
    console.log("Found delivered order:", userOrder._id);

    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found:", userId);
      return res.status(400).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    if (!user.reviews) {
      user.reviews = [];
    }

    // Check for existing review
    const existingReview = await Review.findOne({
      user: userId,
      product: productId,
    });

    if (existingReview) {
      console.log("Updating existing review:", existingReview._id);
      existingReview.comment = comment;
      existingReview.rating = rating;

      await existingReview.save();

      return res.status(200).json({
        success: true,
        message: "Review Updated Successfully",
      });
    }

    console.log("Creating new review");
    const newReview = await Review.create({
      comment,
      product: productId,
      user: userId,
      rating,
    });

    await newReview.save();

    user.reviews.push(newReview);
    await user.save();

    console.log("Review created successfully:", newReview._id);
    res.status(200).json({
      success: true,
      message: "Reviewed Successfully",
    });
  } catch (error) {
    console.error("Server error in addReview:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Internal Server Error" 
    });
  }
});

export const deleteReview = asyncError(async (req, res, next) => {
  try {
    const reviewId = req.params.id;
    
    // Fix: Use _id instead of id to match MongoDB's ObjectId format
    const userId = req.user._id;

    console.log("Attempting to delete review:", reviewId, "by user:", userId);
    
    const review = await Review.findById(reviewId);
    if (!review) {
      console.log("Review not found:", reviewId);
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    console.log("Review owner:", review.user, "Current user:", userId);
    
    // Fix: Use toString() on both sides of the comparison to ensure string comparison
    if (review.user.toString() !== userId.toString() && req.user.role !== "admin") {
      console.log("Unauthorized access - review owner:", review.user.toString(), "Current user:", userId.toString());
      return res
        .status(403)
        .json({
          success: false,
          message: "Unauthorized to delete this review",
        });
    }

    await review.deleteOne();
    console.log("Review deleted:", reviewId);

    // Fix: Also convert to lowercase for role check
    if (req.user.role.toLowerCase() !== "admin") {
      const user = await User.findById(userId);
      if (user) {
        user.reviews = user.reviews.filter(
          (review) => review.toString() !== reviewId
        );
        await user.save();
        console.log("User's review list updated");
      }
    }

    res
      .status(200)
      .json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Internal Server Error" 
    });
  }
});

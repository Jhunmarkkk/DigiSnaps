import axios from "axios";
import { server } from "../store";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getAllReviews = (id) => async (dispatch) => {
  try {
    dispatch({ type: "getAllReviewsRequest" });
    
    console.log(`Fetching reviews for product: ${id}`);
    
    // Check if ID is valid to prevent unnecessary API calls
    if (!id) {
      throw new Error("Invalid product ID");
    }
    
    // Set timeout to handle slow connections
    const response = await axios.get(`${server}/review/${id}`, {
      timeout: 10000 // 10 seconds timeout
    });
    
    console.log("Raw API response:", response.data);
    
    // Handle different response formats and ensure we always have an array
    let reviews = [];
    if (response.data && Array.isArray(response.data)) {
      reviews = response.data;
    } else if (response.data && response.data.reviews && Array.isArray(response.data.reviews)) {
      reviews = response.data.reviews;
    } else if (response.data) {
      // If it's an object but not an array, try to convert to array
      console.log("Response is not an array, trying to convert");
      reviews = [response.data];
    }
    
    console.log(`Fetched ${reviews.length} reviews:`, reviews);
    
    // Ensure we're passing an array to the reducer
    if (!Array.isArray(reviews)) {
      console.error("Reviews is not an array:", reviews);
      reviews = [];
    }
    
    // Double-check that each review has required fields
    reviews = reviews.filter(review => {
      if (!review || !review._id || !review.comment) {
        console.log("Filtering out invalid review:", review);
        return false;
      }
      return true;
    });
    
    console.log(`After filtering, ${reviews.length} valid reviews remain`);
    
    // Sort reviews by date if possible
    reviews.sort((a, b) => {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    
    dispatch({ type: "getAllReviewsSuccess", payload: reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    
    // Handle case where there are no reviews yet
    if (error.response && error.response.status === 404) {
      console.log("No reviews found (404), setting empty array");
      dispatch({ type: "getAllReviewsSuccess", payload: [] });
      return;
    }
    
    dispatch({ 
      type: "getAllReviewsFail", 
      payload: error.response?.data?.message || "Failed to fetch reviews" 
    });
  }
};

export const addReview = (comment, rating, productId) => async (dispatch, getState) => {
  try {
    dispatch({ type: "addReviewRequest" });
    
    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error("Authentication token not found. Please login again.");
    }
    
    // Get user ID from Redux state
    const { user } = getState().user;
    
    if (!user || !user._id) {
      throw new Error("User not logged in or user ID not found");
    }
    
    const reviewData = {
      comment,
      rating: Number(rating),
      productId,
      userId: user._id
    };
    
    console.log("Adding review with data:", reviewData);
    
    const response = await axios.post(
      `${server}/review/create`,
      reviewData,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        withCredentials: false
      }
    );
    
    console.log("Review added successfully:", response.data);
    
    dispatch({ type: "addReviewSuccess" });
    
    // Refresh reviews and ratings after successfully adding a review
    dispatch(getAllReviews(productId));
    dispatch(getProductRatings(productId));
    
    return response.data;
  } catch (error) {
    console.error("Error adding review:", error);
    dispatch({ 
      type: "addReviewFail", 
      payload: error.response?.data?.message || "Failed to add review" 
    });
  }
};

export const getProductRatings = (productId) => async (dispatch) => {
  try {
    dispatch({ type: "getProductRatingsRequest" });
    
    // Check if ID is valid to prevent unnecessary API calls
    if (!productId) {
      console.log("Invalid product ID for ratings");
      dispatch({ type: "getProductRatingsSuccess", payload: 0 });
      return;
    }
    
    console.log("Fetching product ratings for:", productId);
    
    // Make sure to use the correct API endpoint that matches the server routes
    const response = await axios.get(`${server}/review/ratings/${productId}`);
    
    // Extract rating from response, defaulting to 0 if not found
    const rating = response.data?.averageRating || 0;
    
    console.log("Product rating:", rating);
    
    dispatch({ 
      type: "getProductRatingsSuccess", 
      payload: rating
    });
    
    return rating;
  } catch (error) {
    console.error("Error fetching product ratings:", error);
    
    // If we get 404 or 500, just set rating to 0 and don't treat it as an error
    if (error.response && (error.response.status === 404 || error.response.status === 500)) {
      console.log("No ratings found for this product, defaulting to 0");
      dispatch({ 
        type: "getProductRatingsSuccess", 
        payload: 0
      });
      return;
    }
    
    dispatch({ 
      type: "getProductRatingsFail", 
      payload: error.response?.data?.message || "Failed to fetch product ratings" 
    });
  }
};

export const deleteReview = (reviewId) => async (dispatch) => {
  try {
    dispatch({ type: "deleteReviewRequest" });
    
    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error("Authentication token not found. Please login again.");
    }
    
    const response = await axios.delete(
      `${server}/review/${reviewId}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`
        },
        withCredentials: false
      }
    );
    
    console.log("Review deleted successfully:", response.data);
    
    dispatch({ type: "deleteReviewSuccess" });
    return response.data;
  } catch (error) {
    console.error("Error deleting review:", error);
    dispatch({ 
      type: "deleteReviewFail", 
      payload: error.response?.data?.message || "Failed to delete review" 
    });
  }
};

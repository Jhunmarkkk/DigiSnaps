import axios from "axios";
import { server } from "../store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAllReviews, getProductRatings } from "./reviewAction";

export const deleteReview = (reviewId, productId) => async (dispatch) => {
  try {
    dispatch({ type: "deleteReviewRequest" });
    
    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error("Authentication token not found. Please login again.");
    }
    
    console.log(`Deleting review with ID: ${reviewId} for product ${productId}`);
    
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
    
    // Always refresh the reviews list and ratings for the product
    if (productId) {
      console.log(`Refreshing reviews for product ${productId} after deletion`);
      dispatch(getAllReviews(productId));
      dispatch(getProductRatings(productId));
    }
    
    return response.data;
  } catch (error) {
    console.error("Error deleting review:", error);
    dispatch({ 
      type: "deleteReviewFail", 
      payload: error.response?.data?.message || "Failed to delete review" 
    });
    
    // Even if deletion fails, try to refresh reviews to ensure UI is consistent
    if (productId) {
      console.log("Refreshing reviews despite deletion error");
      dispatch(getAllReviews(productId));
    }
  }
}; 
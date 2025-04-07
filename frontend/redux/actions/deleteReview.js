import axios from "axios";
import { server } from "../store";
import { getToken } from "../../utils/secureStore";
import { getAllReviews, getProductRatings } from "./reviewAction";

export const deleteReview = (reviewId, productId) => async (dispatch) => {
  try {
    dispatch({ type: "deleteReviewRequest" });
    
    // Get token from SecureStore instead of AsyncStorage
    const token = await getToken();
    
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
    
    // Add more detailed error logging
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error status:", error.response.status);
    }
    
    dispatch({ 
      type: "deleteReviewFail", 
      payload: error.response?.data?.message || error.message || "Failed to delete review" 
    });
    
    // Even if deletion fails, try to refresh reviews to ensure UI is consistent
    if (productId) {
      console.log("Refreshing reviews despite deletion error");
      dispatch(getAllReviews(productId));
    }
  }
}; 
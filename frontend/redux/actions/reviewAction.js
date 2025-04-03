import { server } from "../store";
import axios from "axios";

export const getAllReviews = (id) => async (dispatch) => {
  dispatch({ type: "getAllReviewsRequest" });
  try {
    const response = await axios.get(`${server}/review/${id}`);
    const reviews = response.data;
    dispatch({ type: "getAllReviewsSuccess", payload: reviews });
  } catch (error) {
    dispatch({ type: "getAllReviewsFail", payload: error });
  }
};

export const addReview = (comment, userId, productId, rating) => {
  return async (dispatch) => {
    dispatch({
      type: "addReviewRequest",
    });

    try {
      const reviewData = {
        comment: comment,
        userId: userId,
        productId: productId,
        rating: rating,
      };
      const response = await axios.post(
        `${server}/review/create`,
        reviewData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      dispatch({
        type: "addReviewSuccess",
      });
      return response.data; // Return the new review data if needed
    } catch (error) {
      dispatch({
        type: "addReviewFail",
      });
    }
  };
};

export const deleteReview = (reviewId) => {
  return async (dispatch) => {
    dispatch({
      type: "deleteReviewRequest",
    });

    try {
      const response = await axios.delete(`${server}/review/${reviewId}`, {
        withCredentials: true,
      });
      dispatch({
        type: "deleteReviewSuccess",
      });
      return response.data; // Optionally return data if needed
    } catch (error) {
      dispatch({
        type: "deleteReviewFail",
      });
    }
  };
};

export const getProductRatings = (productId) => {
  return async (dispatch) => {
    try {
      const response = await axios.get(
        `${server}/review/ratings/${productId}`
      );
      dispatch({
        type: "getProductRatingsSuccess",
        payload: response.data.averageRating,
      });
    } catch (error) {
      console.error("Error fetching product ratings:", error);
      dispatch({
        type: "getProductRatingsFail",
        payload: error.message,
      });
    }
  };
};

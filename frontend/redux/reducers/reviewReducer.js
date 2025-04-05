import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  reviews: [],
  loading: false,
  error: null,
  message: null,
  averageRating: 0,
};

export const reviewReducer = createReducer(initialState, (builder) => {
  builder
    .addCase("getAllReviewsRequest", (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase("getAllReviewsSuccess", (state, action) => {
      state.loading = false;
      state.reviews = Array.isArray(action.payload) ? action.payload : [];
      console.log("Reducer received reviews:", state.reviews.length);
    })
    .addCase("getAllReviewsFail", (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.reviews = [];
    })
    .addCase("addReviewRequest", (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase("addReviewSuccess", (state) => {
      state.loading = false;
      state.message = "Review added successfully";
    })
    .addCase("addReviewFail", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    .addCase("deleteReviewRequest", (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase("deleteReviewSuccess", (state) => {
      state.loading = false;
      state.message = "Review deleted successfully";
    })
    .addCase("deleteReviewFail", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    .addCase("getProductRatingsRequest", (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase("getProductRatingsSuccess", (state, action) => {
      state.loading = false;
      state.averageRating = action.payload;
    })
    .addCase("getProductRatingsFail", (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.averageRating = 0;
    })
    .addCase("clearError", (state) => {
      state.error = null;
    })
    .addCase("clearMessage", (state) => {
      state.message = null;
    });
});

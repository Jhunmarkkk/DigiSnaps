import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  reviews: [],
  loading: false,
  error: null,
  message: null, // Adding message field for success message
  averageRating: null,
};

export const reviewReducer = createReducer(initialState, (builder) => {
  builder
    .addCase("getAllReviewsRequest", (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase("getAllReviewsSuccess", (state, action) => {
      state.loading = false;
      state.reviews = action.payload;
    })
    .addCase("getAllReviewsFail", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    .addCase("addReviewRequest", (state) => {
      state.loading = true;
      state.error = null; // Clearing any previous errors
    })
    .addCase("addReviewSuccess", (state) => {
      state.loading = false;
      state.message = "Review added successfully"; // Setting success message
    })
    .addCase("addReviewFail", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    .addCase("deleteReviewRequest", (state) => {
      state.loading = true;
      state.error = null; // Clearing any previous errors
    })
    .addCase("deleteReviewSuccess", (state) => {
      state.loading = false;
      state.message = "Review deleted successfully"; // Setting success message
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
    });
});

export default reviewReducer;
import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./reducers/userReducer";
import { otherReducer } from "./reducers/otherReducer";
import { productReducer } from "./reducers/productReducer";
import { cartReducer } from "./reducers/cartReducer";
import { reviewReducer } from "./reducers/reviewReducer";

export const store = configureStore({
  reducer: {
    user: userReducer,
    other: otherReducer,
    product: productReducer,
    cart: cartReducer,
    review: reviewReducer,
  },
});

// IMPORTANT: Replace with your computer's IP address and correct port
// Based on server/data/config.env, the port should be 5000
export const server = "http://192.168.43.161:5000/api/v1";
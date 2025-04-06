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

// IMPORTANT: When using Expo Go on a physical device, make sure this IP address
// is accessible from your device on the same network as your server.
// If using a physical device, you might need to:
// 1. Use your computer's local network IP address (not localhost or 127.0.0.1)
// 2. Make sure your server is running and accepting connections from other devices
// 3. Check that no firewall is blocking connections to this port

// For development build, try different connection methods
const SERVER_IP = "192.168.246.228"; // Replace with your computer's IP address
const SERVER_PORT = 5000;

// Try IP address first, then localhost if IP fails
export const server = `http://${SERVER_IP}:${SERVER_PORT}/api/v1`;

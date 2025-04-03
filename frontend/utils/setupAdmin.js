import axios from "axios";
import { server } from "../redux/store";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to check if the hardcoded admin account exists and set it up if needed
export const checkAndSetupAdmin = async () => {
  try {
    // First try to login with admin credentials
    const response = await axios.post(
      `${server}/user/login`,
      { 
        email: "admin@gmail.com", 
        password: "123456" 
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: false
      }
    );

    if (response.data.token) {
      // Login successful - admin exists
      console.log("Admin account exists, login successful");
      return true;
    }
  } catch (error) {
    // If login fails, admin might not exist - try to register
    if (error.response?.status === 400 && error.response?.data?.message?.includes("Incorrect Email")) {
      console.log("Admin account doesn't exist, trying to create it");
      try {
        // Register the admin account
        const registerResponse = await axios.post(
          `${server}/user/register`,
          { 
            name: "Admin User",
            email: "admin@gmail.com", 
            password: "123456",
            address: "Admin Office",
            city: "Admin City",
            country: "Admin Country",
            pinCode: "123456"
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: false
          }
        );

        if (registerResponse.data.token) {
          console.log("Admin account created successfully");
          
          // Store the token
          await AsyncStorage.setItem('token', registerResponse.data.token);
          
          // Now we need to update the role to admin
          // We'll need to make a direct database update for this part
          // This would typically be done through a special admin-setup API endpoint
          
          return true;
        }
      } catch (registerError) {
        console.error("Failed to create admin account:", registerError.response?.data?.message || registerError.message);
      }
    } else {
      console.error("Error checking admin account:", error.response?.data?.message || error.message);
    }
  }
  
  return false;
};

// This is a note for implementation:
// Ideally, we would have a secure server-side API endpoint to set up the admin account
// The approach above tries to use existing endpoints but may not work if:
// 1. The user already exists but isn't an admin
// 2. There are validation checks preventing this particular registration
// In a production app, you would implement a proper admin seeding mechanism on the server 
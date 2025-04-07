import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { server } from "../store";
import Constants from 'expo-constants';


// Check if we're running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

export const register = (formData) => async (dispatch) => {
    try {
        dispatch({
            type: "registerRequest",
        });

        console.log('Making request to:', `${server}/user/register`);
        
        const response = await axios.post(`${server}/user/register`, formData, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            withCredentials: false
        });

        console.log('Server response:', response.data);

        // Store token after successful registration
        if (response.data.token) {
            await AsyncStorage.setItem('token', response.data.token);
        }

        dispatch({
            type: "registerSuccess",
            payload: response.data.message,
        });

        // Load user data immediately after successful registration
        dispatch(loadUser());
    } catch (error) {
        console.error('Registration error:', error.message);
        if (error.response) {
            console.error('Error response:', error.response.data);
        }
        
        dispatch({
            type: "registerFail",
            payload: error.response?.data?.message || "Registration failed. Please try again.",
        });
    }
};

export const login = (email, password) => async (dispatch) => {
    try {
        dispatch({
            type: "loginRequest",
        });

        console.log('Attempting login for:', email);

        const { data } = await axios.post(
            `${server}/user/login`,
            { email, password },
            {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: false
            }
        );

        console.log('Login response:', data);

        if (data.token) {
            await AsyncStorage.setItem('token', data.token);
            console.log('Token stored successfully');
        } else {
            console.warn('No token received in login response');
        }

        dispatch({
            type: "loginSuccess",
            payload: data.message,
        });

        // Load user data immediately after successful login
        dispatch(loadUser());
    } catch (error) {
        console.error('Login error:', error);
        
        // More detailed error logging
        if (error.response) {
            console.error('Error status:', error.response.status);
            console.error('Error data:', error.response.data);
        }
        
        dispatch({
            type: "loginFail",
            payload: error.response?.data?.message || "Login failed. Please try again.",
        });
    }
};

export const loadUser = () => async (dispatch) => {
    try {
        dispatch({
            type: "loadUserRequest",
        });

        const token = await AsyncStorage.getItem('token');
        
        if (!token) {
            console.log('No token found, checking for Google credentials...');
            
            // Check if we have stored Google credentials
            try {
                const googleCredentials = await AsyncStorage.getItem('googleCredentials');
                if (googleCredentials) {
                    const credentials = JSON.parse(googleCredentials);
                    console.log(`Found stored Google credentials for: ${credentials.email}`);
                    
                    // If credentials are less than 15 days old, try to restore session
                    const fifteenDaysInMs = 15 * 24 * 60 * 60 * 1000;
                    if (Date.now() - credentials.timestamp < fifteenDaysInMs) {
                        // Restore mock token if it exists
                        if (credentials.mockToken) {
                            await AsyncStorage.setItem('token', credentials.mockToken);
                            console.log('Restored mock token from credentials');
                            
                            // Try to load the stored user data
                            const userData = await AsyncStorage.getItem('googleUserData');
                            if (userData) {
                                dispatch({
                                    type: "loadUserSuccess",
                                    payload: JSON.parse(userData),
                                });
                                console.log('Session restored from stored Google user data');
                                return;
                            }
                        }
                    }
                }
            } catch (credentialError) {
                console.error('Error retrieving Google credentials:', credentialError);
            }
            
            return dispatch({
                type: "loadUserFail",
                payload: null, // Don't show error message for this case
            });
        }

        console.log('Loading user with token:', token.substring(0, 10) + '...');

        // If it's a mock token from Google Sign-In fallback, handle it specially
        if (token.startsWith('google_mock_')) {
            console.log('Mock Google token detected, using stored user data');
            try {
                // Check if we have stored user data for this session
                const storedUserData = await AsyncStorage.getItem('googleUserData');
                if (storedUserData) {
                    const userData = JSON.parse(storedUserData);
                    dispatch({
                        type: "loadUserSuccess",
                        payload: userData,
                    });
                    return;
                }
            } catch (storageError) {
                console.error('Error retrieving stored user data:', storageError);
            }
        }

        try {
            const { data } = await axios.get(`${server}/user/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: false
            });

            console.log('User data loaded:', data);
            
            if (data.success && data.user) {
                dispatch({
                    type: "loadUserSuccess",
                    payload: data.user,
                });
                
                // For Google Sign-In fallback, store the user data
                if (token.startsWith('google_mock_')) {
                    await AsyncStorage.setItem('googleUserData', JSON.stringify(data.user));
                    console.log('Stored Google user data for persistence');
                }
            } else {
                throw new Error("Invalid user data received");
            }
        } catch (apiError) {
            console.error('API error loading user:', apiError);
            
            // Only remove the token for specific errors, not for network issues
            if (apiError.response?.status === 401) {
                // Don't remove token for Google mock tokens - just try to recover
                if (token.startsWith('google_mock_')) {
                    console.log('Mock token authentication failed, trying to recover...');
                    try {
                        const userData = await AsyncStorage.getItem('googleUserData');
                        if (userData) {
                            dispatch({
                                type: "loadUserSuccess",
                                payload: JSON.parse(userData),
                            });
                            console.log('Session recovered from stored Google user data');
                            return;
                        }
                    } catch (recoveryError) {
                        console.error('Recovery error:', recoveryError);
                    }
                }
                
                await AsyncStorage.removeItem('token');
                console.log('Token removed due to authentication failure');
            } else if (apiError.message?.includes('Network Error')) {
                console.log('Network error - keeping token for retry');
                // For network errors, load Google user data if available
                try {
                    const userData = await AsyncStorage.getItem('googleUserData');
                    if (userData) {
                        dispatch({
                            type: "loadUserSuccess",
                            payload: JSON.parse(userData),
                        });
                        console.log('Using cached user data during network error');
                        return;
                    }
                } catch (cacheError) {
                    console.error('Cache retrieval error:', cacheError);
                }
                return;
            }
            
            dispatch({
                type: "loadUserFail",
                payload: apiError.response?.status === 401 ? null : (apiError.response?.data?.message || "Failed to load user profile"),
            });
        }
    } catch (error) {
        console.error('Fatal error in loadUser:', error);
        dispatch({
            type: "loadUserFail",
            payload: "An unexpected error occurred",
        });
    }
};

export const logout = () => async (dispatch) => {
    try {
        dispatch({
            type: "logoutRequest",
        });

        // Clear the token from AsyncStorage
        await AsyncStorage.removeItem('token');
        
        dispatch({
            type: "logoutSuccess",
            payload: "Logged out successfully",
        });
    } catch (error) {
        console.error('Logout error:', error);
        dispatch({
            type: "logoutFail",
            payload: error.response?.data?.message || "Failed to logout",
        });
    }
};

export const googleLogin = (idToken, userData) => async (dispatch) => {
  try {
    dispatch({ type: "loginRequest" });
    
    console.log("googleLogin action started with data:", userData?.email);
    
    // Ensure userData is valid
    if (!userData) {
      userData = {
        id: `unknown_${Date.now()}`,
        name: 'Google User',
        email: 'unknown@example.com',
        photo: ''
      };
      console.warn("Created default userData due to missing data");
    } else if (!userData.email) {
      console.error("Invalid user data received:", userData);
      // Create a safer version with defaults
      userData = {
        ...userData,
        id: userData.id || `unknown_${Date.now()}`,
        name: userData.name || 'Google User',
        email: 'unknown@example.com',
        photo: userData.photo || ''
      };
      console.warn("Fixed incomplete userData with defaults");
    }
    
    // Create the payload with the exact fields the backend expects
    const payload = {
      email: userData.email,
      name: userData.name || userData.email.split('@')[0],
      googleId: userData.id,
      photo: userData.photo // Use 'photo' instead of 'avatar' to match what we extract from Google
    };
    
    console.log("Sending Google login request with payload:", JSON.stringify(payload));
    
    // First attempt to authenticate with the backend
    try {
      const { data } = await axios.post(
        `${server}/user/google-login`,
        payload,
        {
          headers: {
            "Content-Type": "application/json"
          },
          timeout: 10000 // 10 second timeout
        }
      );
      
      console.log("Backend Google login successful");
      
      // Store the token from backend response
      if (data.token) {
        await AsyncStorage.setItem("token", data.token);
        console.log("Stored authentication token");
        
        // Save the user data for potential restoration
        if (data.user) {
          await AsyncStorage.setItem("userData", JSON.stringify(data.user));
          
          // Also store in googleUserData for consistency
          await AsyncStorage.setItem("googleUserData", JSON.stringify(data.user));
          
          // Store raw data for reference
          const safeRawData = {
            id: userData.id || 'unknown',
            name: userData.name || 'Google User',
            email: userData.email || 'unknown@example.com',
            photo: userData.photo || ''
          };
          await AsyncStorage.setItem("googleRawUserData", JSON.stringify(safeRawData));
          
          // Create credentials
          const tokenData = {
            token: data.token,
            email: userData.email,
            timestamp: Date.now()
          };
          await AsyncStorage.setItem("googleCredentials", JSON.stringify(tokenData));
        }
        
        dispatch({ type: "loginSuccess", payload: data.user });
        return data;
      } else {
        console.warn("No token received from backend");
        throw new Error("No authentication token received");
      }
    } catch (backendError) {
      console.error("Backend Google login failed:", backendError);
      
      // Log detailed error information
      if (backendError.response) {
        console.log("Status:", backendError.response.status);
        console.log("Error data:", JSON.stringify(backendError.response.data));
      } else if (backendError.request) {
        console.log("No response received:", backendError.request);
      } else {
        console.log("Error setting up request:", backendError.message);
      }
      
      // For Expo Go or fallback, create mock token and use local authentication
      if (Constants.appOwnership === 'expo' || !backendError.response) {
        console.log("Using fallback authentication for Google login");
        
        // Create local user from Google data
        const user = {
          _id: `google_${userData.id || Date.now()}`,
          name: userData.name || "Google User",
          email: userData.email,
          avatar: { url: userData.photo || "" },
          role: "user"
        };
        
        // Create and store a mock token
        const mockToken = `google_mock_${Date.now()}`;
        await AsyncStorage.setItem("token", mockToken);
        
        // Store user data in multiple places for redundancy
        await AsyncStorage.setItem("userData", JSON.stringify(user));
        await AsyncStorage.setItem("googleUserData", JSON.stringify(user));
        
        // Store raw data for reference
        const safeRawData = {
          id: userData.id || 'unknown',
          name: userData.name || 'Google User',
          email: userData.email || 'unknown@example.com',
          photo: userData.photo || ''
        };
        await AsyncStorage.setItem("googleRawUserData", JSON.stringify(safeRawData));
        
        // Create credentials
        const tokenData = {
          mockToken: mockToken,
          email: userData.email,
          timestamp: Date.now()
        };
        await AsyncStorage.setItem("googleCredentials", JSON.stringify(tokenData));
        
        dispatch({ type: "loginSuccess", payload: user });
        return { user, token: mockToken };
      }
      
      // Re-throw for real errors that should be handled
      throw backendError;
    }
  } catch (error) {
    console.error("Google login action error:", error);
    dispatch({ 
      type: "loginFail", 
      payload: error.response?.data?.message || "Google login failed" 
    });
    
    // For Expo Go, we want to continue even if backend fails
    if (Constants.appOwnership === 'expo') {
      console.log("EXPO GO: Creating fallback user despite error");
      const user = {
        _id: `google_${userData?.id || Date.now()}`,
        name: userData?.name || "Google User",
        email: userData?.email || "unknown@example.com",
        avatar: { url: userData?.photo || "" },
        role: "user"
      };
      
      const mockToken = `google_mock_${Date.now()}`;
      await AsyncStorage.setItem("token", mockToken);
      await AsyncStorage.setItem("userData", JSON.stringify(user));
      await AsyncStorage.setItem("googleUserData", JSON.stringify(user));
      
      // Store raw data for reference
      const safeRawData = {
        id: userData?.id || 'unknown',
        name: userData?.name || 'Google User',
        email: userData?.email || 'unknown@example.com',
        photo: userData?.photo || ''
      };
      await AsyncStorage.setItem("googleRawUserData", JSON.stringify(safeRawData));
      
      dispatch({ type: "loginSuccess", payload: user });
      return { user, token: mockToken, fallback: true };
    }
    
    throw error;
  }
};


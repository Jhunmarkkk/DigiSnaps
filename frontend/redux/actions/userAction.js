import { server } from "../store";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

export const logout = (forceNewGoogleLogin = false) => async (dispatch) => {
    try {
        dispatch({
            type: "logoutRequest",
        });

        // Clear the token from AsyncStorage
        await AsyncStorage.removeItem('token');
        
        // If we want to force a new Google login on next attempt
        if (forceNewGoogleLogin) {
            console.log('Setting flag to force new Google login on next attempt');
            await AsyncStorage.setItem('forceNewGoogleLogin', 'true');
            
            // Clear other Google-related data
            await AsyncStorage.removeItem('googleAuth');
            await AsyncStorage.removeItem('googleCredentials');
        }
        
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

export const googleLogin = (idToken, userInfo) => async (dispatch) => {
    try {
        dispatch({ type: "loginRequest" });

        console.log("Making Google login request to:", `${server}/user/google-login`);
        console.log("With data:", { idToken, userInfo });

        if (!userInfo) {
            throw new Error("No user info provided from Google");
        }
        
        // API call to backend for Google login
        try {
            const { data } = await axios.post(
                `${server}/user/google-login`,
                { 
                    idToken, 
                    userInfo
                },
                { 
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: false,
                    timeout: 10000 // 10 second timeout
                }
            );

            console.log("Google login response:", data);

            // Store token after successful login
            if (data.token) {
                await AsyncStorage.setItem('token', data.token);
                console.log('Token stored successfully');
                
                // Save user data for potential restoration
                if (data.user) {
                    await AsyncStorage.setItem('googleUserData', JSON.stringify(data.user));
                    await AsyncStorage.setItem('googleRawUserData', JSON.stringify(userInfo));
                    
                    // Store credentials info for potential session restoration
                    const tokenData = {
                        token: data.token,
                        email: userInfo.email,
                        timestamp: Date.now()
                    };
                    await AsyncStorage.setItem('googleCredentials', JSON.stringify(tokenData));
                } else {
                    console.warn('No user data received from server, using fallback data');
                    // Create a fallback user object
                    const fallbackUser = {
                        _id: userInfo.id || 'google-' + Date.now(),
                        name: userInfo.name || 'Google User',
                        email: userInfo.email || '',
                        avatar: { url: userInfo.photo || '' },
                        role: 'user'
                    };
                    
                    // Store fallback data
                    await AsyncStorage.setItem('googleUserData', JSON.stringify(fallbackUser));
                    await AsyncStorage.setItem('googleRawUserData', JSON.stringify(userInfo));
                    
                    // Store credentials
                    const tokenData = {
                        token: data.token,
                        email: userInfo.email,
                        timestamp: Date.now()
                    };
                    await AsyncStorage.setItem('googleCredentials', JSON.stringify(tokenData));
                    
                    // Update the data.user value for the loadUserSuccess dispatch
                    data.user = fallbackUser;
                }
            }

            dispatch({ 
                type: "loginSuccess", 
                payload: data.message || "Google login successful" 
            });
            
            // Load user data immediately after login
            if (data.user) {
                dispatch({
                    type: "loadUserSuccess",
                    payload: data.user
                });
            } else {
                dispatch(loadUser());
            }
            
            return { success: true, data };
        } catch (apiError) {
            console.error('API error during Google login:', apiError);
            throw apiError; // Re-throw to trigger fallback
        }
    } catch (error) {
        console.error('Google login error:', error);
        
        // Create a fallback user for offline login
        console.log("Creating fallback user from Google data");
        try {
            if (!userInfo) {
                throw new Error("No user info available for fallback");
            }
            
            const fallbackUser = {
                _id: userInfo.id || 'google-' + Date.now(),
                name: userInfo.name || 'Google User',
                email: userInfo.email || '',
                avatar: { url: userInfo.photo || '' },
                role: 'user'
            };
            
            console.log("Fallback user:", fallbackUser);
            
            // Store the fallback user in AsyncStorage for persistence
            await AsyncStorage.setItem('googleUserData', JSON.stringify(fallbackUser));
            console.log('Stored fallback user data for persistence');
            
            // Generate a mock token
            const mockToken = 'google_mock_' + Date.now();
            await AsyncStorage.setItem('token', mockToken);
            console.log('Created mock token:', mockToken);
            
            // Store credentials for session restoration
            const tokenData = {
                token: mockToken,
                mockToken: mockToken,
                email: userInfo.email,
                timestamp: Date.now()
            };
            await AsyncStorage.setItem('googleCredentials', JSON.stringify(tokenData));
            
            // Dispatch directly to the store
            dispatch({
                type: "loadUserSuccess",
                payload: fallbackUser
            });
            
            dispatch({
                type: "loginSuccess",
                payload: "Signed in with Google (offline mode)"
            });
            
            return { success: true, fallback: true };
        } catch (fallbackError) {
            console.error('Fallback creation error:', fallbackError);
            
            dispatch({ 
                type: "loginFail", 
                payload: "Failed to create fallback Google account: " + fallbackError.message
            });
        }
        
        return { success: false, error: error.message };
    }
};


import axios from "axios";
import { server } from "../store";
import { saveToken, getToken, deleteToken } from "../../utils/secureStore";
import { 
  registerForPushNotifications, 
  savePushTokenToServer,
  unregisterPushToken
} from "../../utils/notifications";

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

        // Store token securely after successful registration
        if (response.data.token) {
            await saveToken(response.data.token);
            
            // Register push notification token after successful registration
            await registerAndSavePushToken();
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
            await saveToken(data.token);
            console.log('Token stored securely');
            
            // Register push notification token after successful login
            await registerAndSavePushToken();
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

        const token = await getToken();
        
        if (!token) {
            console.log('No token found, user needs to login');
            return dispatch({
                type: "loadUserFail",
                payload: null, // Don't show error message for this case
            });
        }

        console.log('Loading user with token');

        try {
            const { data } = await axios.get(`${server}/user/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: false
            });

            console.log('User data loaded:', data.user);
            console.log('User role:', data.user.role);
            
            if (data.success && data.user) {
                // Force admin role for admin@gmail.com
                if (data.user.email === 'admin@gmail.com') {
                    data.user.role = 'admin';
                    console.log('Forcing admin role for admin@gmail.com');
                }
                
                dispatch({
                    type: "loadUserSuccess",
                    payload: data.user,
                });
            } else {
                throw new Error("Invalid user data received");
            }
        } catch (apiError) {
            console.error('API error loading user:', apiError);
            
            // Clear token if it's invalid
            if (apiError.response?.status === 401) {
                await deleteToken();
                console.log('Token removed due to authentication failure');
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

        // Unregister push notification token (handle possible failure)
        try {
            await unregisterPushToken();
        } catch (tokenError) {
            console.log("Error unregistering push token:", tokenError);
            // Continue with logout even if this fails
        }

        // Clear the token from SecureStore
        try {
            await deleteToken();
            console.log("Token successfully deleted");
        } catch (storageError) {
            console.error("Error deleting token:", storageError);
            // Continue with logout even if storage clearing fails
        }
        
        // Dispatch success only after token is cleared
        dispatch({
            type: "logoutSuccess",
            payload: "Logged out successfully",
        });
    } catch (error) {
        console.error('Logout error:', error);
        // Force logout even on error to prevent being stuck
        dispatch({
            type: "logoutSuccess",
            payload: "Logged out (with some errors)",
        });
    }
};

// Helper function to register for push notifications and save the token to server
const registerAndSavePushToken = async () => {
    try {
        // Register for push notifications
        const pushToken = await registerForPushNotifications();
        
        // If we got a token, save it to the server
        if (pushToken) {
            await savePushTokenToServer(pushToken);
        }
    } catch (error) {
        console.error('Error registering push token:', error);
    }
};


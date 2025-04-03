import axios from "axios";
import { server } from "../store";
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        }

        dispatch({
            type: "loginSuccess",
            payload: data.message,
        });

        // Load user data immediately after successful login
        dispatch(loadUser());
    } catch (error) {
        console.error('Login error:', error);
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
            console.log('No token found, user needs to login');
            return dispatch({
                type: "loadUserFail",
                payload: null, // Don't show error message for this case
            });
        }

        console.log('Loading user with token:', token);

        const { data } = await axios.get(`${server}/user/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            withCredentials: false
        });

        console.log('User data loaded:', data);
  
        dispatch({
            type: "loadUserSuccess",
            payload: data.user,
        });
    } catch (error) {
        console.error('Load user error:', error);
        // Clear token if it's invalid
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('token');
        }
        dispatch({
            type: "loadUserFail",
            payload: error.response?.status === 401 ? null : (error.response?.data?.message || "Failed to load user"),
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


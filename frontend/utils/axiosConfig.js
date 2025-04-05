import axios from 'axios';
import { getToken, deleteToken } from './secureStore';

// Create interceptor to add the authentication token to all requests
axios.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Remove withCredentials since we're using token-based auth
      config.withCredentials = false;
      
      return config;
    } catch (error) {
      console.error('Error setting auth token:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 Unauthorized errors
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // If we receive a 401 Unauthorized error, the token might be invalid
    if (error.response && error.response.status === 401) {
      try {
        // Clear the token from storage
        await deleteToken();
        console.log('Token removed due to 401 response');
        
        // Redirect to login (this will need to be implemented separately)
        // window.location.href = '/login';
      } catch (storageError) {
        console.error('Error removing token:', storageError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axios;

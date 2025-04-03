import axios from 'axios';
import { server } from './redux/store';

// Function to test API connection
async function testServerConnection() {
  console.log('Testing connection to server:', server);
  
  try {
    // Test basic connectivity to the root endpoint
    const rootResponse = await axios.get(server.replace('/api/v1', ''));
    console.log('Root endpoint response:', rootResponse.status, rootResponse.data);
    
    // Try login with admin credentials
    const loginResponse = await axios.post(
      `${server}/user/login`,
      {
        email: 'admin@gmail.com',
        password: '123456'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Login response status:', loginResponse.status);
    console.log('Login response data:', loginResponse.data);
    
    return {
      success: true,
      message: 'Connection successful',
      data: loginResponse.data
    };
    
  } catch (error) {
    console.error('Connection test failed');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Server responded with error:', error.response.status);
      console.error('Response data:', error.response.data);
      
      return {
        success: false,
        message: `Server error: ${error.response.status}`,
        data: error.response.data
      };
      
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
      console.error('Request details:', error.request);
      
      return {
        success: false,
        message: 'No response from server - check server IP address and port',
        error: 'network_error'
      };
      
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
      
      return {
        success: false,
        message: `Request setup error: ${error.message}`,
        error: 'request_setup_error'
      };
    }
  }
}

// Export the function
export default testServerConnection; 
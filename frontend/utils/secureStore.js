import * as SecureStore from 'expo-secure-store';

// Keys
const JWT_TOKEN_KEY = 'digisnaps_jwt_token';

/**
 * Save JWT token to SecureStore
 * @param {string} token - JWT token to store
 * @returns {Promise<boolean>} - Success status
 */
export const saveToken = async (token) => {
  try {
    await SecureStore.setItemAsync(JWT_TOKEN_KEY, token);
    console.log('Token saved securely');
    return true;
  } catch (error) {
    console.error('Error saving token to SecureStore:', error);
    throw error;
  }
};

/**
 * Retrieve JWT token from SecureStore
 * @returns {Promise<string|null>} - JWT token or null if not found
 */
export const getToken = async () => {
  try {
    const token = await SecureStore.getItemAsync(JWT_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error retrieving token from SecureStore:', error);
    throw error;
  }
};

/**
 * Delete JWT token from SecureStore
 * @returns {Promise<boolean>} - Success status
 */
export const deleteToken = async () => {
  try {
    await SecureStore.deleteItemAsync(JWT_TOKEN_KEY);
    console.log('Token deleted securely');
    return true;
  } catch (error) {
    console.error('Error deleting token from SecureStore:', error);
    throw error;
  }
};

export default {
  saveToken,
  getToken,
  deleteToken
}; 
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys
const CART_ITEMS_KEY = 'digisnaps_cart_items';

// Save cart items to AsyncStorage
export const saveCartItems = async (cartItems) => {
  try {
    await AsyncStorage.setItem(CART_ITEMS_KEY, JSON.stringify(cartItems));
    console.log('Cart saved to AsyncStorage successfully');
    return true;
  } catch (error) {
    console.error('Error saving cart to AsyncStorage:', error);
    throw error;
  }
};

// Load cart items from AsyncStorage
export const loadCartItems = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(CART_ITEMS_KEY);
    if (jsonValue !== null) {
      const cartItems = JSON.parse(jsonValue);
      console.log('Cart items loaded successfully:', cartItems.length);
      return cartItems;
    }
    return [];
  } catch (error) {
    console.error('Error loading cart from AsyncStorage:', error);
    throw error;
  }
};

// Clear all cart items
export const clearCartItems = async () => {
  try {
    await AsyncStorage.removeItem(CART_ITEMS_KEY);
    console.log('Cart items cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing cart from AsyncStorage:', error);
    throw error;
  }
};

// Initialize storage
export const initStorage = async () => {
  try {
    console.log('Storage initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing storage:', error);
    throw error;
  }
};

export default {
  initStorage,
  saveCartItems,
  loadCartItems,
  clearCartItems
}; 
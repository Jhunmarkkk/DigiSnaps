import { saveCartItems, loadCartItems, clearCartItems } from '../../utils/storage';
import Toast from "react-native-toast-message";

// Save cart items to AsyncStorage
export const saveCartToDatabase = (cartItems) => async (dispatch) => {
  try {
    await saveCartItems(cartItems);
    console.log('Cart saved to AsyncStorage successfully');
  } catch (error) {
    console.error('Error saving cart to AsyncStorage:', error);
    Toast.show({
      type: "error",
      text1: "Could not save cart data",
      text2: "Please try again",
    });
  }
};

// Load cart items from AsyncStorage
export const loadCartFromDatabase = () => async (dispatch) => {
  try {
    console.log('Loading cart items from AsyncStorage...');
    const cartItems = await loadCartItems();
    console.log(`Found ${cartItems.length} items in the cart storage`);
    
    if (cartItems.length > 0) {
      dispatch({
        type: 'loadCartItems',
        payload: cartItems,
      });
      console.log('Cart loaded from AsyncStorage successfully');
    }
  } catch (error) {
    console.error('Error loading cart from AsyncStorage:', error);
    Toast.show({
      type: "error",
      text1: "Could not load saved cart",
      text2: "Please try again",
    });
  }
};

// Add item to cart and save to AsyncStorage
export const addToCart = (item) => async (dispatch, getState) => {
  try {
    dispatch({
      type: 'addToCart',
      payload: item,
    });
    
    const { cart } = getState();
    await saveCartItems(cart.cartItems);
  } catch (error) {
    console.error('Error adding item to cart:', error);
    Toast.show({
      type: "error",
      text1: "Could not add to cart",
      text2: "Please try again",
    });
  }
};

// Remove item from cart and save to AsyncStorage
export const removeFromCart = (id) => async (dispatch, getState) => {
  try {
    dispatch({
      type: 'removeFromCart',
      payload: id,
    });
    
    const { cart } = getState();
    await saveCartItems(cart.cartItems);
  } catch (error) {
    console.error('Error removing item from cart:', error);
    Toast.show({
      type: "error",
      text1: "Could not remove from cart",
      text2: "Please try again",
    });
  }
};

// Clear cart and AsyncStorage
export const clearCart = () => async (dispatch) => {
  try {
    await clearCartItems();
    
    dispatch({
      type: 'clearCart',
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    Toast.show({
      type: "error",
      text1: "Could not clear cart",
      text2: "Please try again",
    });
  }
}; 
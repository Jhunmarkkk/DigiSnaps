import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { server } from '../redux/store';
import axios from 'axios';
import { getToken } from './secureStore';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Maximum number of notifications to store
const MAX_NOTIFICATIONS = 50;

// Notification storage key
const NOTIFICATION_STORAGE_KEY = "@digisnaps:notifications";

// Global reference to handle navigation from notification
let navigationRef = null;

/**
 * Sets the navigation reference for use with notifications
 * @param {object} ref - Navigation reference from React Navigation
 */
export const setNavigationRef = (ref) => {
  navigationRef = ref;
};

/**
 * Configure notification handling
 */
export const configureNotifications = () => {
  console.log('Configuring notifications...');
  
  // Set notification handler for foreground notifications
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      console.log('Received foreground notification:', notification.request.content);
      
      const data = notification.request.content.data || {};
      
      // Show toast for foreground notifications
      if (data.screen === 'orders' && data.status) {
        Toast.show({
          type: 'info',
          text1: notification.request.content.title || 'Order Update',
          text2: notification.request.content.body || `Order status: ${data.status}`,
          visibilityTime: 4000,
          position: 'top'
        });
      }
      
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      };
    },
  });

  // Set up notification listeners for when app is in background
  const responseListener = Notifications.addNotificationResponseReceivedListener(
    handleNotificationResponse
  );
  
  console.log('Notification listeners configured');
  
  // Return cleanup function
  return () => {
    Notifications.removeNotificationSubscription(responseListener);
  };
};

/**
 * Handle when a user taps on a notification
 */
export const handleNotificationResponse = async (response) => {
  try {
    if (!navigationRef) {
      console.error("Navigation reference not set, cannot navigate");
      return;
    }

    // Mark the notification as read in storage
    const notificationId = response.notification.request.identifier;
    await markNotificationAsRead(notificationId);

    // Get notification data
    const data = response.notification.request.content.data || {};
    console.log("Notification data:", data);

    // Handle different notification types
    if (data.screen === "orders") {
      Toast.show({
        type: "success",
        text1: "Order Update",
        text2: `Status changed to: ${data.status || "Updated"}`,
      });
      navigationRef.navigate("orders");
    } 
    else if (data.screen === "promotiondetails") {
      console.log("Navigating to promotion details:", {
        id: data.productId, 
        discount: data.discount
      });
      
      // Show toast and navigate to promotion details
      Toast.show({
        type: "success",
        text1: "Special Offer!",
        text2: `${data.productName || "Product"} at ${data.discount}% off!`,
      });
      
      // Make sure we navigate with both productId and discount parameters
      navigationRef.navigate("promotiondetails", {
        id: data.productId,
        discount: data.discount
      });
    }
  } catch (error) {
    console.error("Error handling notification:", error);
  }
};

/**
 * Send a local notification immediately
 * Used for testing and also for order status updates
 */
export const sendLocalNotification = async (title, body, data = {}) => {
  try {
    console.log('Scheduling local notification:', title, body);
    
    // Schedule the notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null, // Immediate delivery
    });
    
    // Save the notification to storage
    await saveNotificationToStorage({
      title,
      body,
      data,
      notificationId
    });
    
    console.log('Local notification scheduled and saved');
    return true;
  } catch (error) {
    console.error('Error sending local notification:', error);
    return false;
  }
};

/**
 * Register for push notifications - simplified version
 */
export const registerForPushNotifications = async () => {
  if (!Device.isDevice) {
    console.log('Push notifications not available on simulator');
    return null;
  }

  try {
    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permission for notifications was denied');
      return null;
    }

    // For the simpler approach, we don't need an actual token
    // We'll just use a device ID as a placeholder
    const deviceId = Device.modelName || 'unknown-device';
    console.log('Using device ID as token:', deviceId);
    
    // Set up Android notification channel
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return deviceId;
  } catch (error) {
    console.error('Error registering for notifications:', error);
    return null;
  }
};

/**
 * Simplified version of token registration - just for compatibility
 */
export const savePushTokenToServer = async (deviceId) => {
  console.log('Saving device ID to server:', deviceId);
  return true; // Just return success for compatibility
};

/**
 * Simplified version of token unregistration - just for compatibility
 */
export const unregisterPushToken = async () => {
  console.log('Unregistering device ID from server');
  return true; // Just return success for compatibility
};

/**
 * Schedule a test notification
 */
export const scheduleTestNotification = async () => {
  return sendLocalNotification(
    "Order Status Updated",
    "Your order #123456 has been shipped!",
    { 
      screen: 'orders',
      orderId: '123456',
      status: 'Shipped'
    }
  );
};

/**
 * Send a promotional notification about a product discount
 */
export const sendProductPromotion = async (productId, productName, discount, imageUrl) => {
  try {
    // Validate required parameters
    if (!productId || !productName || !discount) {
      console.error('Missing required parameters for product promotion');
      return false;
    }
    
    // Ensure discount is a valid number
    const discountValue = parseInt(discount);
    if (isNaN(discountValue) || discountValue <= 0 || discountValue > 99) {
      console.error('Invalid discount value for product promotion:', discount);
      return false;
    }
    
    console.log('Sending product promotion notification:', productName, discountValue);
    
    // Create a memorable message about the discount
    const title = "Special Offer!";
    const body = `${discountValue}% OFF on ${productName}. Limited time offer!`;
    
    await sendLocalNotification(
      title,
      body,
      {
        screen: 'promotiondetails',
        productId: productId,
        discount: discountValue,
        image: imageUrl || ''
      }
    );
    
    console.log('Product promotion notification sent');
    return true;
  } catch (error) {
    console.error('Error sending product promotion:', error);
    return false;
  }
};

/**
 * Mark a notification as read in AsyncStorage
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    // Get existing notifications
    const existingNotifications = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (!existingNotifications) return;
    
    let notifications = JSON.parse(existingNotifications);
    
    // Find the notification by ID and mark as read
    const updatedNotifications = notifications.map(notification => {
      if (notification.id === notificationId || notification.notificationId === notificationId) {
        return { ...notification, read: true };
      }
      return notification;
    });
    
    // Save updated notifications
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updatedNotifications));
    console.log('Notification marked as read:', notificationId);
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

/**
 * Save a notification to AsyncStorage
 */
const saveNotificationToStorage = async (notification) => {
  try {
    // Get existing notifications
    const existingNotifications = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
    let notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
    
    // Add the new notification with a unique ID and timestamp
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    // Add new notification to the beginning of the array
    notifications = [newNotification, ...notifications];
    
    // Limit the number of stored notifications
    if (notifications.length > MAX_NOTIFICATIONS) {
      notifications = notifications.slice(0, MAX_NOTIFICATIONS);
    }
    
    // Save the updated list
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
    
    console.log('Notification saved to storage');
    return true;
  } catch (error) {
    console.error('Error saving notification to storage:', error);
    return false;
  }
};

export default {
  configureNotifications,
  registerForPushNotifications,
  savePushTokenToServer,
  unregisterPushToken,
  scheduleTestNotification,
  sendLocalNotification,
  sendProductPromotion
}; 
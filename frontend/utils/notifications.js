import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { server } from '../redux/store';
import axios from 'axios';
import { getToken } from './secureStore';
import Toast from 'react-native-toast-message';

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
const handleNotificationResponse = (response) => {
  console.log('User tapped notification:', response.notification.request.content);
  
  const data = response.notification.request.content.data || {};
  
  if (!navigationRef) {
    console.log('Navigation reference not set, cannot navigate');
    return;
  }
  
  // Handle order notifications
  if (data.screen === 'orders') {
    console.log('Navigating to orders screen with orderId:', data.orderId);
    
    if (data.orderId) {
      // Navigate to specific order details if orderId is provided
      navigationRef.navigate('orderdetails', {
        id: data.orderId
      });
      
      Toast.show({
        type: 'success',
        text1: 'Order Details',
        text2: `Viewing details for order #${data.orderId.slice(-6)}`,
        visibilityTime: 4000,
        position: 'top'
      });
    } else {
      // Fallback to orders list if no specific orderId
      navigationRef.navigate('orders');
      
      // Show a toast about the order update
      if (data.status) {
        Toast.show({
          type: 'success',
          text1: 'Order Status Update',
          text2: `Order status: ${data.status}`,
          visibilityTime: 4000,
          position: 'top'
        });
      }
    }
  }
};

/**
 * Send a local notification immediately
 * Used for testing and also for order status updates
 */
export const sendLocalNotification = async (title, body, data = {}) => {
  try {
    console.log('Scheduling local notification:', title, body);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null, // Immediate delivery
    });
    
    console.log('Local notification scheduled');
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

export default {
  configureNotifications,
  registerForPushNotifications,
  savePushTokenToServer,
  unregisterPushToken,
  scheduleTestNotification,
  sendLocalNotification
}; 
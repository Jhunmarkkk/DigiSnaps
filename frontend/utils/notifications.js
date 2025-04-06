import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { server } from '../redux/store';
import axios from 'axios';
import { getToken } from './secureStore';

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
  // Handle notifications when app is in foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // Set up notification listeners
  const responseListener = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
  
  // Return cleanup function
  return () => {
    Notifications.removeNotificationSubscription(responseListener);
  };
};

/**
 * Handle when a user taps on a notification
 */
const handleNotificationResponse = (response) => {
  const data = response.notification.request.content.data;
  
  if (!navigationRef) {
    console.log('Navigation reference not set, cannot navigate');
    return;
  }
  
  // Handle order notifications
  if (data.screen === 'orders') {
    // Navigate to orders screen
    navigationRef.navigate('orders');
    
    // Show a toast or alert about the order update
    if (data.status) {
      // Your toast implementation here
      console.log(`Order #${data.orderId} status: ${data.status}`);
    }
  }
};

/**
 * Register for push notifications
 * @returns {Promise<string|null>} Notification token or null if registration failed
 */
export const registerForPushNotifications = async () => {
  // Check if device is physical (not a simulator)
  if (!Device.isDevice) {
    console.log('Push notifications are not available on simulator/emulator');
    return null;
  }

  try {
    // Request permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If permission not determined, ask the user
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Permission denied
    if (finalStatus !== 'granted') {
      console.log('Permission for push notifications was denied');
      return null;
    }

    // Get push token
    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({
      // Using experienceId instead of projectId for more flexibility
      experienceId: '@username/digisnaps',
    });

    // Platform-specific notification setup
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    console.log('Push notification token:', expoPushToken);
    return expoPushToken;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
};

/**
 * Save push notification token to server
 * @param {string} pushToken Expo push notification token
 * @returns {Promise<boolean>} Success status
 */
export const savePushTokenToServer = async (pushToken) => {
  if (!pushToken) return false;

  try {
    // Get JWT token for authorization
    const authToken = await getToken();
    if (!authToken) {
      console.log('User not authenticated, skipping push token registration');
      return false;
    }

    const response = await axios.post(
      `${server}/user/push-token`,
      { token: pushToken, deviceInfo: Device.modelName || 'Unknown device' },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        withCredentials: false
      }
    );

    console.log('Push token saved to server:', response.data);
    return true;
  } catch (error) {
    console.error('Error saving push token to server:', error);
    return false;
  }
};

/**
 * Unregister push notification token from server
 * @returns {Promise<boolean>} Success status
 */
export const unregisterPushToken = async () => {
  try {
    // Get current push token
    const { data: pushToken } = await Notifications.getExpoPushTokenAsync({
      // Using experienceId instead of projectId
      experienceId: '@username/digisnaps',
    });

    if (!pushToken) return true;

    // Get JWT token for authorization
    const authToken = await getToken();
    if (!authToken) return false;

    const response = await axios.delete(
      `${server}/user/push-token`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        data: { token: pushToken },
        withCredentials: false
      }
    );

    console.log('Push token unregistered from server:', response.data);
    return true;
  } catch (error) {
    console.error('Error unregistering push token from server:', error);
    return false;
  }
};

export default {
  configureNotifications,
  registerForPushNotifications,
  savePushTokenToServer,
  unregisterPushToken
}; 
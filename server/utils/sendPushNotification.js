import axios from 'axios';
import { User } from '../models/user.js';

// Expo push notification API URL
const EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';

/**
 * Send push notification to a specific user
 * @param {string} userId - User ID to send notification to
 * @param {object} notification - Notification content
 * @param {string} notification.title - Notification title
 * @param {string} notification.body - Notification body
 * @param {object} notification.data - Additional data to send with notification
 * @returns {Promise<object>} - Result of the notification sending
 */
export const sendPushNotificationToUser = async (userId, notification) => {
  try {
    // Find the user
    const user = await User.findById(userId);
    
    if (!user || !user.pushTokens || user.pushTokens.length === 0) {
      console.log(`No push tokens found for user ${userId}`);
      return {
        success: false,
        message: 'No push tokens available'
      };
    }
    
    // Get all tokens for this user
    const tokens = user.pushTokens.map(tokenObj => tokenObj.token);
    
    // Send the notification to all user's devices
    const result = await sendPushNotifications(tokens, notification);
    
    // Update last used time for tokens
    user.pushTokens.forEach(tokenObj => {
      tokenObj.lastUsed = Date.now();
    });
    await user.save();
    
    return result;
  } catch (error) {
    console.error('Error sending push notification to user:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send push notification to multiple users
 * @param {Array<string>} userIds - Array of user IDs to send notification to
 * @param {object} notification - Notification content
 * @returns {Promise<object>} - Result of the notification sending
 */
export const sendPushNotificationToUsers = async (userIds, notification) => {
  try {
    // Find all users with push tokens
    const users = await User.find({ _id: { $in: userIds } });
    
    // Collect all tokens
    const allTokens = [];
    users.forEach(user => {
      if (user.pushTokens && user.pushTokens.length > 0) {
        user.pushTokens.forEach(tokenObj => {
          allTokens.push(tokenObj.token);
          
          // Update last used time
          tokenObj.lastUsed = Date.now();
        });
      }
    });
    
    // Save all users with updated lastUsed times
    await Promise.all(users.map(user => user.save()));
    
    if (allTokens.length === 0) {
      console.log('No push tokens found for specified users');
      return {
        success: false,
        message: 'No push tokens available'
      };
    }
    
    // Send the notification to all collected tokens
    return await sendPushNotifications(allTokens, notification);
  } catch (error) {
    console.error('Error sending push notification to users:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send push notifications to specified push tokens
 * @param {Array<string>} pushTokens - Array of Expo push tokens
 * @param {object} notification - Notification content
 * @returns {Promise<object>} - Result of the notification sending
 */
export const sendPushNotifications = async (pushTokens, notification) => {
  if (!pushTokens || pushTokens.length === 0) {
    return {
      success: false,
      message: 'No push tokens provided'
    };
  }
  
  try {
    // Format the messages as required by Expo
    const messages = pushTokens.map(token => ({
      to: token,
      sound: 'default',
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
    }));
    
    // Send notifications through Expo's push service
    const response = await axios.post(EXPO_PUSH_ENDPOINT, { messages });
    
    return {
      success: true,
      result: response.data
    };
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  sendPushNotificationToUser,
  sendPushNotificationToUsers,
  sendPushNotifications
}; 
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { store } from '../redux/store';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';

// Check if we're running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Only import Google Sign-In if not running in Expo Go
let GoogleSignin;
let statusCodes;

if (!isExpoGo) {
  try {
    const GoogleSignInModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = GoogleSignInModule.GoogleSignin;
    statusCodes = GoogleSignInModule.statusCodes;
  } catch (error) {
    console.error('Failed to import Google Sign-In module:', error);
  }
}

// Ensure the WebBrowser redirects correctly
WebBrowser.maybeCompleteAuthSession();

// Your Google Web Client ID - Update these with your own credentials
const GOOGLE_WEB_CLIENT_ID = "733273417462-1amfpj559hib5eisk9eitbnm7naaoc9f.apps.googleusercontent.com";
// Your Google iOS Client ID
const GOOGLE_IOS_CLIENT_ID = undefined; // No iOS client ID provided
// Your Google Android Client ID 
const GOOGLE_ANDROID_CLIENT_ID = "733273417462-okbthourh1fofrpdtv3hc7rg0a4u98l9.apps.googleusercontent.com";

export const useGoogleSignIn = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    prompt: 'select_account',
  });

  const getUserInfo = async (accessToken) => {
    try {
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      
      const user = await response.json();
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        photo: user.picture,
        verified: user.verified_email,
      };
    } catch (error) {
      console.error("Error fetching user info:", error);
      throw error;
    }
  };

  // Handle the authentication response
  useEffect(() => {
    const handleSignInResponse = async () => {
      if (response?.type === 'success') {
        setLoading(true);
        try {
          const { authentication } = response;
          
          if (!authentication || !authentication.accessToken) {
            throw new Error('Invalid authentication response from Google');
          }
          
          // Save the authentication data
          await AsyncStorage.setItem(
            'googleAuth',
            JSON.stringify(authentication)
          );
          
          // Get user information using the access token
          const userInfo = await getUserInfo(authentication.accessToken);
          if (!userInfo || !userInfo.email) {
            throw new Error('Failed to get valid user info from Google');
          }
          
          console.log('Google sign-in successful, user info:', userInfo);
          
          setUserInfo(userInfo);
        } catch (err) {
          console.error('Google sign in error:', err);
          setError(err.message || 'Failed to sign in with Google');
        } finally {
          setLoading(false);
        }
      } else if (response?.type === 'error') {
        console.error('Google sign-in error:', response.error);
        setError(response.error?.message || 'Google sign-in was cancelled or failed');
      }
    };
    
    if (response) {
      handleSignInResponse();
    }
  }, [response]);

  // Check if we have a stored token and try to get user info
  useEffect(() => {
    const checkForStoredToken = async () => {
      try {
        const authData = await AsyncStorage.getItem('googleAuth');
        if (authData) {
          const auth = JSON.parse(authData);
          // Check if token is expired
          const expirationDate = new Date(auth.expirationDate);
          if (expirationDate > new Date()) {
            // Token still valid, get user info
            const userInfo = await getUserInfo(auth.accessToken);
            setUserInfo(userInfo);
          } else {
            // Token expired, remove it
            await AsyncStorage.removeItem('googleAuth');
          }
        }
      } catch (err) {
        console.error('Error checking stored token:', err);
      }
    };
    
    checkForStoredToken();
  }, []);

  const signIn = async () => {
    setLoading(true);
    setError(null);
    try {
      // Clear any previous tokens to force account selection
      await AsyncStorage.removeItem('googleAuth');
      
      // Prompt for Google sign-in with account selection
      const result = await promptAsync({ showInRecents: true });
      console.log("Prompt result:", result?.type);
    } catch (err) {
      console.error('Error prompting Google sign-in:', err);
      setError(err.message || 'Failed to start Google sign-in');
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await AsyncStorage.removeItem('googleAuth');
      await AsyncStorage.removeItem('googleUserData');
      await AsyncStorage.removeItem('googleRawUserData');
      await AsyncStorage.removeItem('googleCredentials');
      setUserInfo(null);
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err.message || 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  return {
    signIn,
    signOut,
    userInfo,
    loading,
    error,
  };
};

// Initialize Google Sign-In
export const configureGoogleSignIn = () => {
  // Skip configuration if running in Expo Go
  if (isExpoGo) {
    console.log('Google Sign-In is not available in Expo Go');
    return;
  }
  
  try {
    GoogleSignin.configure({
      webClientId: '733273417462-1amfpj559hib5eisk9eitbnm7naaoc9f.apps.googleusercontent.com', // From app.json
      offlineAccess: true,
      scopes: ['profile', 'email'],
      forceCodeForRefreshToken: true,
      iosClientId: '733273417462-1amfpj559hib5eisk9eitbnm7naaoc9f.apps.googleusercontent.com',
    });
    console.log('Google Sign-In configured successfully');
  } catch (error) {
    console.error('Error configuring Google Sign-In:', error);
  }
};

// Check if user is already signed in with Google
export const isSignedIn = async () => {
  // Return false if running in Expo Go
  if (isExpoGo) return false;
  
  try {
    const isSignedIn = await GoogleSignin.isSignedIn();
    return isSignedIn;
  } catch (error) {
    console.error('Error checking Google Sign-In status:', error);
    return false;
  }
};

// Get the current user info if signed in
export const getCurrentUserInfo = async () => {
  // Return null if running in Expo Go
  if (isExpoGo) return null;
  
  try {
    const userInfo = await GoogleSignin.getCurrentUser();
    return userInfo;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  // Return error if running in Expo Go
  if (isExpoGo) {
    return { 
      success: false, 
      error: { 
        message: 'Google Sign-In is not available in Expo Go. Please use a development build.' 
      } 
    };
  }
  
  try {
    // Check for Play Services
    console.log('Checking Play Services...');
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    console.log('Starting Google Sign-In...');
    
    // Always sign out first to force account selection
    try {
      console.log('Signing out from any previous sessions...');
      await GoogleSignin.signOut();
      
      // Also clear stored tokens
      await AsyncStorage.removeItem('googleAuth');
      await AsyncStorage.removeItem('googleCredentials');
    } catch (signOutError) {
      console.log('Error during pre-sign-in sign-out:', signOutError);
      // Continue anyway - this is just to ensure fresh login
    }
    
    // Now attempt sign-in with account selection
    console.log('Attempting to sign in with account selector...');
    const userInfo = await GoogleSignin.signIn({
      forceCodeForRefreshToken: true,
      prompt: 'select_account'
    });
    
    console.log('Sign-in successful, user info:', JSON.stringify(userInfo));
    
    // Extract the ID token and user data
    // Note: In native Android, the structure is userInfo.user
    // In Expo development builds, it might be userInfo.data.user
    
    let idToken = null;
    let userData = null;
    
    if (userInfo.data) {
      // Expo dev build structure
      idToken = userInfo.data.idToken;
      userData = userInfo.data.user;
    } else {
      // Native structure
      idToken = userInfo.idToken;
      userData = userInfo.user;
    }
    
    if (!userData || !idToken) {
      throw new Error('Failed to extract user data from Google Sign-In response');
    }
    
    console.log('Extracted user data:', JSON.stringify(userData));
    
    // Store the raw Google user data in AsyncStorage as a fallback
    try {
      await AsyncStorage.setItem('googleRawUserData', JSON.stringify(userData));
      console.log('Stored raw Google user data for backup');
    } catch (storageError) {
      console.warn('Failed to store Google user data:', storageError);
    }
    
    // Import the action dynamically to avoid circular dependencies
    const { googleLogin } = require('../redux/actions/userAction');
    
    // Use the googleLogin action
    console.log('Dispatching to Redux...');
    try {
      const result = await store.dispatch(googleLogin(idToken, userData));
      console.log('Google login dispatch result:', result);
      return { success: true };
    } catch (dispatchError) {
      console.error('Error dispatching Google login:', dispatchError);
      
      // Create fallback user if backend call fails
      const fallbackUser = {
        _id: userData.id || 'google-' + Date.now(),
        name: userData.name || 'Google User',
        email: userData.email || '',
        avatar: { url: userData.photo || '' },
        role: 'user'
      };
      
      // Store the fallback user in AsyncStorage for persistence
      try {
        await AsyncStorage.setItem('googleUserData', JSON.stringify(fallbackUser));
        console.log('Stored fallback user data for persistence');
      } catch (storageError) {
        console.warn('Failed to store fallback user data:', storageError);
      }
      
      // Dispatch directly to the store
      store.dispatch({
        type: "loadUserSuccess",
        payload: fallbackUser
      });
      
      return { success: true, fallback: true, user: fallbackUser };
    }
  } catch (error) {
    console.error('Google Sign-In error:', error);
    
    let errorMessage = 'Unknown error';
    
    if (statusCodes) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = 'Sign in cancelled';
        console.log('User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorMessage = 'Sign in is already in progress';
        console.log('Sign in is in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = 'Play services not available or outdated';
        console.log('Play services not available');
      } else {
        errorMessage = error.message || 'Unknown error';
        console.error('Other Google Sign-In error:', error);
      }
    } else {
      console.error('Status codes not available, raw error:', error);
    }
    
    return { 
      success: false, 
      error: { 
        code: error.code,
        message: errorMessage 
      } 
    };
  }
};

// Sign out from Google
export const signOutFromGoogle = async () => {
  // Return success if running in Expo Go (nothing to sign out from)
  if (isExpoGo) return { success: true };
  
  try {
    await GoogleSignin.signOut();
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error };
  }
};

// Function to try to restore Google session from storage
export const tryRestoreGoogleSession = async () => {
  try {
    // Check for stored credentials first
    const storedCredentials = await AsyncStorage.getItem('googleCredentials');
    if (!storedCredentials) return null;
    
    const credentials = JSON.parse(storedCredentials);
    
    // Check if credentials are still valid (15 days)
    const fifteenDaysInMs = 15 * 24 * 60 * 60 * 1000;
    if (Date.now() - credentials.timestamp > fifteenDaysInMs) {
      // Credentials expired, clear them
      await AsyncStorage.removeItem('googleCredentials');
      await AsyncStorage.removeItem('googleUserData');
      await AsyncStorage.removeItem('googleRawUserData');
      return null;
    }
    
    // Credentials valid, get stored user data
    const userDataString = await AsyncStorage.getItem('googleUserData');
    const rawUserDataString = await AsyncStorage.getItem('googleRawUserData');
    
    if (!userDataString || !rawUserDataString) return null;
    
    return {
      userData: JSON.parse(userDataString),
      rawUserData: JSON.parse(rawUserDataString),
      token: credentials.token
    };
  } catch (error) {
    console.error('Error restoring Google session:', error);
    return null;
  }
}; 
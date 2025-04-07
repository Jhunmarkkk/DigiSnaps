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
  console.log('Starting Google Sign-In process...');
  
  // For Expo Go testing, provide mock data
  if (isExpoGo) {
    console.log('Running in Expo Go - providing mock data');
    
    // Create mock user data
    const mockUserData = {
      id: 'google_' + Date.now(),
      name: 'Test User',
      email: 'test.user@example.com',
      photo: 'https://ui-avatars.com/api/?name=Test+User&background=random',
    };
    
    // Store mock data for persistence
    try {
      await AsyncStorage.setItem('googleRawUserData', JSON.stringify(mockUserData));
      console.log('Stored mock Google user data');
      
      const tokenData = {
        mockToken: `google_mock_${Date.now()}`,
        email: mockUserData.email,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem('googleCredentials', JSON.stringify(tokenData));
      
      // Import the action dynamically to avoid circular dependencies
      try {
        const { googleLogin } = require('../redux/actions/userAction');
        console.log('Dispatching mock Google login...');
        
        if (typeof googleLogin !== 'function') {
          console.error('googleLogin is not a function:', googleLogin);
          throw new Error('Google login action not available');
        }
        
        await store.dispatch(googleLogin(null, mockUserData));
        return { success: true, mock: true };
      } catch (dispatchError) {
        console.error('Error dispatching mock Google login:', dispatchError);
        return { 
          success: false, 
          error: { message: 'Failed to process mock Google login' },
          mock: true
        };
      }
    } catch (storageError) {
      console.error('Error storing mock data:', storageError);
      return { 
        success: false, 
        error: { message: 'Error storing mock data' },
        mock: true
      };
    }
  }
  
  // Real Google Sign-In logic for development builds
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
      console.log('Cleared previous sessions');
    } catch (signOutError) {
      console.log('Error during pre-sign-in sign-out:', signOutError);
      // Continue anyway - this is just to ensure fresh login
    }
    
    // Now attempt sign-in with account selection
    console.log('Attempting to sign in with account selector...');
    const userInfo = await GoogleSignin.signIn();
    
    console.log('Google Sign-In successful!');
    
    // Extract the ID token and user data
    let idToken = null;
    let userData = null;
    
    // Print the structure for debugging
    console.log('GoogleSignin response structure:', 
      JSON.stringify(Object.keys(userInfo || {})));
    
    // Handle different response structures
    if (userInfo.user) {
      // Standard structure
      idToken = userInfo.idToken;
      userData = {
        id: userInfo.user.id,
        name: userInfo.user.name || userInfo.user.displayName,
        email: userInfo.user.email,
        photo: userInfo.user.photo || userInfo.user.photoURL,
      };
      console.log('Extracted user data from standard structure');
    } else if (userInfo.data && userInfo.data.user) {
      // Alternative structure sometimes seen in Expo
      idToken = userInfo.data.idToken;
      userData = {
        id: userInfo.data.user.id,
        name: userInfo.data.user.name || userInfo.data.user.displayName,
        email: userInfo.data.user.email,
        photo: userInfo.data.user.photo || userInfo.data.user.photoURL,
      };
      console.log('Extracted user data from Expo alternative structure');
    } else {
      // Try to extract data from any structure
      console.log('Unknown structure, attempting to extract data');
      idToken = userInfo.idToken || userInfo.data?.idToken || null;
      
      // Try to build userData from whatever we can find
      const extractedData = userInfo.user || userInfo.data?.user || userInfo;
      userData = {
        id: extractedData.id || extractedData.userId || extractedData.googleId || Date.now().toString(),
        name: extractedData.name || extractedData.displayName || 'Google User',
        email: extractedData.email || 'unknown@example.com',
        photo: extractedData.photo || extractedData.photoURL || extractedData.avatar?.url || null,
      };
      
      console.log('Attempted to extract data from unknown structure:', userData.email);
    }
    
    if (!userData || !userData.email) {
      throw new Error('Failed to extract user data from Google Sign-In response');
    }
    
    console.log('Successfully extracted user data for:', userData.email);
    
    // Store the data for backup
    try {
      if (userData && typeof userData === 'object') {
        // Ensure we're not storing null or undefined
        const safeUserData = {
          id: userData.id || 'unknown',
          name: userData.name || 'Google User',
          email: userData.email || 'unknown@example.com',
          photo: userData.photo || ''
        };
        await AsyncStorage.setItem('googleRawUserData', JSON.stringify(safeUserData));
        console.log('Stored raw Google user data in AsyncStorage');
      } else {
        console.warn('Skipping AsyncStorage for invalid userData', typeof userData);
      }
    } catch (storageError) {
      console.warn('Failed to store Google user data:', storageError);
    }
    
    // Import the action dynamically to avoid circular dependencies
    try {
      const { googleLogin } = require('../redux/actions/userAction');
      console.log('Importing googleLogin action...');
      
      if (typeof googleLogin !== 'function') {
        console.error('googleLogin is not a function:', googleLogin);
        throw new Error('Google login action not available');
      }
      
      console.log('Dispatching googleLogin action to Redux...');
      await store.dispatch(googleLogin(idToken, userData));
      console.log('Google login dispatch successful');
      
      return { success: true };
    } catch (dispatchError) {
      console.error('Error dispatching Google login:', dispatchError);
      
      // Create fallback user
      const fallbackUser = {
        _id: userData?.id ? `google-${userData.id}` : `google-${Date.now()}`,
        name: userData?.name || 'Google User',
        email: userData?.email || 'unknown@example.com',
        avatar: { url: userData?.photo || '' },
        role: 'user'
      };
      
      // Store the fallback user in AsyncStorage for persistence
      try {
        await AsyncStorage.setItem('googleUserData', JSON.stringify(fallbackUser));
        console.log('Stored fallback user data for persistence');
        
        // Create mock token
        const tokenData = {
          mockToken: `google_mock_${Date.now()}`,
          email: fallbackUser.email,
          timestamp: Date.now()
        };
        await AsyncStorage.setItem('googleCredentials', JSON.stringify(tokenData));
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
    if (!storedCredentials) {
      console.log('No stored Google credentials found');
      return null;
    }
    
    // Parse credentials, with fallback if parse fails
    let credentials;
    try {
      credentials = JSON.parse(storedCredentials);
    } catch (parseError) {
      console.error('Error parsing stored credentials:', parseError);
      // Clear invalid data
      await AsyncStorage.removeItem('googleCredentials');
      return null;
    }
    
    // Basic validation of credentials
    if (!credentials || typeof credentials !== 'object') {
      console.warn('Invalid credentials format');
      await AsyncStorage.removeItem('googleCredentials');
      return null;
    }
    
    // Check if credentials are still valid (15 days)
    const fifteenDaysInMs = 15 * 24 * 60 * 60 * 1000;
    if (!credentials.timestamp || Date.now() - credentials.timestamp > fifteenDaysInMs) {
      // Credentials expired or invalid, clear them
      console.log('Credentials expired or missing timestamp');
      await AsyncStorage.removeItem('googleCredentials');
      await AsyncStorage.removeItem('googleUserData');
      await AsyncStorage.removeItem('googleRawUserData');
      return null;
    }
    
    console.log('Valid credentials found for:', credentials.email || 'unknown');
    
    // Credentials valid, get stored user data
    const userDataString = await AsyncStorage.getItem('googleUserData');
    if (!userDataString) {
      console.warn('No user data found despite valid credentials');
      return null;
    }
    
    // Parse userData with error handling
    let userData;
    try {
      userData = JSON.parse(userDataString);
    } catch (parseError) {
      console.error('Error parsing stored user data:', parseError);
      return null;
    }
    
    // Try to get raw user data, but don't fail if it's missing
    let rawUserData = { id: 'unknown', email: 'unknown', name: 'Unknown User' };
    try {
      const rawUserDataString = await AsyncStorage.getItem('googleRawUserData');
      if (rawUserDataString) {
        rawUserData = JSON.parse(rawUserDataString);
      } else {
        console.log('No raw user data found, using defaults');
        // Create and store default raw data for future use
        if (userData && userData.email) {
          rawUserData = {
            id: userData._id || 'unknown',
            name: userData.name || 'Unknown User',
            email: userData.email || 'unknown@example.com',
            photo: userData.avatar?.url || ''
          };
          await AsyncStorage.setItem('googleRawUserData', JSON.stringify(rawUserData));
          console.log('Created and stored default raw user data');
        }
      }
    } catch (rawDataError) {
      console.warn('Error handling raw user data:', rawDataError);
      // Continue with default raw data
    }
    
    // Make sure the token is set properly
    const token = credentials.token || credentials.mockToken || null;
    if (!token) {
      console.warn('No token found in credentials');
    }
    
    console.log('Session restored successfully for:', rawUserData.email || userData.email || 'unknown');
    
    return {
      userData: userData,
      rawUserData: rawUserData,
      token: token
    };
  } catch (error) {
    console.error('Error restoring Google session:', error);
    return null;
  }
}; 
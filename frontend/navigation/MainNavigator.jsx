import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadUser, googleLogin } from "../redux/actions/userAction";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { tryRestoreGoogleSession } from '../utils/googleSignIn';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';

const Stack = createStackNavigator();

const MainNavigator = () => {
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        console.log("Checking for existing sessions...");
        
        // Check if we have a force new login flag
        const forceNewLogin = await AsyncStorage.getItem('forceNewGoogleLogin');
        if (forceNewLogin === 'true') {
          console.log("Force new login flag detected, clearing previous sessions");
          try {
            await AsyncStorage.removeItem('googleAuth');
            await AsyncStorage.removeItem('googleCredentials');
            await AsyncStorage.removeItem('googleUserData');
            await AsyncStorage.removeItem('googleRawUserData');
            await AsyncStorage.removeItem('forceNewGoogleLogin');
            await AsyncStorage.removeItem('token');
          } catch (clearError) {
            console.error("Error clearing session data:", clearError);
          }
          
          setLoading(false);
          return;
        }
        
        // First try to restore Google session
        try {
          const googleSession = await tryRestoreGoogleSession();
          
          if (googleSession && googleSession.userData) {
            console.log("Restored Google session for:", googleSession.rawUserData?.email || 'unknown user');
            
            // If we have a token, set it in AsyncStorage
            if (googleSession.token) {
              await AsyncStorage.setItem('token', googleSession.token);
              console.log("Token restored from Google session");
            }
            
            // Dispatch the action to tell Redux about the user
            dispatch({
              type: "loadUserSuccess",
              payload: googleSession.userData
            });
            console.log("User authenticated via Google session");
            setLoading(false);
            return;
          } else {
            console.log("No valid Google session found, trying regular token");
          }
        } catch (googleError) {
          console.error("Error restoring Google session:", googleError);
          // Continue to regular token authentication
        }
          
        // If Google session wasn't restored, attempt normal token restoration
        try {
          await dispatch(loadUser());
        } catch (tokenError) {
          console.error("Error loading user with token:", tokenError);
          // Allow failure - user will see login screen
        }
      } catch (error) {
        console.error("Session restoration error:", error.message);
        // Even if there's an error, we'll allow the user to proceed to the login screen
      } finally {
        setLoading(false);
      }
    })();
  }, [dispatch]);

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Stack.Screen name="Main" component={TabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigator; 
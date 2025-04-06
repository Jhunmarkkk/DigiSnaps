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
          await AsyncStorage.removeItem('googleAuth');
          await AsyncStorage.removeItem('googleCredentials');
          await AsyncStorage.removeItem('googleUserData');
          await AsyncStorage.removeItem('googleRawUserData');
          await AsyncStorage.removeItem('forceNewGoogleLogin');
          
          setLoading(false);
          return;
        }
        
        // First try to restore Google session
        const googleSession = await tryRestoreGoogleSession();
        
        if (googleSession) {
          console.log("Restored Google session for:", googleSession.rawUserData.email);
          
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
        } else {
          console.log("No Google session found, trying regular token");
          // If Google session wasn't restored, attempt normal token restoration
          await dispatch(loadUser());
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
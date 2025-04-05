import Main from "./Main";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import React, { useEffect } from 'react';
import { initStorage } from './utils/storage';
import { loadCartFromDatabase } from './redux/actions/cartActions';
import { loadUser } from './redux/actions/userAction';
import "./utils/axiosConfig"; // Import axios configuration
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveToken } from './utils/secureStore';
import { configureNotifications } from './utils/notifications';

export default function App() {
  useEffect(() => {
    const setupApp = async () => {
      try {
        console.log('Setting up app...');
        
        // Initialize AsyncStorage for cart
        await initStorage();
        
        // Set up push notifications
        configureNotifications();
        
        // Migrate token from AsyncStorage to SecureStore if needed
        await migrateToken();
        
        // Load cart items from AsyncStorage
        store.dispatch(loadCartFromDatabase());
        
        // Load user data from the token
        store.dispatch(loadUser());
        
        console.log('App setup complete');
      } catch (error) {
        console.error('Error setting up app:', error);
      }
    };

    setupApp();
  }, []);

  // Function to migrate token from AsyncStorage to SecureStore
  const migrateToken = async () => {
    try {
      // Check if token exists in AsyncStorage
      const oldToken = await AsyncStorage.getItem('token');
      if (oldToken) {
        console.log('Found token in AsyncStorage, migrating to SecureStore');
        
        // Save to SecureStore
        await saveToken(oldToken);
        
        // Delete from AsyncStorage
        await AsyncStorage.removeItem('token');
        
        console.log('Token migration complete');
      }
    } catch (error) {
      console.error('Error migrating token:', error);
    }
  };

  return (
    <Provider store={store}>
      <Main />
    </Provider>
  );
}

import Main from "./Main";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import React, { useEffect } from 'react';
import { initStorage } from './utils/storage';
import { loadCartFromDatabase } from './redux/actions/cartActions';
import { loadUser } from './redux/actions/userAction';
// import "./utils/axiosConfig"; // Import axios configuration

export default function App() {
  useEffect(() => {
    const setupApp = async () => {
      try {
        console.log('Initializing storage...');
        // Initialize storage
        await initStorage();
        console.log('Storage initialized, loading cart items...');
        // Load cart items from AsyncStorage
        store.dispatch(loadCartFromDatabase());
        // Load user data from the token
        console.log('Loading user data...');
        store.dispatch(loadUser());
      } catch (error) {
        console.error('Error setting up app:', error);
      }
    };

    setupApp();
  }, []);

  return (
    <Provider store={store}>
      <Main />
    </Provider>
  );
}

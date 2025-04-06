import React from 'react';
import Main from "./Main";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import "./utils/axiosConfig"; // Import axios configuration
import { LogBox } from "react-native";

// Ignore certain warnings
LogBox.ignoreLogs([
  "AsyncStorage has been extracted from react-native core",
  "Setting a timer for a long period of time",
  "VirtualizedLists should never be nested inside plain ScrollViews",
]);

export default function App() {
  return (
    <Provider store={store}>
      <Main />
    </Provider>
  );
}

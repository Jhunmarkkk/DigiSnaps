import React, { useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  DrawerContentScrollView,
  DrawerItem,
  createDrawerNavigator,
} from "@react-navigation/drawer";
import Home from "./screens/Home";
import ProductDetails from "./screens/ProductDetails";
import Toast from "react-native-toast-message";
import Cart from "./screens/Cart";
import ConfirmOrder from "./screens/ConfirmOrder";
import Payment from "./components/Payment";
import Login from "./screens/Login";
import ForgetPassword from "./screens/ForgetPassword";
import Verify from "./screens/Verify";
import SignUp from "./screens/SignUp";
import Profile from "./screens/Profile";
import UpdateProfile from "./screens/UpdateProfile";
import ChangePassword from "./screens/ChangePassword";
import Orders from "./screens/Orders";
import AdminDashboard from "./screens/Admin/AdminDashboard";
import Categories from "./screens/Admin/Categories";
import AdminOrders from "./screens/Admin/AdminOrders";
import UpdateProduct from "./screens/Admin/UpdateProduct";
import NewProduct from "./screens/Admin/NewProduct";
import ProductImages from "./screens/Admin/ProductImages";
import Camera from "./screens/Camera";
import { useDispatch, useSelector } from "react-redux";
import { loadUser, logout } from "./redux/actions/userAction";
import { View } from "react-native-animatable";
import { Text, TouchableOpacity } from "react-native";
import { Avatar } from "react-native-paper";
import { colors, defaultImg } from "./styles/styles";
import UpdateCategory from "./screens/Admin/UpdateCategory";
import Products from "./screens/Admin/Products";
import { configureNotifications, setNavigationRef } from './utils/notifications';

const Stack = createNativeStackNavigator();

const Drawer = createDrawerNavigator();

const DrawerContent = (props) => {
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const { navigation } = props;
  
  // Check if user is admin
  const isAdmin = user && user.role === "admin";
  
  const handleLogout = async () => {
    // Dispatch logout action and wait for it to complete
    await dispatch(logout());
    
    // Only reset navigation after logout is complete
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: "login" }],
      });
    }, 100);
  };

  return (
    <DrawerContentScrollView
      {...props}
      style={{ backgroundColor: colors.color3, color: colors.color1 }}
    >
      <View style={{ alignItems: "center", padding: 20 }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (isAuthenticated) {
              if (isAdmin) {
                navigation.navigate("admindashboard");
              } else {
                navigation.navigate("profile");
              }
            } else navigation.navigate("login");
          }}
        >
          <Avatar.Image
            source={{ uri: user?.avatar ? user.avatar.url : defaultImg }}
            size={135}
            style={{ backgroundColor: colors.color1 }}
          />
          <Text
            style={{ marginTop: 20, fontWeight: "500", color: colors.color2 }}
          >
            {user ? `Welcome back, ${user.name}!` : "Login"}
          </Text>
          <Text
            style={{ marginTop: 0, fontWeight: "200", color: colors.color2 }}
          >
            {user ? `${user.email}` : ""}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Only show Home for non-admin users */}
      {(!isAdmin) && (
        <DrawerItem
          label="Home"
          onPress={() => navigation.navigate("home")}
          labelStyle={{ color: colors.color2, fontWeight: "500" }}
        />
      )}
      
      {/* Only show Orders for authenticated non-admin users */}
      {isAuthenticated && !isAdmin && (
        <DrawerItem
          label="My Orders"
          onPress={() => navigation.navigate("orders")}
          labelStyle={{ color: colors.color2, fontWeight: "500" }}
        />
      )}
      
      {/* Show Admin Dashboard for admin users */}
      {isAuthenticated && isAdmin && (
        <DrawerItem
          label="Admin Dashboard"
          onPress={() => navigation.navigate("admindashboard")}
          labelStyle={{ color: colors.color2, fontWeight: "500" }}
        />
      )}
      
      {/* Show logout option for authenticated users */}
      {isAuthenticated && (
        <DrawerItem
          label="Logout"
          onPress={handleLogout}
          labelStyle={{ color: colors.color2, fontWeight: "500" }}
        />
      )}
    </DrawerContentScrollView>
  );
};

const StackNavigator = () => {
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const isAdmin = user && user.role === "admin";

  // Determine the initial route based on authentication and role
  const initialRoute = !isAuthenticated ? "login" : 
                       isAdmin ? "admindashboard" : "home";

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="home" component={Home} />
      <Stack.Screen name="productdetails" component={ProductDetails} />
      <Stack.Screen name="cart" component={Cart} />
      <Stack.Screen name="confirmorder" component={ConfirmOrder} />
      <Stack.Screen name="payment" component={Payment} />
      <Stack.Screen name="login" component={Login} />
      <Stack.Screen name="signup" component={SignUp} />
      <Stack.Screen name="profile" component={Profile} />
      <Stack.Screen name="updateprofile" component={UpdateProfile} />
      <Stack.Screen name="changepassword" component={ChangePassword} />
      <Stack.Screen name="orders" component={Orders} />
      <Stack.Screen name="camera" component={Camera} />
      <Stack.Screen name="forgetpassword" component={ForgetPassword} />
      <Stack.Screen name="verify" component={Verify} />
      <Stack.Screen name="admindashboard" component={AdminDashboard} />
      <Stack.Screen name="categories" component={Categories} />
      <Stack.Screen name="updatecategory" component={UpdateCategory} />
      <Stack.Screen name="adminorders" component={AdminOrders} />
      <Stack.Screen name="updateproduct" component={UpdateProduct} />
      <Stack.Screen name="newproduct" component={NewProduct} />
      <Stack.Screen name="productimages" component={ProductImages} />
      <Stack.Screen name="products" component={Products} />
    </Stack.Navigator>
  );
};

const Main = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const isAdmin = user && user.role === "admin";
  const navigationRef = useRef(null);

  useEffect(() => {
    dispatch(loadUser());
    
    // Configure push notifications
    const unsubscribe = configureNotifications();
    
    return () => {
      // Clean up notification listeners
      if (unsubscribe) unsubscribe();
    };
  }, [dispatch]);

  const getInitialRoute = () => {
    if (!isAuthenticated) return "login";
    if (isAdmin) return "admindashboard";
    return "home";
  };

  return (
    <NavigationContainer 
      ref={(ref) => {
        navigationRef.current = ref;
        setNavigationRef(ref);
      }}
    >
      <Drawer.Navigator
        initialRouteName={getInitialRoute()}
        drawerContent={(props) => <DrawerContent {...props} />}
      >
        <Drawer.Screen name=" " component={StackNavigator} />
      </Drawer.Navigator>
      <Toast position="top" />
    </NavigationContainer>
  );
};

export default Main;

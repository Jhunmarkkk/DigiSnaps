import { View, Text, TouchableOpacity, Image, StyleSheet, Platform, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import {
  defaultStyle,
  colors,
  formHeading,
  formHeading2,
  inputOptions,
  formStyles as styles,
} from "../styles/styles";
import { Button, TextInput } from "react-native-paper";
import Footer from "../components/Footer";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/actions/userAction";
import Header from "../components/Header";
import { configureGoogleSignIn, signInWithGoogle } from "../utils/googleSignIn";
import Constants from 'expo-constants';

// Check if we're running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const dispatch = useDispatch();
  const { error, message, isAuthenticated, user } = useSelector((state) => state.user);

  // Initialize Google Sign-In when component mounts only if not in Expo Go
  useEffect(() => {
    if (!isExpoGo) {
      configureGoogleSignIn();
    }
  }, []);

  const submitHandler = async () => {
    setIsLoading(true);
    
    // Hardcoded admin credentials check
    if (email === "admin@gmail.com" && password === "123456") {
      try {
        await dispatch(login(email, password));
        // Will redirect to admin dashboard in the useEffect below
      } catch (error) {
        console.error("Login error:", error);
      }
    } else {
      try {
        await dispatch(login(email, password));
      } catch (error) {
        console.error("Login error:", error);
      }
    }
    
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      console.log('Starting Google Sign-In...');
      const result = await signInWithGoogle();
      console.log('Google Sign-In result:', result);
      
      if (!result.success) {
        const errorMsg = result.error?.message || 'Unknown error';
        console.error(`Google Sign-In failed: ${errorMsg}`, result.error);
        alert(`Google Sign-In failed: ${errorMsg}`);
      } else {
        console.log('Google Sign-In successful');
      }
      // Navigation will be handled by the useEffect below that watches isAuthenticated
    } catch (error) {
      console.error("Google Sign-In error:", error);
      alert(`Google Sign-In failed: ${error.message || 'Unknown error'}`);
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      alert(error);
      dispatch({ type: "clearError" });
    }
    if (message) {
      alert(message);
      dispatch({ type: "clearMessage" });
    }
    if (isAuthenticated) {
      // Check if this is the hardcoded admin account
      if (email === "admin@gmail.com" && password === "123456") {
        navigation.reset({
          index: 0,
          routes: [{ name: "admindashboard" }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "home" }],
        });
      }
    }
  }, [error, message, isAuthenticated]);

  return (
    <>
      <ScrollView style={defaultStyle} contentContainerStyle={{paddingBottom: 80}}>
        <View style={{ marginTop: 20, marginBottom: 20 }}>
          <Text style={formHeading}>Login</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("signup")}
          >
            <Text style={formHeading2}>
              Don't Have an Account?{" "}
              <Text style={{ fontWeight: "bold" }}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.container}>
          <TextInput
            {...inputOptions}
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            {...inputOptions}
            placeholder="Password"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
          <Button
            loading={isLoading}
            textColor={colors.color2}
            disabled={isLoading || email === "" || password === ""}
            style={styles.btn}
            onPress={submitHandler}
          >
            Log In
          </Button>

          <View style={googleStyles.divider}>
            <View style={googleStyles.line} />
            <Text style={googleStyles.orText}>OR</Text>
            <View style={googleStyles.line} />
          </View>

          <Button
            mode="outlined"
            loading={googleLoading}
            icon="google"
            contentStyle={googleStyles.googleButton}
            style={googleStyles.googleButtonContainer}
            onPress={handleGoogleSignIn}
            disabled={googleLoading || isExpoGo}
          >
            {isExpoGo ? "Google Sign-In (Unavailable in Expo Go)" : "Sign in with Google"}
          </Button>
        </View>
      </ScrollView>

      <Footer activeRoute="profile" />
    </>
  );
};

const googleStyles = StyleSheet.create({
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.color3,
  },
  orText: {
    marginHorizontal: 10,
    color: colors.color3,
  },
  googleButtonContainer: {
    borderColor: colors.color1,
    borderRadius: 100,
    marginVertical: 10,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
});

export default Login;

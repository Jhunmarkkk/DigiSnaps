import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
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

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const { error, message, isAuthenticated, user } = useSelector((state) => state.user);

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
      <View style={defaultStyle}>
        <View style={{ marginBottom: 20 }}>
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

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("forgetpassword")}
          >
            <Text style={styles.forget}>Forgot Password?</Text>
          </TouchableOpacity>
          <Button
            loading={isLoading}
            textColor={colors.color2}
            disabled={isLoading || email === "" || password === ""}
            style={styles.btn}
            onPress={submitHandler}
          >
            Log In
          </Button>
        </View>
      </View>

      <Footer activeRoute="profile" />
    </>
  );
};

export default Login;

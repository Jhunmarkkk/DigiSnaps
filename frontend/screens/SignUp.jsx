import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import {
  colors,
  defaultStyle,
  formHeading,
  formHeading2,
  inputOptions,
  formStyles as styles,
  defaultImg,
} from "../styles/styles";
import { Avatar, Button, TextInput } from "react-native-paper";
import Footer from "../components/Footer";
import mime from "mime";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../redux/actions/userAction";
import { useMessageAndErrorUser } from "../utils/hooks";

const SignUp = ({ navigation, route }) => {
  const [avatar, setAvatar] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const { error, message } = useSelector((state) => state.user);

  const disableBtn =
    !name ||
    !email ||
    !password ||
    !address ||
    !city ||
    !country ||
    !pinCode ||
    !avatar;

  const submitHandler = async () => {
    setIsLoading(true);
    try {
      const myForm = new FormData();

      myForm.append("name", name);
      myForm.append("email", email);
      myForm.append("password", password);
      myForm.append("address", address);
      myForm.append("city", city);
      myForm.append("country", country);
      myForm.append("pinCode", pinCode);

      if (avatar !== "") {
        myForm.append("file", {
          uri: avatar,
          type: mime.getType(avatar),
          name: avatar.split("/").pop(),
        });
      }

      console.log("Submitting form data:", JSON.stringify(myForm));
      await dispatch(register(myForm));
      
      if (error) {
        console.log("Registration error:", error);
        alert(`Registration failed: ${error}`);
      } else if (message) {
        console.log("Registration success:", message);
        alert("Registration successful!");
        navigation.navigate("login");
      }
    } catch (err) {
      console.log("Error in submitHandler:", err);
      alert(`An error occurred: ${err.message}`);
    } finally {
      setIsLoading(false);
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
  }, [error, message, dispatch]);

  useEffect(() => {
    if (route.params?.image) setAvatar(route.params.image);
  }, [route.params]);

  return (
    <>
      <ScrollView style={defaultStyle} contentContainerStyle={{paddingBottom: 80}}>
        {/* Heading */}
        <View style={{ marginTop: 20, marginBottom: 20 }}>
          <Text style={formHeading}>Sign Up</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("login")}
          >
            <Text style={formHeading2}>
              I already have an account |{" "}
              <Text style={{ fontWeight: "bold" }}>Log In</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            padding: 20,
            borderRadius: 10,
            backgroundColor: colors.color4,
          }}
        >
          <View>
            <Avatar.Image
              style={{
                alignSelf: "center",
                backgroundColor: colors.color1,
              }}
              size={80}
              source={{
                uri: avatar ? avatar : defaultImg,
              }}
            />
            <TouchableOpacity onPress={() => navigation.navigate("camera")}>
              <Button textColor={colors.color1}>Change Photo</Button>
            </TouchableOpacity>

            <TextInput
              {...inputOptions}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              {...inputOptions}
              placeholder="Email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              {...inputOptions}
              secureTextEntry={true}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
            />

            <TextInput
              {...inputOptions}
              placeholder="Address"
              value={address}
              onChangeText={setAddress}
            />
            <TextInput
              {...inputOptions}
              placeholder="City"
              value={city}
              onChangeText={setCity}
            />
            <TextInput
              {...inputOptions}
              placeholder="Country"
              value={country}
              onChangeText={setCountry}
            />

            <TextInput
              {...inputOptions}
              placeholder="Pin Code"
              value={pinCode}
              onChangeText={setPinCode}
            />

            <Button
              loading={isLoading}
              textColor={colors.color2}
              disabled={isLoading || disableBtn}
              style={styles.btn}
              onPress={submitHandler}
            >
              Sign Up
            </Button>
          </View>
        </View>
      </ScrollView>

      <Footer activeRoute="profile" />
    </>
  );
};

export default SignUp;

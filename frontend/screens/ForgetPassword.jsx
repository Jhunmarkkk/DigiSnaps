import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import {
  defaultStyle,
  colors,
  formHeading,
  inputOptions,
  formStyles as styles,
} from "../styles/styles";
import { Button, TextInput } from "react-native-paper";
import Footer from "../components/Footer";
import { useDispatch } from "react-redux";
import { useMessageAndErrorOther } from "../utils/hooks";
import { forgetPassword } from "../redux/actions/otherAction";
import Header from "../components/Header";

const ForgetPassword = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();

  const loading = useMessageAndErrorOther(dispatch, navigation, "verify");

  const submitHandler = () => {
    dispatch(forgetPassword(email));
  };
  return (
    <>
      <View style={{ ...defaultStyle, backgroundColor: colors.color2 }}>
      <Header showCartButton={false} back={true}/>
        <View style={{ marginBottom: 20, marginTop: 60 }}>
          <Text style={formHeading}>Forget Password</Text>
        </View>
        <View style={styles.container}>
          <TextInput
            {...inputOptions}
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Button
            loading={loading}
            textColor={colors.color2}
            disabled={email === ""}
            style={styles.btn}
            onPress={submitHandler}
          >
            Send OTP
          </Button>
        </View>
      </View>

      <Footer activeRoute="profile" />
    </>
  );
};

export default ForgetPassword;

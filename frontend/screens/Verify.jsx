import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
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
import { useDispatch } from "react-redux";
import { useMessageAndErrorOther } from "../utils/hooks";
import { resetPassword } from "../redux/actions/otherAction";
import Header from "../components/Header";

const Verify = ({ navigation }) => {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const loading = useMessageAndErrorOther(dispatch, navigation, "login");

  const submitHandler = () => {
    dispatch(resetPassword(otp, password));
  };
  return (
    <>
      <View style={{ ...defaultStyle, backgroundColor: colors.color2 }}>
        <Header showCartButton={false} back={true} />
        <View style={{ marginBottom: 20, marginTop: 60 }}>
          <Text style={formHeading}>Reset Password</Text>
          <Text style={formHeading2}>
              An OTP has been sent to your{" "}
              <Text style={{ fontWeight: "bold" }}>email</Text>
            </Text>
        </View>
        <View style={styles.container}>
          <TextInput
            {...inputOptions}
            placeholder="OTP"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
          />
          <TextInput
            {...inputOptions}
            placeholder="New Password"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("forgetpassword")}
          >
            <Text style={styles.forget}>Resend OTP</Text>
          </TouchableOpacity>
          <Button
            loading={loading}
            textColor={colors.color2}
            disabled={otp === "" || password === ""}
            style={styles.btn}
            onPress={submitHandler}
          >
            Reset Password
          </Button>
        </View>
      </View>

      <Footer activeRoute="profile" />
    </>
  );
};

export default Verify;

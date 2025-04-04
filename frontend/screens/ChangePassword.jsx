import { View, Text } from "react-native";
import React, { useState } from "react";
import {
  defaultStyle,
  colors,
  formHeading,
  inputOptions,
  formStyles as styles,
} from "../styles/styles";
import { Button, TextInput } from "react-native-paper";
import Header from "../components/Header";
import { useDispatch } from "react-redux";
import { updatePassword } from "../redux/actions/otherAction";
import { useMessageAndErrorOther } from "../utils/hooks";

const ChangePassword = ({ navigation }) => {
  const [oldpassword, setOldPassword] = useState("");
  const [newpassword, setNewPassword] = useState("");

  const dispatch = useDispatch();
  const loading = useMessageAndErrorOther(dispatch, navigation, "profile");

  const submitHandler = () => {
    dispatch(updatePassword(oldpassword, newpassword));
    setOldPassword("");
    setNewPassword("");
  };

  return (
    <View style={defaultStyle}>
      <Header back={true} showCartButton={false}/>
      <View style={{ marginBottom: 20, paddingTop: 70 }}>
        <Text style={formHeading}>Change Password</Text>
      </View>
      <View style={styles.container}>
        <TextInput
          {...inputOptions}
          placeholder="Old Password"
          secureTextEntry={true}
          value={oldpassword}
          onChangeText={setOldPassword}
        />
        <TextInput
          {...inputOptions}
          placeholder="New Password"
          secureTextEntry={true}
          value={newpassword}
          onChangeText={setNewPassword}
        />

        <Button
          loading={loading}
          textColor={colors.color2}
          disabled={oldpassword === "" || newpassword === ""}
          style={styles.btn}
          onPress={submitHandler}
        >
          Update
        </Button>
      </View>
    </View>
  );
};

export default ChangePassword;

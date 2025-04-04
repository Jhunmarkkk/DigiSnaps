
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import {
  defaultStyle,
  formHeading,
  colors,
  defaultImg,
} from "../styles/styles";
import { Avatar, Button } from "react-native-paper";
import ButtonBox from "../components/ButtonBox";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { useDispatch, useSelector } from "react-redux";
import { loadUser, logout } from "../redux/actions/userAction";
import {
  useMessageAndErrorOther,
  useMessageAndErrorUser,
} from "../utils/hooks";
import { useIsFocused } from "@react-navigation/native";
import mime from "mime";
import { updatePic } from "../redux/actions/otherAction";

const Profile = ({ navigation, route }) => {
  const { user } = useSelector((state) => state.user);
  const [avatar, setAvatar] = useState(
    user?.avatar ? user.avatar.url : defaultImg
  );

  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const loading = useMessageAndErrorUser(navigation, dispatch, "login");

  const logoutHandler = () => {
    dispatch(logout());
  };

  const openDrawer = () => {
    navigation.openDrawer();
  };

  const navigateHandler = (text) => {
    switch (text) {
      case "Admin":
        navigation.navigate("admindashboard");
        break;
      case "Orders":
        navigation.navigate("orders");
        break;
      case "Account":
        navigation.navigate("updateprofile");
        break;
      case "Password":
        navigation.navigate("changepassword");
        break;
      case "Sign Out":
        logoutHandler();
        break;

      default:
      case "Orders":
        navigation.navigate("orders");
        break;
    }
  };

  const loadingPic = useMessageAndErrorOther(dispatch, null, null, loadUser);

  useEffect(() => {
    if (route.params?.image) {
      setAvatar(route.params.image);
      // dispatch updatePic Here
      const myForm = new FormData();
      myForm.append("file", {
        uri: route.params.image,
        type: mime.getType(route.params.image),
        name: route.params.image.split("/").pop(),
      });
      dispatch(updatePic(myForm));
    }

    dispatch(loadUser());
  }, [route.params, dispatch, isFocused]);

  useEffect(() => {
    if (user?.avatar) {
      setAvatar(user.avatar.url);
    }
  }, [user]);

  return (
    <>
      <View style={defaultStyle}>
        <View>
          <Text style={formHeading}>Profile</Text>
        </View>

        {loading ? (
          <Loader />
        ) : (
          <>
            <View style={styles.container}>
              <Avatar.Image
                source={{ uri: avatar }}
                size={100}
                style={{ backgroundColor: colors.color1 }}
              />
              <TouchableOpacity
                disabled={loadingPic}
                onPress={() =>
                  navigation.navigate("camera", { updateProfile: true })
                }
              >
                <Button
                  disabled={loadingPic}
                  loading={loadingPic}
                  textColor={colors.color1}
                >
                  Change Photo
                </Button>
              </TouchableOpacity>

              <Text style={styles.name}>{user?.name}</Text>
              <Text
                style={{
                  fontWeight: 400,
                  color: colors.color3,
                }}
              >
                {user?.email}
              </Text>
            </View>
            <View>
              <View
                style={{
                  flexDirection: "row",
                  margin: 10,
                  justifyContent: "space-evenly",
                }}
              >
                <ButtonBox
                  handler={navigateHandler}
                  text={"Account"}
                  icon={"account-edit"}
                />
                <ButtonBox
                  handler={navigateHandler}
                  text={"Password"}
                  icon={"lock"}
                />
                {user?.role === "admin" && (
                  <ButtonBox
                    handler={navigateHandler}
                    icon={"view-dashboard"}
                    text={"Admin"}
                    reverse={true}
                  />
                )}
              </View>
            </View>
          </>
        )}
      </View>
      <Footer />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.color4,
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "500",
    marginTop: 10,
    color: colors.color3,
  },
});
export default Profile;

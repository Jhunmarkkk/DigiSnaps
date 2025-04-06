import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../styles/styles";
import { Avatar, Badge } from "react-native-paper";
import { useSelector } from "react-redux";

const Footer = ({ activeRoute = "home" }) => {
  const navigate = useNavigation();

  const { loading, isAuthenticated, user } = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.cart);
  
  // Check if user is admin
  const isAdmin = user && user.role === "admin";

  const navigationHandler = (key) => {
    switch (key) {
      case 0:
        navigate.navigate("home");
        break;
      case 1:
        navigate.navigate("cart");
        break;
      case 2:
        if (isAuthenticated) {
          if (isAdmin) {
            navigate.navigate("admindashboard");
          } else {
            navigate.navigate("profile");
          }
        } else navigate.navigate("login");
        break;
      default:
        navigate.navigate("home");
        break;
    }
  };

  const avatarOptions = {
    color: colors.color2,
    size: 50,
    style: {
      backgroundColor: colors.color4,
    },
  };
  return (
    loading === false && (
      <View
        style={{
          backgroundColor: colors.color3,
          borderTopRightRadius: 5,
          borderTopLeftRadius: 5,
          position: "absolute",
          width: "100%",
          bottom: 0,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
          }}
        >
          {/* Only show Home icon for non-admin users */}
          {!isAdmin && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigationHandler(0)}
            >
              <Avatar.Icon
                {...avatarOptions}
                icon={activeRoute === "home" ? "home" : "home-outline"}
              />
            </TouchableOpacity>
          )}
          
          {/* Only show Cart icon for authenticated non-admin users */}
          {isAuthenticated && !isAdmin && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigationHandler(1)}
            >
              <Badge style={styles.badge}><Text style={styles.text}>{cartItems.length}</Text></Badge>
              <Avatar.Icon
                {...avatarOptions}
                icon={activeRoute === "cart" ? "cart" : "cart-outline"}
              />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigationHandler(2)}
          >
            <Avatar.Icon
              {...avatarOptions}
              icon={
                isAuthenticated === false
                  ? "login"
                  : isAdmin
                  ? "view-dashboard"
                  : activeRoute === "profile"
                  ? "account"
                  : "account-outline"
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    )
  );
};

const styles = StyleSheet.create({
  badge: {
    width: 20,
    position: "absolute",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    top: 0,
    right: 0,
  },
  text: {
    fontSize: 12,
    width: 100,
    fontWeight: "bold",
    color: "white"
    
  },
})
export default Footer;

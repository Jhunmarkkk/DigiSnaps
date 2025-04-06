// Header.js

import { TouchableOpacity } from "react-native";
import React from "react";
import { Avatar } from "react-native-paper";
import { colors } from "../styles/styles";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../redux/actions/cartActions";

const Header = ({ 
  back, 
  emptyCart = false, 
  showCartButton = true, 
  showSearchButton = false,
  showNotificationButton = true,
  onSearchButtonPress 
}) => {
  const navigate = useNavigation();
  const dispatch = useDispatch();
  const route = useRoute();
  const { isAuthenticated } = useSelector((state) => state.user);

  const emptyCartHandler = () => {
    dispatch(clearCart());
  };

  const handleCartPress = () => {
    if (emptyCart) {
      emptyCartHandler();
    } else {
      navigate.navigate("cart");
    }
  };

  const handleNotificationPress = () => {
    navigate.navigate("notificationcenter");
  };

  return (
    <>
      {back && (
        <TouchableOpacity
          style={{
            position: "absolute",
            left: 20,
            top: 20,
            zIndex: 10,
          }}
          onPress={() => navigate.goBack()}
        >
          <Avatar.Icon
            style={{
              backgroundColor: colors.color4,
            }}
            icon={"arrow-left"}
            color={
              route.name === "productdetails" ? colors.color3 : colors.color3
            }
          />
        </TouchableOpacity>
      )}

      {showCartButton && (
        <TouchableOpacity
          style={{
            position: "absolute",
            right: 20,
            top: 20,
            zIndex: 10,
          }}
          onPress={handleCartPress}
        >
          <Avatar.Icon
            style={{
              backgroundColor: colors.color4,
            }}
            icon={emptyCart ? "delete-outline" : "cart-outline"}
            color={
              route.name === "productdetails" ? colors.color3 : colors.color3
            }
          />
        </TouchableOpacity>
      )}

      {showSearchButton && (
        <TouchableOpacity
          style={{
            position: "absolute",
            right: showCartButton ? 70 : 20,
            top: 20,
            zIndex: 10,
          }}
          onPress={onSearchButtonPress}
        >
          <Avatar.Icon
            style={{
              backgroundColor: colors.color4,
            }}
            icon={"magnify"}
            color={colors.color3}
          />
        </TouchableOpacity>
      )}

      {isAuthenticated && showNotificationButton && (
        <TouchableOpacity
          style={{
            position: "absolute",
            right: showSearchButton || showCartButton ? 70 : 20,
            top: 20,
            zIndex: 10,
          }}
          onPress={handleNotificationPress}
        >
          <Avatar.Icon
            style={{
              backgroundColor: colors.color4,
            }}
            icon={"bell-outline"}
            color={colors.color3}
          />
        </TouchableOpacity>
      )}
    </>
  );
};

export default Header;

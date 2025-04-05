import { View, Text, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { defaultStyle, colors } from "../styles/styles";
import Header from "./Header";
import Heading from "./Heading";
import { StyleSheet } from "react-native";
import { Button, RadioButton } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { placeOrder } from "../redux/actions/otherAction";
import { useMessageAndErrorOther } from "../utils/hooks";
import Toast from "react-native-toast-message";

const Payment = ({ navigation, route }) => {
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.cart);

  // Check authentication status when component mounts
  useEffect(() => {
    if (!isAuthenticated || !user) {
      Toast.show({
        type: "error",
        text1: "Please login first",
      });
      navigation.navigate("login");
    }
  }, [isAuthenticated, user, navigation]);

  const redirectToLogin = () => {
    Toast.show({
      type: "error",
      text1: "Please login first",
    });
    navigation.navigate("login");
  };

  const codHandler = (paymentInfo) => {
    // Double check user and address information
    if (!user || !user.address || !user.city || !user.country || !user.pinCode) {
      Toast.show({
        type: "error",
        text1: "Please update your profile with shipping address",
      });
      navigation.navigate("profile");
      return;
    }

    const shippingInfo = {
      address: user.address,
      city: user.city,
      country: user.country,
      pinCode: user.pinCode,
    };

    const itemsPrice = route.params.itemsPrice;
    const shippingCharges = route.params.shippingCharges;
    const taxPrice = route.params.tax;
    const totalAmount = route.params.totalAmount;

    console.log("Placing order with auth status:", isAuthenticated);
    console.log("User data available:", !!user);

    dispatch(
      placeOrder(
        cartItems,
        shippingInfo,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingCharges,
        totalAmount,
        paymentInfo
      )
    ).then(() => {
      // Dispatch an action to clear the cart after placing the order
      dispatch({
        type: "clearCart",
      });
  
      // Redirect user to home screen
      navigation.navigate("home");
    });
  };

  const onlineHandler = () => {};

  const loading = useMessageAndErrorOther(
    dispatch,
    navigation,
    "profile",
    () => ({
      type: "clearCart",
    })
  );

  return (
    <View style={defaultStyle}>
      <Header back={true} showCartButton={false} />
      <Heading
        containerStyle={{ paddingTop: 70 }}
        text1="Payment"
        text2="Method"
      />
      <View style={styles.container}>
        <RadioButton.Group
          onValueChange={setPaymentMethod}
          value={paymentMethod}
        >
          <View style={styles.radioStyle}>
            <Text style={styles.radioStyleText}>Cash on Delivery</Text>
            <RadioButton color={colors.color1} value={"COD"} />
          </View>
        </RadioButton.Group>
      </View>
      <TouchableOpacity
        disabled={loading}
        onPress={
          !isAuthenticated
            ? redirectToLogin
            : paymentMethod === "COD"
            ? () => codHandler()
            : onlineHandler
        }
      >
        <Button
          loading={loading}
          disabled={loading}
          style={styles.btn}
          textColor={colors.color2}
          icon={
            paymentMethod === "COD" ? "check-circle" : "circle-multiple-outline"
          }
        >
          {paymentMethod === "COD" ? "Place Order" : "Pay"}
        </Button>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.color2,
    padding: 30,
    borderRadius: 10,
    marginVertical: 20,
    flex: 1,
    justifyContent: "center",
  },

  radioStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  radioStyleText: {
    fontWeight: "600",
    fontSize: 18,
    textTransform: "uppercase",
    color: colors.color3,
  },
  btn: {
    backgroundColor: colors.color3,
    borderRadius: 100,
    margin: 10,
    padding: 5,
  },
});

export default Payment;

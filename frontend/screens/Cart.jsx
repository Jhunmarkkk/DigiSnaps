import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React, { useEffect } from "react";
import { colors, defaultStyle } from "../styles/styles";
import Header from "../components/Header";
import Heading from "../components/Heading";
import { Button } from "react-native-paper";
import CartItem from "../components/CartItem";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { addToCart, removeFromCart } from "../redux/actions/cartActions";

const Cart = () => {
  const navigate = useNavigation();
  const dispatch = useDispatch();

  const { cartItems } = useSelector((state) => state.cart);

  useEffect(() => {
    if (cartItems.length > 0) {
      Toast.show({
        type: "info",
        text1: "Your cart has been restored",
        visibilityTime: 2000,
      });
    }
  }, []);

  const incrementHandler = (id, name, price, image, stock, quantity) => {
    const newQty = quantity + 1;
    if (stock <= quantity)
      return Toast.show({
        type: "error",
        text1: "Maximum value added",
      });
    dispatch(addToCart({
      product: id,
      name,
      price,
      image,
      stock,
      quantity: newQty,
    }));
  };

  const decrementHandler = (id, name, price, image, stock, quantity) => {
    const newQty = quantity - 1;

    if (1 >= quantity) return dispatch(removeFromCart(id));

    dispatch(addToCart({
      product: id,
      name,
      price,
      image,
      stock,
      quantity: newQty,
    }));
  };

  return (
    <View
      style={{
        ...defaultStyle,
        padding: 0,
      }}
    >
      <Header back={true} emptyCart={true} />
      <Heading
        text1="My"
        text2="Cart"
        containerStyle={{ paddingTop: 70, marginLeft: 35 }}
      />
      <View
        style={{
          paddingVertical: 20,
          flex: 1,
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {cartItems.length > 0 ? (
            cartItems.map((i, index) => (
              <CartItem
                navigate={navigate}
                key={i.product}
                id={i.product}
                name={i.name}
                stock={i.stock}
                amount={i.price}
                imgSrc={i.image}
                index={index}
                qty={i.quantity}
                incrementHandler={incrementHandler}
                decrementHandler={decrementHandler}
              />
            ))
          ) : (
            <Text style={{ textAlign: "center", fontSize: 18 }}>
              No Items Yet
            </Text>
          )}
        </ScrollView>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 35,
        }}
      >
        <Text>{cartItems.length} Items</Text>
        <Text>
          ₱
          {cartItems
            .reduce((prev, curr) => prev + curr.quantity * curr.price, 0)
            .toLocaleString("en-PH", {
              minimumFractionDigits: 2,
            })}
        </Text>
      </View>

      {cartItems.length > 0 ? (
        <TouchableOpacity onPress={() => navigate.navigate("confirmorder")}>
          <Button
            style={{
              backgroundColor: colors.color3,
              borderRadius: 100,
              padding: 5,
              margin: 30,
            }}
            icon="cart"
            textColor={colors.color2}
          >
            Checkout
          </Button>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => navigate.navigate("home")}>
          <Button
            style={{
              backgroundColor: colors.color3,
              borderRadius: 100,
              padding: 5,
              margin: 30,
            }}
            icon="home"
            textColor={colors.color2}
          >
            Continue Shopping
          </Button>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Cart;

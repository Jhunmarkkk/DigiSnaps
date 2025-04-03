import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { colors } from "../styles/styles";
import { Avatar } from "react-native-paper";
import { iconOptions } from "../screens/ProductDetails";

const CartItem = ({
  name,
  amount,
  qty,
  stock,
  index,
  imgSrc,
  id,
  decrementHandler,
  incrementHandler,
  navigate,
}) => {
  const formattedAmount = amount.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  });
  return (
    <View
      style={{
        flexDirection: "row",
        height: 100,
        marginVertical: 20,
      }}
    >
      <View
        style={{
          width: "40%",
          backgroundColor: colors.color3,
          borderTopRightRadius: 10,
          borderBottomRightRadius: 70,
        }}
      >
        <Image source={{ uri: imgSrc }} style={style.img} />
      </View>
      <View
        style={{
          width: "40%",
          paddingHorizontal: 25,
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            fontSize: 17,
          }}
          onPress={() => navigate.navigate("productdetails", { id })}
        >
          {name}
        </Text>

        <Text
          numberOfLines={1}
          style={{
            fontSize: 17,
            fontWeight: "900",
          }}
        >
          {formattedAmount}
        </Text>
      </View>
      <View style={style.qtyContainer}>
        <TouchableOpacity
          onPress={() => decrementHandler(id, name, amount, imgSrc, stock, qty)}
        >
          <Avatar.Icon icon={"minus"} {...iconOptions} />
        </TouchableOpacity>

        <Text style={style.qtyText}>{qty}</Text>

        <TouchableOpacity
          onPress={() => incrementHandler(id, name, amount, imgSrc, stock, qty)}
        >
          <Avatar.Icon icon={"plus"} {...iconOptions} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
const style = StyleSheet.create({
  img: {
    alignItems: "center",
    width: "50%",
    height: 80,
    justifyContent: "space-between",
    alignSelf: "center",
  },
  qtyText: {
    backgroundColor: colors.color4,
    height: 25,
    width: 25,
    textAlignVertical: "center",
    textAlign: "center",
    borderWidth: 1,
    borderRadius: 5,
    borderColor: colors.color5,
  },
  qtyContainer: {
    flexDirection: "row", // Arrange items horizontally
    alignItems: "center",
    justifyContent: "space-between",
    width: "10%", // Adjust width as needed
    alignSelf: "left",
    marginHorizontal: -15,
  },
});
export default CartItem;

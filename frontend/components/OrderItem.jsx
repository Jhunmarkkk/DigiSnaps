import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { colors } from "../styles/styles";
import { Button } from "react-native-paper";

const OrderItem = ({
  id,
  price,
  address,
  orderedOn,
  status,
  paymentMethod,
  updateHandler,
  admin = false,
  loading,
  i = 0,
  onPress,
}) => {
  
  const OrderContent = () => (
    <>
      <Text
        style={{
          ...styles.text,
          backgroundColor: status === "Preparing" ? "gray" : status === "Shipped" ? "gold" : status === "Delivered" ? "lime" : "black",

        }}
      >
        ID - #{id}
      </Text>

      <TextBox title={"Address"} value={address} i={i} />
      <TextBox title={"Ordered On"} value={orderedOn} i={i} />
      <TextBox title={"Price"} value={price} i={i} />
      <TextBox title={"Status"} value={status} i={i} />
      <TextBox title={"Payment Method"} value={paymentMethod} i={i} />

      {admin && (
        <Button
          icon={"update"}
          mode={"outlined"}
          textColor={colors.color2}
          style={{
            width: 120,
            alignSelf: "center",
            marginTop: 10,
          }}
          onPress={() => updateHandler(id, status)}
          loading={loading}
          disabled={loading || status === "Delivered"}
        >
          Update
        </Button>
      )}
    </>
  );
  
  // If it's a regular user and onPress is provided, make the item touchable
  if (!admin && onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={{
          ...styles.container,
          backgroundColor: colors.color3,
        }}
      >
        <OrderContent />
      </TouchableOpacity>
    );
  }
  
  // For admin or when no onPress handler is provided
  return (
    <View
      style={{
        ...styles.container,
        backgroundColor: colors.color3,
      }}
    >
      <OrderContent />
    </View>
  );
};

const TextBox = ({ title, value, i }) => (
  <Text
    style={{
      marginVertical: 6,
      color: colors.color2,
    }}
  >
    <Text style={{ fontWeight: "900" }}>{title} -</Text>
    {title === "Price" ? "₱" : ""}
    {value}
  </Text>
);
const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
    elevation: 5,
  },
  text: {
    color: colors.color2,
    fontSize: 16,
    fontWeight: "900",
    marginHorizontal: -20,
    marginTop: -20,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
});
export default OrderItem;

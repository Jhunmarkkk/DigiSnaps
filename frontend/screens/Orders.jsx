import { View, Text, ScrollView } from "react-native";
import React from "react";
import { colors, defaultStyle, formHeading } from "../styles/styles";
import Header from "../components/Header";
import Loader from "../components/Loader";
import { Headline, Button } from "react-native-paper";
import OrderItem from "../components/OrderItem";
import { useIsFocused } from "@react-navigation/native";
import { useGetOrders } from "../utils/hooks";
import { sendLocalNotification } from "../utils/notifications";
import Toast from "react-native-toast-message";


const Orders = ({ navigation }) => {
  const isFocused = useIsFocused();
  const { loading, orders } = useGetOrders(isFocused);

  const viewOrderDetails = (id) => {
    navigation.navigate("orderdetails", { id });
  };

  const testNotification = () => {
    // Either use a real order ID from the user's orders, or generate a test one
    const orderId = orders.length > 0 ? orders[0]._id : Math.random().toString(36).substring(2, 8);
    const shortOrderId = orderId.slice(-6);
    
    // Send a test notification that navigates to order details
    sendLocalNotification(
      "Order Status Updated",
      `Your order #${shortOrderId} status has been updated!`,
      { 
        screen: 'orders',
        orderId: orderId,
        status: 'Shipped'
      }
    );
    
    Toast.show({
      type: "info",
      text1: "Test Notification",
      text2: "A notification will appear in a few seconds"
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.color2 }}>
      <Header back={true} showCartButton={false}/>
      <View style={{ marginBottom: 20, paddingTop: 70 }}>
        <Text style={formHeading}>My Orders</Text>
      </View>

      {/* Test Notification Button */}
      <Button 
        mode="contained" 
        onPress={testNotification}
        style={{
          marginHorizontal: 20,
          marginBottom: 10,
          backgroundColor: colors.color1
        }}
      >
        Test Notification
      </Button>

      {loading ? (
        <Loader />
      ) : (
        <View style={{ padding: 10, flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {orders.length > 0 ? (
              orders.map((item, index) => (
                <OrderItem
                  key={item._id}
                  id={item._id}
                  i={index}
                  price={item.totalAmount}
                  status={item.orderStatus}
                  paymentMethod={item.paymentMethod}
                  orderedOn={item.createdAt.split("T")[0]}
                  address={`${item.shippingInfo.address}, ${item.shippingInfo.city}, ${item.shippingInfo.country}, ${item.shippingInfo.pinCode}`}
                  onPress={() => viewOrderDetails(item._id)}
                />
              ))
            ) : (
              <Headline style={{ textAlign: "center" }}>
                No Orders Yet!
              </Headline>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default Orders;
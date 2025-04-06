import { View, Text, ScrollView } from "react-native";
import React from "react";
import { colors, defaultStyle, formHeading } from "../../styles/styles";
import Header from "../../components/Header";
import Loader from "../../components/Loader";
import OrderItem from "../../components/OrderItem";
import { useGetOrders, useMessageAndErrorOther } from "../../utils/hooks";
import { useIsFocused } from "@react-navigation/native";
import { Headline, Button } from "react-native-paper";
import { useDispatch } from "react-redux";
import { processOrder } from "../../redux/actions/otherAction";
import { scheduleTestNotification, sendLocalNotification } from "../../utils/notifications";
import Toast from "react-native-toast-message";

const AdminOrders = ({ navigation }) => {
  const isFocused = useIsFocused();
  const dispatch = useDispatch();

  const { loading, orders } = useGetOrders(isFocused, true);

  const processOrderLoading = useMessageAndErrorOther(
    dispatch,
    navigation,
    "admindashboard"
  );

  const updateHandler = (id, status) => {
    // Determine what the next status will be
    const nextStatus = status === "Preparing" ? "Shipped" : "Delivered";
    
    // Format a readable order ID (last 6 characters)
    const shortOrderId = id.slice(-6);
    
    // Show info toast about the update
    Toast.show({
      type: "info",
      text1: "Updating Order Status",
      text2: `Changing status from ${status} to ${nextStatus}`
    });
    
    // Process the order
    dispatch(processOrder(id));
    
    // Send a local notification immediately for testing
    sendLocalNotification(
      "Order Status Updated",
      `Order #${shortOrderId} status changed to ${nextStatus}`,
      {
        screen: 'orders',
        orderId: id,
        status: nextStatus
      }
    );
  };

  const testNotification = () => {
    // Prepare a test order ID
    const testOrderId = Math.random().toString(36).substring(2, 8);
    
    // Send a test notification that navigates to order details
    sendLocalNotification(
      "Order Status Updated",
      `Your order #${testOrderId} has been shipped!`,
      { 
        screen: 'orders',
        orderId: testOrderId,
        status: 'Shipped'
      }
    );
    
    Toast.show({
      type: "info",
      text1: "Test Notification",
      text2: "A test notification will appear in a few seconds"
    });
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.color2,
      }}
    >
      <Header back={true} showCartButton={false} />

      {/* Heading */}
      <View style={{ marginBottom: 20, paddingTop: 70 }}>
        <Text style={formHeading}>All Orders</Text>
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
        <View
          style={{
            padding: 10,
            flex: 1,
          }}
        >
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
                  address={`${item.shippingInfo.address}, ${item.shippingInfo.city}, ${item.shippingInfo.country} ${item.shippingInfo.pinCode}`}
                  admin={true}
                  updateHandler={updateHandler}
                  loading={processOrderLoading}
                />
              ))
            ) : (
              <Headline style={{ textAlign: "center" }}>No Orders Yet</Headline>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default AdminOrders;

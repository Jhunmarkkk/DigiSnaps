import { View, Text, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { colors, defaultStyle, formHeading } from "../styles/styles";
import Header from "../components/Header";
import Loader from "../components/Loader";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "react-native-paper";
import axios from "axios";
import { server } from "../redux/store";
import { getToken } from "../utils/secureStore";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import OrderItem from "../components/OrderItem";

const OrderDetails = ({ route, navigation }) => {
  const { id } = route.params;
  const dispatch = useDispatch();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        
        // Get token from SecureStore
        const token = await getToken();
        
        if (!token) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Please login to view order details"
          });
          navigation.navigate("login");
          return;
        }

        // Fetch order details from API
        const { data } = await axios.get(
          `${server}/order/single/${id}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`
            },
            withCredentials: false
          }
        );
        
        console.log("Order details fetched:", data.order);
        setOrder(data.order);
      } catch (error) {
        console.error("Error fetching order details:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response?.data?.message || "Failed to fetch order details"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, navigation]);

  return (
    <View style={{
      ...defaultStyle,
      backgroundColor: colors.color5,
    }}>
      <Header back={true} />

      {/* Heading */}
      <View style={{ marginBottom: 20, paddingTop: 70 }}>
        <Text style={formHeading}>Order Details</Text>
      </View>

      {loading ? (
        <Loader />
      ) : order ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ padding: 20 }}>
            {/* Order ID */}
            <Text style={{
              fontSize: 16,
              fontWeight: "900",
              marginBottom: 10
            }}>
              Order ID: #{order._id}
            </Text>
            
            {/* Order Status */}
            <Text style={{
              fontSize: 16,
              fontWeight: "900",
              marginBottom: 10,
              color: order.orderStatus === "Delivered" 
                ? "green" 
                : order.orderStatus === "Shipped" 
                  ? "orange" 
                  : "red"
            }}>
              Status: {order.orderStatus}
            </Text>
            
            {/* Order Date */}
            <Text style={{
              fontSize: 16,
              marginBottom: 10
            }}>
              Ordered on: {new Date(order.createdAt).toLocaleDateString()}
            </Text>
            
            {/* Payment Info */}
            <Text style={{
              fontSize: 16,
              marginBottom: 10
            }}>
              Payment: {order.paymentMethod}
            </Text>
            
            {/* Shipping Information */}
            <View style={{
              backgroundColor: colors.color3,
              padding: 15,
              borderRadius: 10,
              marginVertical: 10
            }}>
              <Text style={{ color: colors.color2, fontWeight: "900", fontSize: 16, marginBottom: 5 }}>
                Shipping Information
              </Text>
              <Text style={{ color: colors.color2 }}>
                Address: {order.shippingInfo.address}
              </Text>
              <Text style={{ color: colors.color2 }}>
                City: {order.shippingInfo.city}
              </Text>
              <Text style={{ color: colors.color2 }}>
                Country: {order.shippingInfo.country}
              </Text>
              <Text style={{ color: colors.color2 }}>
                Pin Code: {order.shippingInfo.pinCode}
              </Text>
            </View>
            
            {/* Order Items */}
            <Text style={{
              fontSize: 16,
              fontWeight: "900",
              marginVertical: 10
            }}>
              Order Items
            </Text>
            
            {order.orderItems.map((item) => (
              <View key={item.product} style={{
                backgroundColor: colors.color3,
                padding: 15,
                borderRadius: 10,
                marginVertical: 5,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <View style={{ width: "60%" }}>
                  <Text style={{ color: colors.color2, fontWeight: "900" }} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={{ color: colors.color2 }}>
                    ₱{item.price} x {item.quantity} = ₱{item.price * item.quantity}
                  </Text>
                </View>
                
                <View>
                  <Text style={{ color: colors.color2 }}>
                    Qty: {item.quantity}
                  </Text>
                </View>
              </View>
            ))}
            
            {/* Price Info */}
            <View style={{
              backgroundColor: colors.color3,
              padding: 15,
              borderRadius: 10,
              marginVertical: 10
            }}>
              <Text style={{ color: colors.color2, fontWeight: "900", fontSize: 16, marginBottom: 5 }}>
                Price Details
              </Text>
              <View style={{ 
                flexDirection: "row", 
                justifyContent: "space-between",
                marginBottom: 5
              }}>
                <Text style={{ color: colors.color2 }}>Subtotal</Text>
                <Text style={{ color: colors.color2 }}>₱{order.itemsPrice}</Text>
              </View>
              <View style={{ 
                flexDirection: "row", 
                justifyContent: "space-between",
                marginBottom: 5
              }}>
                <Text style={{ color: colors.color2 }}>Shipping</Text>
                <Text style={{ color: colors.color2 }}>₱{order.shippingCharges}</Text>
              </View>
              <View style={{ 
                flexDirection: "row", 
                justifyContent: "space-between",
                marginBottom: 5
              }}>
                <Text style={{ color: colors.color2 }}>Tax</Text>
                <Text style={{ color: colors.color2 }}>₱{order.taxPrice}</Text>
              </View>
              <View style={{ 
                flexDirection: "row", 
                justifyContent: "space-between",
                borderTopWidth: 1,
                borderTopColor: colors.color2,
                paddingTop: 5
              }}>
                <Text style={{ color: colors.color2, fontWeight: "900" }}>Total</Text>
                <Text style={{ color: colors.color2, fontWeight: "900" }}>₱{order.totalAmount}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
          <Text>Order not found</Text>
          <Button 
            mode="contained" 
            style={{ marginTop: 20, backgroundColor: colors.color1 }}
            onPress={() => navigation.navigate("orders")}
          >
            View All Orders
          </Button>
        </View>
      )}
    </View>
  );
};

export default OrderDetails; 
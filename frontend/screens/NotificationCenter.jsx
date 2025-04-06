import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { colors, defaultStyle, formHeading } from "../styles/styles";
import Header from "../components/Header";
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "react-native-paper";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";
import Loader from "../components/Loader";

// Maximum number of notifications to store
const MAX_NOTIFICATIONS = 50;

// Notification storage key
const NOTIFICATION_STORAGE_KEY = "@digisnaps:notifications";

const NotificationCenter = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  const dispatch = useDispatch();

  // Load notifications from AsyncStorage when screen focuses
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const storedNotifications = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
        
        if (storedNotifications) {
          setNotifications(JSON.parse(storedNotifications));
        }
      } catch (error) {
        console.error("Error loading notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [isFocused]);

  // Handler to view a notification
  const handleNotificationPress = (item) => {
    // Mark as read
    markAsRead(item.id);

    console.log("Navigating from notification:", item.data);

    // Navigate based on notification type
    if (item.data?.screen === "promotiondetails" && item.data?.productId) {
      // Navigate to promotion details view with discount information
      navigation.navigate("promotiondetails", {
        id: item.data.productId,
        discount: item.data.discount || 0
      });
      
      // Show toast about the promotion
      Toast.show({
        type: 'success',
        text1: 'Special Offer',
        text2: `${item.data.discount}% discount on this product!`,
        visibilityTime: 4000,
        position: 'top'
      });
    } else if (item.data?.screen === "orders" && item.data?.orderId) {
      // Navigate to order details
      navigation.navigate("orderdetails", {
        id: item.data.orderId
      });
      
      // Show toast about the order
      Toast.show({
        type: 'info',
        text1: 'Order Details',
        text2: `Viewing details for order #${item.data.orderId.slice(-6)}`,
        visibilityTime: 4000,
        position: 'top'
      });
    }
  };

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      const updatedNotifications = notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      );
      
      setNotifications(updatedNotifications);
      await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      await AsyncStorage.removeItem(NOTIFICATION_STORAGE_KEY);
      setNotifications([]);
      Toast.show({
        type: "success",
        text1: "All notifications cleared"
      });
    } catch (error) {
      console.error("Error clearing notifications:", error);
      Toast.show({
        type: "error",
        text1: "Failed to clear notifications"
      });
    }
  };

  // Render notification item
  const renderNotificationItem = ({ item }) => {
    // Determine if this is a promotion notification
    const isPromotion = item.data?.screen === "promotiondetails";
    
    return (
      <TouchableOpacity 
        style={[
          styles.notificationItem, 
          item.read ? styles.readNotification : styles.unreadNotification
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        {/* Notification Icon */}
        <View style={styles.iconContainer}>
          {isPromotion ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{item.data?.discount || 0}%</Text>
            </View>
          ) : (
            <View style={styles.orderBadge}>
              <Text style={styles.orderText}>📦</Text>
            </View>
          )}
        </View>
        
        {/* Notification Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {item.body}
          </Text>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={defaultStyle}>
      <Header back={true} />

      <View style={{ marginBottom: 20, paddingTop: 70 }}>
        <Text style={formHeading}>Notifications</Text>
      </View>

      {loading ? (
        <Loader />
      ) : (
        <>
          {notifications.length > 0 ? (
            <>
              <FlatList
                data={notifications}
                renderItem={renderNotificationItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 80 }}
              />
              
              <Button 
                mode="outlined" 
                style={styles.clearButton}
                onPress={clearAllNotifications}
              >
                Clear All Notifications
              </Button>
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No notifications yet</Text>
              <Text style={styles.emptySubtext}>
                Promotions and order updates will appear here
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  notificationItem: {
    flexDirection: "row",
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    backgroundColor: colors.color2,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftColor: colors.color1,
    backgroundColor: colors.color5,
  },
  readNotification: {
    borderLeftColor: "#ccc",
    opacity: 0.8,
  },
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  discountBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.color1,
    justifyContent: "center",
    alignItems: "center",
  },
  discountText: {
    color: colors.color2,
    fontWeight: "bold",
    fontSize: 14,
  },
  orderBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.color3,
    justifyContent: "center",
    alignItems: "center",
  },
  orderText: {
    fontSize: 20,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  body: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  clearButton: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderColor: colors.color1,
  },
});

export default NotificationCenter; 
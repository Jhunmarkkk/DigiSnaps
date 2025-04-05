import { sendPushNotificationToUser } from "../utils/sendPushNotification.js";

// Add after creating a new order (look for placeOrder function)
// After this line: "await newOrder.save();"
// Add:
  try {
    // Send order confirmation notification to the user
    await sendPushNotificationToUser(req.user._id, {
      title: "Order Placed Successfully!",
      body: `Your order #${newOrder._id} has been placed successfully.`,
      data: { 
        screen: 'orders',
        orderId: newOrder._id.toString()
      }
    });
  } catch (error) {
    console.error("Error sending order notification:", error);
    // Continue with order processing even if notification fails
  }

// Add after updating an order (look for processOrder function)
// After this line: "order.save();"
// Add:
  try {
    // Send order status notification to the user
    await sendPushNotificationToUser(order.user, {
      title: "Order Status Updated",
      body: `Your order #${order._id} status has been changed to ${order.orderStatus}.`,
      data: { 
        screen: 'orders',
        orderId: order._id.toString()
      }
    });
  } catch (error) {
    console.error("Error sending order status notification:", error);
    // Continue with order processing even if notification fails
  } 
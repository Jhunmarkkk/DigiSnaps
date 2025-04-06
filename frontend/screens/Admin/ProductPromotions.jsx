import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import React, { useState, useEffect } from "react";
import { colors, defaultStyle, formHeading } from "../../styles/styles";
import Header from "../../components/Header";
import Loader from "../../components/Loader";
import { Button, TextInput } from "react-native-paper";
import { useDispatch } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import { useAdminProducts } from "../../utils/hooks";
import { getAdminProducts } from "../../redux/actions/productAction";
import { sendProductPromotion } from "../../utils/notifications";
import Toast from "react-native-toast-message";

const ProductPromotions = ({ navigation }) => {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  // Load products list
  const { loading, products } = useAdminProducts(dispatch, isFocused);
  
  // State for selected product and discount
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [discount, setDiscount] = useState("10");
  const [isSending, setIsSending] = useState(false);

  // Preview the promotion in the promotiondetails screen
  const previewPromotion = () => {
    if (!selectedProduct) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please select a product first"
      });
      return;
    }

    // Ensure discount is a valid number
    const discountValue = parseInt(discount);
    if (!discount || isNaN(discountValue) || discountValue <= 0 || discountValue > 99) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter a valid discount between 1-99%"
      });
      return;
    }

    // Navigate to the promotion details screen for preview
    navigation.navigate("promotiondetails", {
      id: selectedProduct._id,
      discount: discountValue
    });
  };

  // Function to send a promotion notification
  const sendPromotion = async () => {
    if (!selectedProduct) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please select a product first"
      });
      return;
    }

    // Ensure discount is a valid number
    const discountValue = parseInt(discount);
    if (!discount || isNaN(discountValue) || discountValue <= 0 || discountValue > 99) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter a valid discount between 1-99%"
      });
      return;
    }

    try {
      setIsSending(true);
      
      // Check that the product has all required data
      if (!selectedProduct._id || !selectedProduct.name) {
        throw new Error("Selected product is missing required data");
      }
      
      // Ensure there's at least one image
      const imageUrl = selectedProduct.images && selectedProduct.images.length > 0 
        ? selectedProduct.images[0].url 
        : null;
      
      if (!imageUrl) {
        console.warn("Product has no image, sending promotion without image");
      }
      
      // Send the promotion notification
      const success = await sendProductPromotion(
        selectedProduct._id,
        selectedProduct.name,
        discountValue,
        imageUrl
      );
      
      if (!success) {
        throw new Error("Failed to send notification");
      }
      
      // Show success message
      Toast.show({
        type: "success",
        text1: "Promotion Sent",
        text2: `${discountValue}% discount on ${selectedProduct.name}`
      });
      
      // Reset selection
      setSelectedProduct(null);
      setDiscount("10");
    } catch (error) {
      console.error("Error sending promotion:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to send promotion notification"
      });
    } finally {
      setIsSending(false);
    }
  };

  // Confirm promotion before sending
  const confirmPromotion = () => {
    if (!selectedProduct) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please select a product first"
      });
      return;
    }

    Alert.alert(
      "Confirm Promotion",
      `Send a ${discount}% discount notification for ${selectedProduct.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Send",
          onPress: sendPromotion
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Header back={true} showCartButton={false} />
      
      <View style={{ paddingTop: 70, marginBottom: 20, paddingHorizontal: 30 }}>
        <Text style={formHeading}>Product Promotions</Text>
      </View>
      
      {loading ? (
        <Loader />
      ) : (
        <ScrollView style={styles.container}>
          {/* Discount input */}
          <View style={styles.discountContainer}>
            <Text style={styles.sectionTitle}>Set Discount Percentage</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              maxLength={2}
              value={discount}
              onChangeText={setDiscount}
              mode="outlined"
              activeOutlineColor={colors.color1}
              placeholder="Enter discount %"
            />
          </View>

          {/* Product selection */}
          <Text style={styles.sectionTitle}>Select a Product</Text>
          
          <ScrollView 
            style={styles.productsContainer}
            showsVerticalScrollIndicator={false}
          >
            {products.map((product) => (
              <TouchableOpacity
                key={product._id}
                style={[
                  styles.productItem,
                  selectedProduct?._id === product._id && styles.selectedProduct
                ]}
                onPress={() => setSelectedProduct(product)}
              >
                <Image
                  source={{ uri: product.images[0].url }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={styles.productPrice}>
                    ₱{product.price.toLocaleString()}
                  </Text>
                  <Text style={styles.productStock}>
                    Stock: {product.stock}
                  </Text>
                </View>
                {selectedProduct?._id === product._id && (
                  <View style={styles.checkmark}>
                    <Text style={{fontSize: 18, color: colors.color2}}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Send button */}
          <Button
            mode="contained"
            style={styles.sendButton}
            loading={isSending}
            disabled={isSending || !selectedProduct}
            onPress={confirmPromotion}
          >
            Send Promotion Notification
          </Button>
          
          {/* Preview button */}
          <Button
            mode="outlined"
            style={styles.previewButton}
            disabled={!selectedProduct}
            onPress={previewPromotion}
          >
            Preview Promotion
          </Button>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: colors.color2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.color3,
  },
  discountContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: colors.color2,
    marginBottom: 15,
  },
  productsContainer: {
    marginBottom: 20,
    maxHeight: 400,
  },
  productItem: {
    flexDirection: "row",
    padding: 10,
    marginBottom: 10,
    backgroundColor: colors.color5,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedProduct: {
    borderColor: colors.color1,
    borderWidth: 2,
    backgroundColor: colors.color6,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 5,
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  productPrice: {
    color: colors.color3,
    fontWeight: "700",
    marginBottom: 5,
  },
  productStock: {
    color: "gray",
    fontSize: 12,
  },
  checkmark: {
    width: 25,
    height: 25,
    borderRadius: 15,
    backgroundColor: colors.color1,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButton: {
    marginTop: 10,
    marginBottom: 30,
    backgroundColor: colors.color1,
    padding: 5,
  },
  previewButton: {
    marginTop: 10,
    marginBottom: 30,
    backgroundColor: colors.color2,
    padding: 5,
    borderColor: colors.color1,
    borderWidth: 1,
  },
});

export default ProductPromotions; 
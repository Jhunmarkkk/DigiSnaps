import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { colors, defaultStyle, formHeading } from "../styles/styles";
import Header from "../components/Header";
import Loader from "../components/Loader";
import { useDispatch } from "react-redux";
import { Button } from "react-native-paper";
import axios from "axios";
import { server } from "../redux/store";
import Toast from "react-native-toast-message";
import { addToCart } from "../redux/actions/cartActions";
import { useSelector } from "react-redux";

const PromotionDetails = ({ route, navigation }) => {
  const { id, discount } = route.params;
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const { user } = useSelector((state) => state.user);

  // Calculate discounted price
  const discountedPrice = product?.price && discount
    ? Math.round(product.price - (product.price * discount / 100)) 
    : product?.price || null;

  // Get product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        
        // Log the parameters for debugging
        console.log('Loading promotion details with params:', {id, discount});
        
        if (!id) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Product ID is missing",
          });
          navigation.goBack();
          return;
        }
        
        // Fetch product details from API
        const { data } = await axios.get(
          `${server}/product/single/${id}`
        );
        
        console.log("Product details fetched for promotion:", data.product.name);
        setProduct(data.product);
      } catch (error) {
        console.error("Error fetching product details:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response?.data?.message || "Failed to fetch product details"
        });
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, navigation]);

  const incrementQty = () => {
    if (product?.stock <= quantity) {
      return Toast.show({
        type: "error",
        text1: "Maximum Value Added",
      });
    }
    setQuantity((prev) => prev + 1);
  };

  const decrementQty = () => {
    if (quantity <= 1) return;
    setQuantity((prev) => prev - 1);
  };

  const addToCartHandler = () => {
    if (!user) {
      navigation.navigate("login");
      return;
    }

    if (!product || !product.name || !discountedPrice) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Product details not fully loaded"
      });
      return;
    }
    
    if (product.stock === 0) {
      return Toast.show({
        type: "error",
        text1: "Out Of Stock",
      });
    }
    
    // Ensure we have a valid image
    const imageUrl = product.images && product.images.length > 0 
      ? product.images[0].url 
      : null;
    
    dispatch(addToCart({
      product: id,
      name: product.name,
      price: discountedPrice,
      image: imageUrl,
      stock: product.stock,
      quantity,
    }));
    
    Toast.show({
      type: "success",
      text1: "Added To Cart",
      text2: `With ${discount}% discount applied!`
    });
    
    // Navigate to cart after adding
    navigation.navigate("cart");
  };

  return (
    <View style={{
      ...defaultStyle,
      backgroundColor: colors.color5,
    }}>
      <Header back={true} />

      {/* Promotion Banner */}
      <View 
        style={{ 
          backgroundColor: colors.color1, 
          padding: 10, 
          alignItems: "center",
          marginTop: 60,
          marginHorizontal: -20
        }}
      >
        <Text 
          style={{ 
            color: colors.color2, 
            fontWeight: "bold", 
            fontSize: 18 
          }}
        >
          🔥 SPECIAL OFFER: {discount}% OFF 🔥
        </Text>
      </View>

      {/* Heading */}
      <View style={{ marginBottom: 10, marginTop: 10 }}>
        <Text style={formHeading}>Promotion Details</Text>
      </View>

      {loading ? (
        <Loader />
      ) : product ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ padding: 10 }}>
            {/* Product Image */}
            {product.images && product.images.length > 0 && (
              <Image 
                source={{ uri: product.images[0].url }} 
                style={{ 
                  width: "100%", 
                  height: 200, 
                  resizeMode: "contain",
                  marginBottom: 20,
                  borderRadius: 10
                }} 
              />
            )}
            
            {/* Product Name */}
            <Text style={{
              fontSize: 22,
              fontWeight: "700",
              marginBottom: 10
            }}>
              {product.name}
            </Text>
            
            {/* Price Information */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 15 }}>
              <Text style={{
                fontSize: 18,
                fontWeight: "700",
                textDecorationLine: "line-through",
                color: "#777",
                marginRight: 10
              }}>
                ₱{product.price?.toLocaleString() || "N/A"}
              </Text>
              <Text style={{
                fontSize: 22,
                fontWeight: "900",
                color: colors.color1
              }}>
                ₱{discountedPrice?.toLocaleString() || "N/A"}
              </Text>
            </View>
            
            {/* Stock Information */}
            <Text style={{
              fontSize: 16,
              marginBottom: 10,
              color: product.stock > 0 ? "green" : "red",
              fontWeight: "700"
            }}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
            </Text>
            
            {/* Description */}
            <View style={{
              backgroundColor: colors.color2,
              padding: 15,
              borderRadius: 10,
              marginVertical: 15
            }}>
              <Text style={{ fontWeight: "700", fontSize: 16, marginBottom: 5 }}>
                Product Description
              </Text>
              <Text style={{ lineHeight: 20 }}>
                {product.description}
              </Text>
            </View>
            
            {/* Quantity */}
            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: colors.color3,
              padding: 15,
              borderRadius: 10,
              marginVertical: 15
            }}>
              <Text style={{ color: colors.color2, fontWeight: "700" }}>
                Quantity:
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity 
                  onPress={decrementQty}
                  style={{
                    backgroundColor: colors.color1,
                    height: 30,
                    width: 30,
                    borderRadius: 15,
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Text style={{ color: colors.color2, fontSize: 20, fontWeight: "bold" }}>-</Text>
                </TouchableOpacity>
                <Text style={{ marginHorizontal: 15, fontSize: 18 }}>{quantity}</Text>
                <TouchableOpacity 
                  onPress={incrementQty}
                  style={{
                    backgroundColor: colors.color1,
                    height: 30,
                    width: 30,
                    borderRadius: 15,
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Text style={{ color: colors.color2, fontSize: 20, fontWeight: "bold" }}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Limited Time Offer */}
            <View style={{
              backgroundColor: "#FFF3CD",
              padding: 15,
              borderRadius: 10,
              marginVertical: 15,
              borderWidth: 1,
              borderColor: "#FFE69C"
            }}>
              <Text style={{ color: "#856404", fontWeight: "700", textAlign: "center" }}>
                Limited Time Offer - Get it before the promotion ends!
              </Text>
            </View>
            
            {/* Add to Cart Button */}
            <Button 
              mode="contained" 
              style={{ 
                backgroundColor: colors.color1, 
                paddingVertical: 5,
                marginTop: 10
              }}
              disabled={product.stock === 0}
              onPress={addToCartHandler}
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart with Discount"}
            </Button>
            
            {/* View Regular Product Button */}
            <Button 
              mode="outlined" 
              style={{ 
                borderColor: colors.color1, 
                marginTop: 15,
                marginBottom: 20
              }}
              onPress={() => navigation.navigate("productdetails", { id })}
            >
              View Regular Product Page
            </Button>
          </View>
        </ScrollView>
      ) : (
        <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
          <Text>Product not found</Text>
          <Button 
            mode="contained" 
            style={{ marginTop: 20, backgroundColor: colors.color1 }}
            onPress={() => navigation.goBack()}
          >
            Go Back
          </Button>
        </View>
      )}
    </View>
  );
};

export default PromotionDetails; 
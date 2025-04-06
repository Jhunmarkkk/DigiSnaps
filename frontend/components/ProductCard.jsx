import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";
import { colors } from "../styles/styles";
import { Button, ActivityIndicator } from "react-native-paper";

const ProductCard = ({
  stock,
  name,
  price,
  image,
  id,
  addToCartHandler,
  i,
  navigate,
  discount = 0,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Calculate discounted price if there's a promotion
  const discountedPrice = discount > 0 
    ? Math.round(price - (price * discount / 100)) 
    : null;

  // Handle navigation based on whether there's a promotion
  const handlePress = () => {
    if (discount > 0) {
      navigate.navigate("promotiondetails", { 
        id,
        discount 
      });
    } else {
      navigate.navigate("productdetails", { id });
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handlePress}
    >
      <View
        style={{
          elevation: 5,
          width: 150,
          alignItems: "center",
          justifyContent: "space-between",
          margin: 5,
          marginBottom: 50,
          borderRadius: 10,
          height: 250,
          backgroundColor: colors.color2,
          position: "relative",
        }}
      >
        {/* Discount badge */}
        {discount > 0 && (
          <View
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              backgroundColor: colors.color1,
              zIndex: 10,
              padding: 5,
              borderTopRightRadius: 10,
              borderBottomLeftRadius: 10,
            }}
          >
            <Text
              style={{
                color: colors.color2,
                fontWeight: "800",
                fontSize: 12,
              }}
            >
              {discount}% OFF
            </Text>
          </View>
        )}

        {isLoading && (
          <View style={{
            position: 'absolute',
            left: 25,
            top: 0,
            width: 100, 
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <ActivityIndicator size="large" color={colors.color1} />
          </View>
        )}
        
        {hasError && (
          <View style={{
            position: 'absolute',
            left: 25,
            top: 0,
            width: 100, 
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Text style={{color: colors.color3}}>Image not available</Text>
          </View>
        )}
        
        <Image
          source={{
            uri: image,
          }}
          style={{
            width: 100,
            height: "100%",
            resizeMode: "contain",
            position: "absolute",
            left: 25,
            top: 0,
            opacity: hasError ? 0 : 1
          }}
          progressiveRenderingEnabled={true}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={(e) => {
            console.log("Image load error:", e.nativeEvent.error, image);
            setIsLoading(false);
            setHasError(true);
          }}
        />

        <View
          style={{
            flexDirection: "row",
            padding: 20,
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* Price */}
          <Text
            numberOfLines={2}
            style={{
              color: colors.color3,
              fontSize: 15,
              fontWeight: 600,
              width: "60%",
            }}
          >
            {name}
          </Text>

          {discount > 0 ? (
            <View>
              <Text
                style={{
                  color: "#777",
                  fontSize: 12,
                  fontWeight: 600,
                  textDecorationLine: "line-through",
                }}
              >
                ₱{price}
              </Text>
              <Text
                style={{
                  color: colors.color1,
                  fontSize: 15,
                  fontWeight: 800,
                }}
              >
                ₱{discountedPrice}
              </Text>
            </View>
          ) : (
            <Text
              numberOfLines={2}
              style={{
                color: colors.color3,
                fontSize: 15,
                fontWeight: 800,
              }}
            >
              ₱{price}
            </Text>
          )}
        </View>

        {stock > 0 ? (
          <TouchableOpacity
            style={{
              backgroundColor: colors.color3,
              borderRadius: 0,
              paddingVertical: 10,
              borderBottomRightRadius: 10,
              borderBottomLeftRadius: 10,
              width: "100%",
            }}
            onPress={() => 
              addToCartHandler(
                id, 
                name, 
                discount > 0 ? discountedPrice : price, 
                image, 
                stock
              )
            }
          >
            <Button textColor={colors.color2}>
              {discount > 0 ? "Add With Discount" : "Add To Cart"}
            </Button>
          </TouchableOpacity>
        ) : (
          <View
            style={{
              backgroundColor: colors.color3,
              borderRadius: 0,
              paddingVertical: 10,
              borderBottomRightRadius: 10,
              borderBottomLeftRadius: 10,
              width: "100%",
              opacity: 0.5, 
            }}
          >
            <Button disabled textColor={colors.color2}>
              Out Of Stock
            </Button>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;

import {
  View,
  Text,
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  SectionList,
  SafeAreaView,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { defaultStyle, colors } from "../styles/styles";
import Header from "../components/Header";
import Review from "../components/Review";
import Carousel from "react-native-snap-carousel";
import { ActivityIndicator, Avatar, Button } from "react-native-paper";
import { AirbnbRating } from "react-native-ratings";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { getProductDetails } from "../redux/actions/productAction";
import {
  getAllReviews,
  getProductRatings,
} from "../redux/actions/reviewAction";
import { deleteReview } from "../redux/actions/deleteReview";
import { addToCart } from "../redux/actions/cartActions";

const SLIDER_WIDTH = Dimensions.get("window").width;
const ITEM_WIDTH = SLIDER_WIDTH;

export const iconOptions = {
  size: 20,
  style: {
    borderRadius: 5,
    backgroundColor: colors.color5,
    height: 25,
    width: 25,
  },
};

const ProductDetails = ({ route: { params } }) => {
  const {
    product: { name, price, stock, description, images },
  } = useSelector((state) => state.product);

  const isCarousel = useRef(null);
  const [quantity, setQuantity] = useState(1);
  const [promoDiscount, setPromoDiscount] = useState(params?.discount || 0);
  const isOutOfStock = stock === 0;
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const navigate = useNavigation();

  const { user } = useSelector((state) => state.user);
  const { reviews, error: reviewError, loading: reviewLoading } = useSelector((state) => state.review);
  const average = useSelector((state) => state.review.averageRating);

  // Calculate discounted price if there's a promotion
  const discountedPrice = promoDiscount > 0 && price 
    ? Math.round(price - (price * promoDiscount / 100)) 
    : null;

  const incrementQty = () => {
    if (stock <= quantity)
      return Toast.show({
        type: "error",
        text1: "Maximum Value Added",
      });
    setQuantity((prev) => prev + 1);
  };

  const decrementQty = () => {
    if (quantity < 1) return;
    setQuantity((prev) => prev - 1);
  };

  const addToCartHandler = () => {
    if (!user) {
      navigate.navigate("login");
      return;
    }
    
    if (!name || !params?.id || price === undefined) {
      Toast.show({
        type: "error",
        text1: "Product Error",
        text2: "Product details not fully loaded"
      });
      return;
    }
    
    if (stock === 0)
      return Toast.show({
        type: "error",
        text1: "Out Of Stock",
      });
    
    // Use discounted price if promotion is active, with fallback to regular price
    const finalPrice = (discountedPrice !== null && discountedPrice !== undefined) ? discountedPrice : price;
    
    // Ensure we have a valid image
    const imageUrl = images && images.length > 0 ? images[0].url : null;
    
    dispatch(addToCart({
      product: params.id,
      name,
      price: finalPrice,
      image: imageUrl,
      stock,
      quantity,
    }));
    
    Toast.show({
      type: "success",
      text1: "Added To Cart",
      text2: promoDiscount > 0 ? `With ${promoDiscount}% discount applied!` : undefined
    });
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      console.log(`Attempting to delete review ${reviewId} for product ${params.id}`);
      await dispatch(deleteReview(reviewId, params.id));
      Toast.show({
        type: "success",
        text1: "Review deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting review:", error);
      Toast.show({
        type: "error",
        text1: "Failed to delete review",
      });
    }
  };

  useEffect(() => {
    if (reviewError) {
      console.error("Review error:", reviewError);
      Toast.show({
        type: "error",
        text1: reviewError,
      });
      dispatch({ type: "clearError" });
    }
  }, [reviewError, dispatch]);

  useEffect(() => {
    if (params?.id) {
      console.log("Loading product details and reviews for ID:", params.id);
      dispatch(getProductDetails(params.id));
      dispatch(getAllReviews(params.id));
      dispatch(getProductRatings(params.id));
    } else {
      console.error("Missing product ID in params");
      Toast.show({
        type: "error",
        text1: "Product ID is missing",
      });
    }
  }, [dispatch, params?.id, isFocused]);

  // Log reviews when they change
  useEffect(() => {
    console.log(`Received ${reviews?.length || 0} reviews:`, reviews);
  }, [reviews]);

  // Component to render each review item
  const renderReviewItem = ({ item, index }) => {
    console.log(`Rendering review ${index}:`, item);
    return (
      <View style={style.reviewItem}>
        <Text style={{ fontWeight: "bold", color: "black" }}>
          User: {item.user ? item.user : "Anonymous"}
        </Text>
        <Text>
          <Text style={{ fontWeight: "bold" }}>Rating:</Text> {item.rating}/5
        </Text>
        <Text>
          <Text style={{ fontWeight: "bold" }}>Comment:</Text> {item.comment}
        </Text>
        {user && item.user === user._id && (
          <TouchableOpacity onPress={() => handleDeleteReview(item._id)}>
            <Text style={style.deleteButton}>Delete Comment</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Direct rendering of reviews as an alternative to FlatList
  const renderAllReviews = () => {
    console.log("Rendering all reviews:", reviews);
    
    return reviews.map((item, index) => {
      // Create a unique key for each review
      const reviewKey = item._id || `review-${index}`;
      console.log(`Rendering review ${index} with ID ${reviewKey}`);
      
      return (
        <View key={reviewKey} style={style.reviewItem}>
          <Text style={{ fontWeight: "bold", color: "black" }}>
            User: {typeof item.user === 'object' && item.user.name 
              ? item.user.name 
              : (item.user ? item.user : "Anonymous")}
          </Text>
          <Text>
            <Text style={{ fontWeight: "bold" }}>Rating:</Text> {item.rating}/5
          </Text>
          <Text style={style.reviewComment}>
            <Text style={{ fontWeight: "bold" }}>Comment:</Text> {item.comment}
          </Text>
          <Text style={style.reviewDate}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
          {user && (user._id === item.user || user._id === item.user?._id) && (
            <TouchableOpacity onPress={() => handleDeleteReview(item._id)}>
              <Text style={style.deleteButton}>Delete Comment</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    });
  };

  // Add a check to ensure product data is loaded before rendering
  if (!name || price === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.color2 }}>
        <ActivityIndicator size="large" color={colors.color3} />
        <Text style={{ marginTop: 20, fontSize: 16 }}>Loading product details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.color2 }}>
      <ScrollView
        style={{ ...defaultStyle, padding: 0, backgroundColor: colors.color2 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={true}
      >
        <Header back={true} />

        {/* Promotion Banner */}
        {promoDiscount > 0 && (
          <View
            style={{
              backgroundColor: colors.color1,
              padding: 10,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              borderBottomWidth: 1,
              borderBottomColor: colors.color2 + "50",
            }}
          >
            <Text
              style={{
                color: colors.color2,
                fontWeight: "bold",
                textAlign: "center",
                fontSize: 16,
              }}
            >
              🔥 SPECIAL OFFER: {promoDiscount}% OFF THIS ITEM 🔥
            </Text>
          </View>
        )}

        <Carousel
          layout="default"
          sliderWidth={SLIDER_WIDTH}
          itemWidth={ITEM_WIDTH}
          ref={isCarousel}
          data={images || []}
          renderItem={CarouselCardItem}
          style={{ marginTop: 10 }}
          loop={images && images.length > 1}
        />
        <View
          style={{
            backgroundColor: colors.color2,
            padding: 35,
            borderTopLeftRadius: 55,
            borderTopRightRadius: 55,
          }}
        >
          <Text numberOfLines={2} style={{ fontSize: 25 }}>
            {name}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {promoDiscount > 0 ? (
              <>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    marginRight: 8,
                    textDecorationLine: "line-through",
                    color: "#777",
                  }}
                >
                  ₱{price?.toLocaleString() || "N/A"}
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "900",
                    color: colors.color1,
                  }}
                >
                  ₱{discountedPrice?.toLocaleString() || "N/A"}
                </Text>
                <View
                  style={{
                    backgroundColor: colors.color1,
                    padding: 5,
                    borderRadius: 5,
                    marginLeft: 10,
                  }}
                >
                  <Text
                    style={{
                      color: colors.color2,
                      fontWeight: "700",
                      fontSize: 12,
                    }}
                  >
                    {promoDiscount}% OFF
                  </Text>
                </View>
              </>
            ) : (
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "900",
                }}
              >
                ₱{price?.toLocaleString() || "N/A"}
              </Text>
            )}
          </View>
          <Text
            style={{ letterSpacing: 1, lineHeight: 20, marginVertical: 15 }}
            numberOfLines={8}
          >
            {description}
          </Text>

          {/* Quantity control */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
              backgroundColor: "lightgray",
              borderRadius: 5,
              paddingVertical: 20,
              marginBottom: -35,
            }}
          >
            <Text style={{ color: colors.color3, fontWeight: "500" }}>
              Quantity
            </Text>
            <View
              style={{
                width: 80,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <TouchableOpacity onPress={decrementQty}>
                <Avatar.Icon
                  icon={"minus"}
                  size={20}
                  style={{
                    borderRadius: 5,
                    backgroundColor: colors.color5,
                    height: 25,
                    width: 25,
                  }}
                />
              </TouchableOpacity>
              <Text style={style.quantity}>{quantity}</Text>
              <TouchableOpacity onPress={incrementQty}>
                <Avatar.Icon
                  icon={"plus"}
                  size={20}
                  style={{
                    borderRadius: 5,
                    backgroundColor: colors.color5,
                    height: 25,
                    width: 25,
                  }}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: "row", marginTop: 20 }}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={addToCartHandler}
              style={{ flex: 8 }}
              disabled={isOutOfStock}
            >
              <Button
                icon={"cart"}
                style={style.btn}
                textColor={isOutOfStock ? colors.color2 : colors.color2}
              >
                {isOutOfStock ? "Out Of Stock" : "Add To Cart"}
              </Button>
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>Leave a Review</Text>
          <View style={{ marginBottom: 20 }}>
            <Review productId={params.id} />
          </View>

          {/* Rating */}
          <View style={style.ratingContainer}>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>Reviews</Text>

            <View style={{ marginVertical: 10 }}>
              <Text style={{ marginBottom: 5 }}>
                Average Rating: {average ? average.toFixed(1) : "0.0"}
              </Text>
              <AirbnbRating
                count={5}
                defaultRating={average || 0}
                size={20}
                isDisabled={true}
                showRating={false}
              />
            </View>
          </View>

          {/* Reviews List */}
          {reviewLoading ? (
            <View style={style.loadingContainer}>
              <ActivityIndicator size="large" color={colors.color3} />
              <Text style={style.loadingText}>Loading reviews...</Text>
            </View>
          ) : reviews && reviews.length > 0 ? (
            // Use direct rendering instead of FlatList
            <View style={style.reviewsContainer}>
              <Text style={style.reviewCountText}>
                {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
              </Text>
              {renderAllReviews()}
            </View>
          ) : (
            <View style={style.emptyContainer}>
              <Text style={style.emptyText}>No reviews yet</Text>
              <Text style={style.emptySubtext}>Be the first to review this product!</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const CarouselCardItem = ({ item, index }) => (
  <View style={style.container} key={index}>
    <Image source={{ uri: item?.url }} style={style.image} />
  </View>
);

const style = StyleSheet.create({
  container: {
    backgroundColor: colors.color2,
    width: ITEM_WIDTH,
    paddingVertical: 100,
    height: 380,
  },
  image: {
    width: ITEM_WIDTH,
    resizeMode: "contain",
    height: 250,
  },
  quantity: {
    backgroundColor: colors.color4,
    height: 25,
    width: 25,
    textAlignVertical: "center",
    textAlign: "center",
    borderWidth: 1,
    borderRadius: 5,
    borderColor: colors.color5,
  },
  btn: {
    backgroundColor: colors.color3,
    borderRadius: 100,
    padding: 5,
    marginVertical: 35,
  },
  reviewItem: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#eaeaea",
  },
  deleteButton: {
    color: "red",
    fontWeight: "900",
    marginTop: 8,
    textAlign: "right",
  },
  ratingContainer: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: colors.color3,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptySubtext: {
    marginTop: 5,
    color: "gray",
  },
  reviewCountText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.color3,
  },
  reviewComment: {
    marginTop: 5,
  },
  reviewDate: {
    marginTop: 5,
    color: "gray",
  },
  reviewsContainer: {
    marginBottom: 30,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
});

export default ProductDetails;
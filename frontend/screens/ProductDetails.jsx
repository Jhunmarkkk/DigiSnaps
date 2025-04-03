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
  deleteReview,
  getAllReviews,
  getProductRatings,
} from "../redux/actions/reviewAction";

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
  const isOutOfStock = stock === 0;
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const navigate = useNavigation();

  const { user } = useSelector((state) => state.user);

  const reviews = useSelector((state) => state.review.reviews);
  const average = useSelector((state) => state.review.averageRating);
  const loading = useSelector((state) => state.review.loading);

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
    if (stock === 0)
      return Toast.show({
        type: "error",
        text1: "Out Of Stock",
      });
    dispatch({
      type: "addToCart",
      payload: {
        product: params.id,
        name,
        price,
        image: images[0]?.url,
        stock,
        quantity,
      },
    });
    Toast.show({
      type: "success",
      text1: "Added To Cart",
    });
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await dispatch(deleteReview(reviewId));
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
    dispatch(getProductDetails(params.id));
    dispatch(getAllReviews(params.id));
    dispatch(getProductRatings(params.id));
  }, [dispatch, params.id, isFocused]);

  return (
    <ScrollView
      style={{ ...defaultStyle, padding: 0, backgroundColor: colors.color2 }}
    >
      <Header back={true} />
      <Carousel
        layout="default"
        sliderWidth={SLIDER_WIDTH}
        itemWidth={ITEM_WIDTH}
        ref={isCarousel}
        data={images}
        renderItem={CarouselCardItem}
        style={{ marginTop: 10 }}
        loop
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
        <Text style={{ fontSize: 18, fontWeight: "900" }}>₱{price}</Text>
        <Text
          style={{ letterSpacing: 1, lineHeight: 20, marginVertical: 15 }}
          numberOfLines={8}
        >
          {description}
        </Text>

        {/* Render reviews */}

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
        <ScrollView showsVerticalScrollIndicator={false}>
          <Review />
        </ScrollView>

        {/* Rating */}
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Reviews</Text>

        <AirbnbRating
          count={5}
          reviews={["Awful", "Poor", "Okay", "Good", "Excellent"]}
          defaultRating={average}
          size={20}
          isDisabled={true}
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            marginTop: 20,
          }}
        ></View>
        {loading ? (
          <ActivityIndicator size="large" color="blue" />
        ) : (
          <FlatList
            data={reviews}
            horizontal={false}
            renderItem={({ item }) => (
              <View style={{ marginBottom: 30 }}>
                <Text style={{ fontWeight: "bold", color: "black" }}>
                  User: {item.user}
                </Text>
                <Text>
                  <Text style={{ fontWeight: "bold" }}>Rating:</Text>{" "}
                  {item.rating}/5
                </Text>
                <Text>
                  <Text style={{ fontWeight: "bold" }}>Comment:</Text>{" "}
                  {item.comment}
                </Text>
                {user && item.user === user._id && (
                  <TouchableOpacity
                    onPress={() => handleDeleteReview(item._id)}
                  >
                    <Text
                      style={{
                        color: "red",
                        fontWeight: 900,
                        justifyContent: "flex-end",
                      }}
                    >
                      Delete Comment
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        )}
      </View>
    </ScrollView>
  );
};

const CarouselCardItem = ({ item, index }) => (
  <View style={style.container} key={index}>
    <Image source={{ uri: item.url }} style={style.image} />
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
});
export default ProductDetails;

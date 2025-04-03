import React, { useState, useEffect } from "react";
import { View, TextInput, Button, StyleSheet, ScrollView } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { Rating } from "react-native-ratings";
import Toast from "react-native-toast-message";
import {
  addReview,
  getAllReviews,
  getProductRatings,
} from "../redux/actions/reviewAction";

const Review = () => {
  const user = useSelector((state) => state.user);
  const product = useSelector((state) => state.product);
  const reviews = useSelector((state) => state.review.reviews);
  const dispatch = useDispatch();

  const [comment, setNewReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const showToast = (type, comment) => {
    Toast.show({
      type: type,
      text1: comment,
      visibilityTime: 3000,
      autoHide: true,
    });
  };

  const handleAddReview = async () => {
    if (!comment) {
      showToast("error", "Please enter a comment.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      await dispatch(
        addReview(comment, user.user._id, product.product._id, rating)
      );
      showToast("success", "Review added successfully");
      setNewReviewText("");
      setRating(0);
    } catch (error) {
      console.error("Error adding review:", error);
      showToast("error", "Failed to add review");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (product.product._id) {
      dispatch(getAllReviews(product.product._id));
      dispatch(getProductRatings(product.product._id));
    }
  }, [dispatch, product.product._id]);

  return (
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add a review..."
            value={comment}
            onChangeText={setNewReviewText}
          />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Rating
              startingValue={rating}
              onFinishRating={(value) => setRating(value)}
              imageSize={20}
              style={{ paddingVertical: 5 }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <Button
              title={"Post Review"}
              onPress={handleAddReview}
              disabled={isLoading}
            />
          </View>
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  formContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  input: {
    flex: 1,
    marginRight: 10,
    marginBottom: 10,
    marginTop: 30,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 40,
    width: "100%",
  },
});

export default Review;

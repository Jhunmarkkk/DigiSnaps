import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { Rating } from "react-native-ratings";
import Toast from "react-native-toast-message";
import { Button } from "react-native-paper";
import { colors } from "../styles/styles";
import {
  addReview,
  getAllReviews,
  getProductRatings,
} from "../redux/actions/reviewAction";

const Review = ({ productId }) => {
  const { user } = useSelector((state) => state.user);
  const { loading, error, message } = useSelector((state) => state.review);

  const dispatch = useDispatch();

  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);

  // Log the productId to verify it's being passed correctly
  useEffect(() => {
    console.log("Review component initialized with productId:", productId);
  }, [productId]);

  const showToast = (type, text) => {
    Toast.show({
      type: type,
      text1: text,
      visibilityTime: 3000,
      autoHide: true,
    });
  };

  useEffect(() => {
    if (error) {
      console.error("Error in review component:", error);
      showToast("error", error);
      dispatch({ type: "clearError" });
    }
    if (message) {
      showToast("success", message);
      dispatch({ type: "clearMessage" });
      
      // Refresh reviews after adding a new one
      console.log("Refreshing reviews after adding new review");
      dispatch(getAllReviews(productId));
      dispatch(getProductRatings(productId));
      
      // Clear form
      setComment("");
      setRating(0);
    }
  }, [error, message, dispatch, productId]);

  const handleAddReview = async () => {
    if (!user) {
      showToast("error", "Please login to add a review");
      return;
    }

    if (!comment) {
      showToast("error", "Please enter a comment");
      return;
    }

    if (rating === 0) {
      showToast("error", "Please select a rating");
      return;
    }

    if (!productId) {
      console.error("Missing productId for review");
      showToast("error", "Product ID is missing");
      return;
    }

    try {
      console.log("Adding review with data:", {
        user: user._id,
        productId,
        rating,
        comment
      });
      
      const result = await dispatch(addReview(comment, rating, productId));
      console.log("Review submission result:", result);
    } catch (error) {
      console.error("Error adding review:", error);
      showToast("error", "Failed to add review: " + (error.message || "Unknown error"));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a review..."
          value={comment}
          onChangeText={setComment}
          multiline={true}
          numberOfLines={3}
        />
        <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}>
          <Text style={{ marginRight: 10 }}>Rating:</Text>
          <Rating
            startingValue={rating}
            onFinishRating={(value) => setRating(value)}
            imageSize={20}
            style={{ paddingVertical: 5 }}
          />
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={handleAddReview}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Submitting..." : "Submit Review"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  formContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%",
  },
  input: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: "100%",
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: colors.color1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    width: "100%",
  },
  buttonText: {
    color: colors.color2,
    fontWeight: "bold",
  },
});

export default Review;

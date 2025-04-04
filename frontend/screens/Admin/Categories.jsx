import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  colors,
  defaultStyle,
  formHeading,
  inputOptions,
} from "../../styles/styles";
import Header from "../../components/Header";
import { Avatar, Button, TextInput } from "react-native-paper";
import { useIsFocused } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { addCategory, deleteCategory } from "../../redux/actions/otherAction";
import { useMessageAndErrorOther, useSetCategories } from "../../utils/hooks";
import mime from "mime";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { server } from "../../redux/store";

const Categories = ({ navigation, route, navigate }) => {
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [categories, setCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const { loading, error, message } = useSelector((state) => state.other);

  // Fetch categories on component load and when focus changes
  const fetchCategories = async () => {
    setRefreshing(true);
    try {
      const token = await AsyncStorage.getItem('token');
      console.log("Fetching categories with token:", token);
      
      const response = await axios.get(`${server}/product/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("Categories response:", response.data);
      
      if (response.data && response.data.categories) {
        setCategories(response.data.categories);
      } else {
        console.error("Invalid categories data format:", response.data);
        // Try alternative response format
        if (response.data && Array.isArray(response.data)) {
          setCategories(response.data);
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error.response || error);
      Toast.show({
        type: "error",
        text1: "Failed to fetch categories",
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchCategories();
    }
  }, [isFocused]);

  // Handle success/error messages
  useEffect(() => {
    if (error) {
      Toast.show({
        type: "error",
        text1: error,
      });
      dispatch({ type: "clearError" });
    }
    if (message) {
      Toast.show({
        type: "success",
        text1: message,
      });
      dispatch({ type: "clearMessage" });
      setCategory("");
      setImage("");
      fetchCategories(); // Refresh the categories after adding
    }
  }, [error, message, dispatch]);

  const deleteHandler = (id) => {
    dispatch(deleteCategory(id));
  };

  // Update categories after add/delete operations
  useEffect(() => {
    if (message) {
      fetchCategories(); // Refresh categories after successful operation
    }
  }, [message]);

  const submitHandler = () => {
    if (!category) {
      return Toast.show({
        type: "error",
        text1: "Please enter a category name",
      });
    }

    if (!image) {
      return Toast.show({
        type: "error",
        text1: "Please select an image",
      });
    }

    const myForm = new FormData();
    myForm.append("category", category);
    myForm.append("file", {
      uri: image,
      type: mime.getType(image),
      name: image.split("/").pop(),
    });

    dispatch(addCategory(myForm));
  };

  useEffect(() => {
    if (route.params?.image) setImage(route.params.image);
  }, [route.params]);

  return (
    <View style={{ ...defaultStyle, backgroundColor: colors.color2 }}>
      <Header back={true} showCartButton={false}/>

      {/* Heading */}
      <View style={{ marginBottom: 20, paddingTop: 70 }}>
        <Text style={formHeading}>Categories</Text>
      </View>

      <ScrollView
        style={{
          marginBottom: 20,
        }}
      >
        <View
          style={{
            backgroundColor: colors.color2,
            padding: 20,
            minHeight: 400,
          }}
        >
          {categories.length > 0 ? (
            categories.map((i) => (
              <CategoryCard
                name={i.category}
                id={i._id}
                key={i._id}
                deleteHandler={deleteHandler}
                navigation={navigation}
              />
            ))
          ) : (
            <Text style={{textAlign: 'center', marginTop: 20}}>No categories found</Text>
          )}
        </View>
      </ScrollView>
      <View style={styles.container}>
        <View
          style={{
            width: 80,
            height: 80,
            alignSelf: "center",
            marginBottom: 20,
          }}
        >
          <Avatar.Image
            size={80}
            style={{
              backgroundColor: "gray",
            }}
            source={{
              uri: image ? image : null,
            }}
          />
          <TouchableOpacity
            onPress={() => navigation.navigate("camera", { newCategory: true })}
          >
            <Avatar.Icon
              icon={"camera"}
              size={30}
              color={colors.color3}
              style={{
                backgroundColor: colors.color2,
                position: "absolute",
                bottom: 0,
                right: -5,
              }}
            />
          </TouchableOpacity>
        </View>

        <TextInput
          {...inputOptions}
          placeholder="Category"
          value={category}
          onChangeText={setCategory}
        />

        <Button
          textColor={colors.color2}
          style={{
            backgroundColor: colors.color1,
            margin: 20,
            padding: 6,
          }}
          loading={loading}
          disabled={loading}
          onPress={submitHandler}
        >
          Add
        </Button>
      </View>
      {/* add category form */}
    </View>
  );
};

const CategoryCard = ({ name, id, deleteHandler, navigate, navigation }) => (
  <View style={styles.cardContainer}>
    <Text style={styles.cardText}>{name}</Text>
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        onPress={() =>
          navigation && navigation.navigate("updatecategory", { id })
        }
        style={{ marginRight: 10 }}
      >
        <Avatar.Icon
          icon={"pen"}
          size={30}
          style={{
            backgroundColor: colors.color1,
          }}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteHandler(id)}>
        <Avatar.Icon
          icon={"delete"}
          size={30}
          style={{
            backgroundColor: colors.color1,
          }}
        />
      </TouchableOpacity>
    </View>
  </View>
);

export default Categories;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    elevation: 10,
    borderRadius: 10,
    backgroundColor: colors.color3,
  },

  cardContainer: {
    backgroundColor: colors.color2,
    elevation: 5,
    margin: 10,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 10,
  },
  cardText: {
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: 5, // Adjust margin as needed
  },
});

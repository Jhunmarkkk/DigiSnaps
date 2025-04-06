import React, { useEffect, useState, useRef } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Text,
  Image,
  Dimensions,
  SafeAreaView,
  Platform,
  FlatList,
} from "react-native";
import { Avatar, Button } from "react-native-paper";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import Carousel from "react-native-snap-carousel";

import { defaultStyle, colors } from "../styles/styles";
import Header from "../components/Header";
import Heading from "../components/Heading";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import SearchModal from "../components/SearchModal";

import { getAllProducts } from "../redux/actions/productAction";
import { useSetCategories } from "../utils/hooks";
import { logout } from "../redux/actions/userAction";
import { store } from "../redux/store";

const Home = () => {
  const [category, setCategory] = useState("");
  const [activeSearch, setActiveSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);

  const navigate = useNavigation();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const isCarousel = useRef(null);

  const { products } = useSelector((state) => state.product);
  const { user } = useSelector((state) => state.user);

  const categoryButtonHandler = (id) => {
    setCategory(id);
  };

  const logoutHandler = () => {
    dispatch(logout());
    Toast.show({
      type: "success",
      text1: "Logged out successfully",
    });
    navigate.navigate("login");
  };

  const addToCartHandler = (id, name, price, image, stock) => {
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
        product: id,
        name,
        price,
        image,
        stock,
        quantity: 1,
      },
    });
    Toast.show({
      type: "success",
      text1: "Added To Cart",
    });
  };

  useSetCategories(setCategories, isFocused);

  useEffect(() => {
    if (categories.length > 0) {
      setCategory(categories[0]._id); // Set the first category as the initial selected category
    }
  }, [categories]);

  useEffect(() => {
    const fetchProducts = async () => {
      // First try with the category filter
      await dispatch(getAllProducts(searchQuery, category));
      
      // Check if we got products
      const currentState = store.getState();
      const currentProducts = currentState.product.products;
      
      // If no products and we have a category filter, try without category filter
      if (currentProducts.length === 0 && category) {
        console.log("No products found with category filter, trying without filter");
        dispatch(getAllProducts(searchQuery, ""));
      }
    };

    const timeOutId = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => {
      clearTimeout(timeOutId);
    };
  }, [dispatch, searchQuery, category, isFocused]);

  const renderCarouselItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => categoryButtonHandler(item._id)}
      style={{ alignItems: "center", justifyContent: "center" }}
    >
      <Image
        source={{ uri: item.images[0].url }}
        style={{ width: 300, height: 200, borderRadius: 10 }}
      />
      <Text style={{ marginTop: 10, fontWeight: 900 }}>{item.category}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.color2, // Match the background color
      }}
    >
      <View style={styles.container}>
        {activeSearch && (
          <SearchModal
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setActiveSearch={setActiveSearch}
            products={products}
          />
        )}
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 80}}
        >
          <View style={[defaultStyle, {paddingTop: 20}]}>
            <Header
              showCartButton={false}
              showSearchButton={true}
              onSearchButtonPress={() => setActiveSearch((prev) => !prev)}
            />
            
            {/* Logout Button */}
            {user && (
              <TouchableOpacity
                style={{
                  position: "absolute",
                  right: 80,
                  top: 40, // Increased to account for the paddingTop
                  zIndex: 10,
                }}
                onPress={logoutHandler}
              >
                <Avatar.Icon
                  style={{
                    backgroundColor: colors.color4,
                  }}
                  icon={"logout"}
                  color={colors.color3}
                  size={40}
                />
              </TouchableOpacity>
            )}

            {/* Heading Row */}
            <View style={styles.headingContainer}>
              <Heading text1="Explore your" text2="best options" />
            </View>

            {/* Carousel */}
            <View style={styles.carouselContainer}>
              <Carousel
                data={categories}
                renderItem={renderCarouselItem}
                sliderWidth={Dimensions.get("window").width}
                itemWidth={300}
                ref={isCarousel}
                layout="default"
                loop
              />
            </View>

            {/* Subheading Row */}
            <View style={styles.subheadingContainer}>
              <Heading text1="Digital Camera" text2="Collections" />
            </View>

            {/* Categories */}
            <View style={styles.categoryContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  padding: 5,
                }}
              >
                {categories.map((item, index) => (
                  <Button
                    key={item._id}
                    style={{
                      backgroundColor:
                        category === item._id ? colors.color5 : colors.color1,
                      borderRadius: 100,
                      margin: 5,
                    }}
                    onPress={() => categoryButtonHandler(item._id)}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: category === item._id ? colors.color2 : colors.color5,
                      }}
                    >
                      {item.category}
                    </Text>
                  </Button>
                ))}
              </ScrollView>
            </View>

            {/* Products */}
            <View style={{
              flex: 1,
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              paddingBottom: 30,
            }}>
              {products.length > 0 ? (
                products.map((item) => (
                  <ProductCard
                    key={item._id}
                    stock={item.stock}
                    name={item.name}
                    price={item.price}
                    image={item.images[0]?.url}
                    addToCartHandler={addToCartHandler}
                    id={item._id}
                    navigate={navigate}
                    i={item._id}
                  />
                ))
              ) : (
                <Text style={{marginTop: 20, fontSize: 16}}>No products available in this category.</Text>
              )}
            </View>
          </View>
        </ScrollView>
        <Footer activeRoute={"home"} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },

  container: {
    flex: 1,
    position: "relative",
  },
  headingContainer: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: "left",
  },
  carouselContainer: {
    alignItems: "center", // Center the carousel horizontally
    marginBottom: 20, // Add margin bottom to give space between carousel and other content
  },
  subheadingContainer: {
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  productContainer: {
    flex: 1,
    marginLeft:-10
  },
});

export default Home;
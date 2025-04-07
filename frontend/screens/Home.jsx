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
        alignSelf: "stretch",
        paddingTop: Platform.OS === "android" ? -10 : 0,
        flex: 1,
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
        
        <View style={defaultStyle}>
          <View style={styles.headerContainer}>
            <Header
              showCartButton={false}
              showSearchButton={true}
              onSearchButtonPress={() => setActiveSearch((prev) => !prev)}
            />
            
            {/* Logout Button - Positioned next to search button */}
            {user && (
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={logoutHandler}
              >
                <Avatar.Icon
                  style={{
                    backgroundColor: colors.color4,
                  }}
                  icon={"logout"}
                  color={colors.color3}
                  size={30}
                />
              </TouchableOpacity>
            )}
          </View>
          
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 70}}
          >
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

            {/* Products */}
            <View style={styles.productsContainer}>
              {products.length > 0 ? (
                products.map((item) => (
                  <ProductCard
                    stock={item.stock}
                    name={item.name}
                    price={item.price}
                    image={
                      item.images && item.images.length > 0
                        ? item.images[0].url
                        : ""
                    }
                    addToCartHandler={addToCartHandler}
                    id={item._id}
                    key={item._id}
                    i={0}
                    navigate={navigate}
                  />
                ))
              ) : (
                <Text style={{ alignSelf: "center", fontSize: 18, color: colors.color3 }}>
                  No Products Found
                </Text>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
      <Footer activeRoute={"home"} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.color1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 20,
    marginTop: 10,
  },
  logoutButton: {
    marginLeft: 10,
  },
  headingContainer: {
    paddingTop: 70, // Adjusted to account for header height
    marginBottom: 10,
  },
  carouselContainer: {
    marginVertical: 15,
  },
  subheadingContainer: {
    marginVertical: 15,
  },
  productsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
});

export default Home;
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
import { sendLocalNotification } from "../utils/notifications";

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
import { addToCart } from "../redux/actions/cartActions";

const Home = ({ route }) => {
  const [category, setCategory] = useState("");
  const [activeSearch, setActiveSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [priceRange, setPriceRange] = useState("");

  const navigate = useNavigation();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const isCarousel = useRef(null);

  const { products } = useSelector((state) => state.product);
  const { user } = useSelector((state) => state.user);

  // Check if the user came from a successful order placement
  useEffect(() => {
    if (route.params?.orderSuccess) {
      // Generate a random order ID for demonstration
      const demoOrderId = Date.now().toString().slice(-12);
      const shortOrderId = demoOrderId.slice(-6);

      // Send a local notification for the new order
      sendLocalNotification(
        "Order Placed Successfully!",
        `Your order #${shortOrderId} has been received and is being prepared.`,
        {
          screen: 'orders',
          orderId: demoOrderId,
          status: "Preparing"
        }
      );
      
      // Clear the parameter to prevent showing the notification again on re-render
      route.params.orderSuccess = false;
    }
  }, [route.params]);

  const categoryButtonHandler = (id) => {
    setCategory(id);
  };

  const showAllProducts = () => {
    setCategory("");
  };

  const setPriceRangeFilter = (range) => {
    setPriceRange(range);
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
    dispatch(addToCart({
      product: id,
      name,
      price,
      image,
      stock,
      quantity: 1,
    }));
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

  // Filter products by price range
  const filteredProducts = priceRange 
    ? products.filter(product => {
        switch(priceRange) {
          case "0-1000":
            return product.price <= 1000;
          case "1000-5000":
            return product.price > 1000 && product.price <= 5000;
          case "5000-10000":
            return product.price > 5000 && product.price <= 10000;
          case "10000+":
            return product.price > 10000;
          default:
            return true;
        }
      })
    : products;

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
        <ScrollView showsVerticalScrollIndicator={false}>
          {activeSearch && (
            <SearchModal
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setActiveSearch={setActiveSearch}
              products={products}
            />
          )}
          <View style={defaultStyle}>
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
                  top: 20,
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

            {/* Category Buttons */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryContainer}
              style={{ marginVertical: 10 }}
            >
              <TouchableOpacity
                onPress={showAllProducts}
                style={{
                  backgroundColor:
                    category === "" ? colors.color1 : colors.color5,
                  borderRadius: 20,
                  padding: 10,
                  marginHorizontal: 5,
                  marginVertical: 5,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: category === "" ? colors.color2 : colors.color3,
                  }}
                >
                  All
                </Text>
              </TouchableOpacity>
              {categories.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  onPress={() => categoryButtonHandler(item._id)}
                  style={{
                    backgroundColor:
                      category === item._id ? colors.color1 : colors.color5,
                    borderRadius: 20,
                    padding: 10,
                    marginHorizontal: 5,
                    marginVertical: 5,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: category === item._id ? colors.color2 : colors.color3,
                    }}
                  >
                    {item.category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Price Range Buttons */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryContainer}
              style={{ marginVertical: 10 }}
            >
              <TouchableOpacity
                onPress={() => setPriceRangeFilter("")}
                style={{
                  backgroundColor:
                    priceRange === "" ? colors.color1 : colors.color5,
                  borderRadius: 20,
                  padding: 10,
                  marginHorizontal: 5,
                  marginVertical: 5,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: priceRange === "" ? colors.color2 : colors.color3,
                  }}
                >
                  All Prices
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPriceRangeFilter("0-1000")}
                style={{
                  backgroundColor:
                    priceRange === "0-1000" ? colors.color1 : colors.color5,
                  borderRadius: 20,
                  padding: 10,
                  marginHorizontal: 5,
                  marginVertical: 5,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: priceRange === "0-1000" ? colors.color2 : colors.color3,
                  }}
                >
                  ₱0 - ₱1,000
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPriceRangeFilter("1000-5000")}
                style={{
                  backgroundColor:
                    priceRange === "1000-5000" ? colors.color1 : colors.color5,
                  borderRadius: 20,
                  padding: 10,
                  marginHorizontal: 5,
                  marginVertical: 5,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: priceRange === "1000-5000" ? colors.color2 : colors.color3,
                  }}
                >
                  ₱1,000 - ₱5,000
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPriceRangeFilter("5000-10000")}
                style={{
                  backgroundColor:
                    priceRange === "5000-10000" ? colors.color1 : colors.color5,
                  borderRadius: 20,
                  padding: 10,
                  marginHorizontal: 5,
                  marginVertical: 5,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: priceRange === "5000-10000" ? colors.color2 : colors.color3,
                  }}
                >
                  ₱5,000 - ₱10,000
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPriceRangeFilter("10000+")}
                style={{
                  backgroundColor:
                    priceRange === "10000+" ? colors.color1 : colors.color5,
                  borderRadius: 20,
                  padding: 10,
                  marginHorizontal: 5,
                  marginVertical: 5,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: priceRange === "10000+" ? colors.color2 : colors.color3,
                  }}
                >
                  ₱10,000+
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Products */}
            <View style={styles.productContainer}>
              {filteredProducts.length > 0 ? (
                <FlatList
                  data={filteredProducts}
                  renderItem={({ item }) => (
                    <ProductCard
                      stock={item.stock}
                      name={item.name}
                      price={item.price}
                      image={item.images[0]?.url}
                      addToCartHandler={addToCartHandler}
                      id={item._id}
                      key={item._id}
                      navigate={navigate}
                    />
                  )}
                  keyExtractor={(item) => item._id}
                  numColumns={2} // Display two products per row
                  contentContainerStyle={styles.scrollViewContent}
                />
              ) : (
                <Text>No products available in this price range.</Text>
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
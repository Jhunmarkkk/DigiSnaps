import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import React, { useState } from "react";
import { colors, defaultStyle, formHeading } from "../../styles/styles";
import Header from "../../components/Header";
import Loader from "../../components/Loader";
import ButtonBox from "../../components/ButtonBox";
import ProductListItem from "../../components/ProductListItem";
import { useDispatch } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import {
  useAdminProducts,
  useMessageAndErrorOther,
  useGetSalesData,
  useGetGeographicSalesData,
} from "../../utils/hooks";
import { deleteProduct } from "../../redux/actions/otherAction";
import { getAdminProducts } from "../../redux/actions/productAction";

const Products = ({ navigation }) => {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const { loading, products, inStock, outOfStock } = useAdminProducts(
    dispatch,
    isFocused
  );

  const [salesData, setSalesData] = useState([]);
  useGetSalesData(setSalesData);

  const [salesByCity, setGeographicSalesData] = useState([]);
  useGetGeographicSalesData(setGeographicSalesData);

  const navigationHandler = (text) => {
    switch (text) {
      case "Add":
        navigation.navigate("newproduct");
        break;

      default:
        navigation.navigate("adminorders");
        break;
    }
  };

  const deleteProductHandler = (id) => {
    dispatch(deleteProduct(id));
  };

  const loadingDelete = useMessageAndErrorOther(
    dispatch,
    null,
    null,
    getAdminProducts
  );

  return (
    <View style={{ flex: 1 }}>
      <Header back={true} showCartButton={false} />
      {loading ? (
        <Loader />
      ) : (
        <ScrollView style={styles.dashboardContainer}>
          <View style={{ paddingTop: 40, marginBottom: 20 }}>
            <Text style={formHeading}>Products</Text>
          </View>
          <View>
            <View
              style={{
                flexDirection: "row",
                margin: 10,
                justifyContent: "center",
              }}
            >
              <ButtonBox
                icon={"plus"}
                text={"Add"}
                handler={navigationHandler}
              />
            </View>
          </View>

          <View style={styles.container}>
            <Text style={styles.text}>IMG</Text>
            <Text style={styles.text}>Price</Text>
            <Text style={{ ...styles.text, width: null, maxWidth: 120 }}>
              Name
            </Text>
            <Text style={{ ...styles.text, width: 60 }}>Category</Text>
            <Text style={styles.text}>Stock</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ marginBottom: 200 }}>
              {!loadingDelete &&
                products.map((item, index) => (
                  <ProductListItem
                    navigate={navigation}
                    deleteHandler={deleteProductHandler}
                    key={item._id}
                    id={item._id}
                    i={index}
                    price={item.price}
                    stock={item.stock}
                    name={item.name}
                    category={item.category?.category}
                    imgSrc={item.images[0].url}
                  />
                ))}
            </View>
          </ScrollView>
        </ScrollView>
      )}
    </View>
  );
};

export default Products;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.color3,
    flexDirection: "row",
    justifyContent: "space-between",
    height: 40,
    alignItems: "center",
    padding: 10,
  },

  text: {
    width: 40,
    color: colors.color2,
    fontWeight: "900",
  },

  dashboardContainer: {
    padding: 30,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    flex: 1,
    marginVertical: -20,
    backgroundColor: colors.color2,
  },
});

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import React, { useState } from "react";
import { colors, defaultStyle, formHeading } from "../../styles/styles";
import Header from "../../components/Header";
import Loader from "../../components/Loader";
import ButtonBox from "../../components/ButtonBox";
import ProductListItem from "../../components/ProductListItem";
import Chart from "../../components/Chart";
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
import SalesChart from "../../components/SalesChart";
import GeographicSalesChart from "../../components/GeographicSalesChart";

const AdminDashboard = ({ navigation }) => {
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
      case "Categories":
        navigation.navigate("categories");
        break;
      case "All Orders":
        navigation.navigate("adminorders");
        break;
      case "Products":
        navigation.navigate("products");
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
    <SafeAreaView
      style={{
        alignSelf: "stretch",
        paddingTop: Platform.OS === "android" ? -10 : 0,
        flex: 1,
      }}
    >
      <View style={{ flex: 1 }}>
        <Header back={true} showCartButton={false} />
        {loading ? (
          <Loader />
        ) : (
          <ScrollView
            style={styles.dashboardContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ paddingTop: 40, marginBottom: 20 }}>
              <Text style={formHeading}>Admin Dashboard</Text>
            </View>
            <View>
              <View
                style={{
                  flexDirection: "row",
                  margin: 10,
                  justifyContent: "space-between",
                }}
              >
                <ButtonBox
                  icon={"view-list"}
                  text={"Products"}
                  handler={navigationHandler}
                />

                <ButtonBox
                  icon={"view-list"}
                  text={"All Orders"}
                  handler={navigationHandler}
                  reverse={true}
                />

                <ButtonBox
                  icon={"view-list"}
                  text={"Categories"}
                  handler={navigationHandler}
                />
              </View>
            </View>
            <View
              style={{
                backgroundColor: colors.color3,
                borderRadius: 20,
                alignItems: "center",
              }}
            >
              <Chart inStock={inStock} outOfStock={outOfStock} />
            </View>

            <View
              style={{
                backgroundColor: colors.color3,
                marginTop: 10,
                borderRadius: 20,
                padding: 10,
                alignItems: "center",
              }}
            >
              <SalesChart salesData={salesData} />
            </View>

            <View
              style={{
                backgroundColor: colors.color3,
                marginTop: 10,
                borderRadius: 20,
                padding: 10,
                alignItems: "center",
              }}
            >
              <GeographicSalesChart salesByCity={salesByCity} />
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.color3,
    flexDirection: "row",
    justifyContent: "space-between",
    height: 40,
    alignItems: "center",
    borderRadius: 5,
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
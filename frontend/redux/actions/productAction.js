import axios from "axios";
import { server } from "../store";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getAllProducts = (keyword, category) => async (dispatch) => {
  try {
    dispatch({
      type: "getAllProductsRequest",
    });

    // Create a URL with proper handling of category parameter
    let url = `${server}/product/all?keyword=${keyword || ''}`;
    if (category) url += `&category=${category}`;

    console.log("Fetching products from:", url);
    
    const { data } = await axios.get(url);

    console.log(`Fetched ${data.products.length} products`);
    
    dispatch({
      type: "getAllProductsSuccess",
      payload: data.products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    dispatch({
      type: "getAllProductsFail",
      payload: error.response?.data?.message || "Failed to fetch products",
    });
  }
};

export const getAdminProducts = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAdminProductsRequest",
    });
    
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error("Authentication token not found. Please login again.");
    }
    
    console.log("Fetching admin products");
    const { data } = await axios.get(`${server}/product/admin`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`Fetched ${data.products ? data.products.length : 0} admin products`);

    dispatch({
      type: "getAdminProductsSuccess",
      payload: data,
    });
  } catch (error) {
    console.error("Error fetching admin products:", error);
    dispatch({
      type: "getAdminProductsFail",
      payload: error.response?.data?.message || "Failed to fetch admin products",
    });
  }
};

export const getProductDetails = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "getProductDetailsRequest",
    });

    console.log(`Fetching product details for ID: ${id}`);
    const { data } = await axios.get(`${server}/product/single/${id}`);
    console.log("Product details fetched successfully");

    dispatch({
      type: "getProductDetailsSuccess",
      payload: data.product,
    });
  } catch (error) {
    console.error("Error fetching product details:", error);
    dispatch({
      type: "getProductDetailsFail",
      payload: error.response?.data?.message || "Failed to fetch product details",
    });
  }
};

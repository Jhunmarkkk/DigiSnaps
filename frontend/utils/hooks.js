import axios from "axios";
import { useEffect, useState } from "react";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { useSelector } from "react-redux";
import { loadUser } from "../redux/actions/userAction";
import { server } from "../redux/store";
import { getAdminProducts } from "../redux/actions/productAction";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useMessageAndErrorUser = (
  navigation,
  dispatch,
  navigateTo = "home"
) => {
  const { loading, message, error, isAuthenticated } = useSelector((state) => state.user);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: "error",
        text1: error,
      });
      dispatch({
        type: "clearError",
      });
    }

    if (message) {
      Toast.show({
        type: "success",
        text1: message,
      });
      
      dispatch({
        type: "clearMessage",
      });
      
      // Load user data first
      dispatch(loadUser());
      
      // Then navigate
      if (isAuthenticated) {
        navigation.reset({
          index: 0,
          routes: [{ name: navigateTo }],
        });
      }
    }
  }, [error, message, dispatch, isAuthenticated]);

  return loading;
};

export const useMessageAndErrorOther = (
  dispatch,
  navigation,
  navigateTo,
  func
) => {
  const { loading, message, error } = useSelector((state) => state.other);
  const { isAuthenticated } = useSelector((state) => state.user);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: "error",
        text1: error,
      });
      dispatch({
        type: "clearError",
      });
    }

    if (message) {
      Toast.show({
        type: "success",
        text1: message,
      });
      dispatch({
        type: "clearMessage",
      });

      if (navigateTo && isAuthenticated) {
        // For product creation, refresh products after navigating
        if (navigateTo === "admindashboard") {
          dispatch({ type: "clearError" });
          dispatch({ type: "clearMessage" });
        }
        navigation?.navigate(navigateTo);
      }

      if (func) dispatch(func());
    }
  }, [error, message, dispatch, isAuthenticated, navigateTo]);

  return loading;
};

export const useSetCategories = (setCategories, isFocused) => {
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("Fetching categories from:", `${server}/product/categories`);
        const res = await axios.get(`${server}/product/categories`);
        console.log("Categories response:", res.data);
        
        if (res.data && res.data.categories) {
          setCategories(res.data.categories);
        } else {
          console.error("Invalid categories data format:", res.data);
          Toast.show({
            type: "error",
            text1: "Failed to fetch categories: Invalid data format",
          });
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        Toast.show({
          type: "error",
          text1: error.response?.data?.message || "Failed to fetch categories",
        });
        // Set categories to empty array on error
        setCategories([]);
      }
    };

    if (isFocused) {
      fetchCategories();
    }
  }, [isFocused]);
};

export const useGetOrders = (isFocused, isAdmin = false) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        
        const res = await axios.get(`${server}/order/${isAdmin ? "admin" : "my"}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setOrders(res.data.orders);
        setLoading(false);
      } catch (e) {
        Toast.show({
          type: "error",
          text1: e.response?.data?.message || "Failed to fetch orders",
        });
        setLoading(false);
      }
    };
    
    if (isFocused) {
      fetchOrders();
    }
  }, [isFocused, isAdmin]);

  return {
    loading,
    orders,
  };
};

export const useAdminProducts = (dispatch, isFocused) => {
  const { products, inStock, outOfStock, error, loading } = useSelector(
    (state) => state.product
  );

  useEffect(() => {
    if (error) {
      Toast.show({
        type: "error",
        text1: error,
      });
      dispatch({
        type: "clearError",
      });
    }

    dispatch(getAdminProducts());
  }, [dispatch, isFocused, error]);

  return {
    products,
    inStock,
    outOfStock,
    loading,
  };
};

export const useGetSalesData = (setSalesData) => {
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`${server}/order/dailySales`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setSalesData(response.data.salesPerDay);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        setSalesData([]); // Set salesData to empty array in case of error
      }
    };

    fetchSalesData();
  }, [setSalesData]);
};

export const useGetGeographicSalesData = (setGeographicSalesData) => {
  useEffect(() => {
    const fetchGeographicSalesData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`${server}/order/geographicSales`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setGeographicSalesData(response.data.salesByCity);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        setGeographicSalesData([]); // Set GeographicSalesData to empty array in case of error
      }
    };

    fetchGeographicSalesData();
  }, [setGeographicSalesData]);
};
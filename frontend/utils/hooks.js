import axios from "axios";
import { useEffect, useState } from "react";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { useSelector } from "react-redux";
import { loadUser } from "../redux/actions/userAction";
import { server } from "../redux/store";
import { getAdminProducts } from "../redux/actions/productAction";

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

      navigateTo && navigation.navigate(navigateTo);

      func && dispatch(func());
    }
  }, [error, message, dispatch]);

  return loading;
};

export const useSetCategories = (setCategories, isFocused) => {
  useEffect(() => {
    axios
      .get(`${server}/product/categories`)
      .then((res) => {
        setCategories(res.data.categories);
      })
      .catch((e) => {
        Toast.show({
          type: "error",
          text1: e.response.data.message,
        });
      });
  }, [isFocused]);
};

export const useGetOrders = (isFocused, isAdmin = false) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${server}/order/${isAdmin ? "admin" : "my"}`)
      .then((res) => {
        setOrders(res.data.orders);
        setLoading(false);
      })
      .catch((e) => {
        Toast.show({
          type: "error",
          text1: e.response.data.message,
        });
        setLoading(false);
      });
  }, [isFocused]);

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
        const response = await axios.get(`${server}/order/dailySales`);
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
        const response = await axios.get(`${server}/order/geographicSales`);
        setGeographicSalesData(response.data.salesByCity);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        setGeographicSalesData([]); // Set GeographicSalesData to empty array in case of error
      }
    };

    fetchGeographicSalesData();
  }, [setGeographicSalesData]);
};
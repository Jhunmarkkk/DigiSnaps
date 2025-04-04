import axios from "axios";
import { server } from "../store";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const updatePassword =
  (oldPassword, newPassword) => async (dispatch) => {
    try {
      dispatch({
        type: "updatePasswordRequest",
      });

      const { data } = await axios.put(
        `${server}/user/changepassword`,
        {
          oldPassword,
          newPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      dispatch({
        type: "updatePasswordSuccess",
        payload: data.message,
      });
    } catch (error) {
      dispatch({
        type: "updatePasswordFail",
        payload: error.response?.data?.message || "Failed to update password",
      });
    }
  };

export const updateProfile =
  (name, email, address, city, country, pinCode) => async (dispatch) => {
    try {
      dispatch({
        type: "updateProfileRequest",
      });

      const { data } = await axios.put(
        `${server}/user/updateprofile`,
        {
          name,
          email,
          address,
          city,
          country,
          pinCode,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      dispatch({
        type: "updateProfileSuccess",
        payload: data.message,
      });
    } catch (error) {
      dispatch({
        type: "updateProfileFail",
        payload: error.response?.data?.message || "Failed to update profile",
      });
    }
  };

export const updatePic = (formData) => async (dispatch) => {
  try {
    dispatch({
      type: "updatePicRequest",
    });

    const { data } = await axios.put(`${server}/user/updatepicture`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    dispatch({
      type: "updatePicSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "updatePicFail",
      payload: error.response?.data?.message || "Failed to update profile picture",
    });
  }
};

export const placeOrder =
  (
    orderItems,
    shippingInfo,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingCharges,
    totalAmount,
    paymentInfo
  ) =>
  async (dispatch) => {
    try {
      dispatch({
        type: "placeOrderRequest",
      });

      const { data } = await axios.post(
        `${server}/order/new`,
        {
          shippingInfo,
          orderItems,
          paymentMethod,
          paymentInfo,
          itemsPrice,
          taxPrice,
          shippingCharges,
          totalAmount,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      dispatch({
        type: "placeOrderSuccess",
        payload: data.message,
      });
    } catch (error) {
      dispatch({
        type: "placeOrderFail",
        payload: error.response?.data?.message || "Failed to place order",
      });
    }
  };

export const processOrder = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "processOrderRequest",
    });

    const { data } = await axios.put(
      `${server}/order/single/${id}`,
      {}
    );
    dispatch({
      type: "processOrderSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "processOrderFail",
      payload: error.response?.data?.message || "Failed to process order",
    });
  }
};

export const addCategory = (formData) => async (dispatch) => {
  try {
    dispatch({
      type: "addCategoryRequest",
    });

    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error("Please login first");
    }

    const { data } = await axios.post(`${server}/product/category`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": `Bearer ${token}`
      },
      withCredentials: false
    });

    dispatch({
      type: "addCategorySuccess",
      payload: data.message,
    });
  } catch (error) {
    console.error("Add category error:", error);
    dispatch({
      type: "addCategoryFail",
      payload: error.response?.data?.message || "Failed to add category",
    });
  }
};

export const deleteCategory = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteCategoryRequest",
    });

    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error("Please login first");
    }

    const { data } = await axios.delete(
      `${server}/product/category/${id}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`
        },
        withCredentials: false,
      }
    );
    dispatch({
      type: "deleteCategorySuccess",
      payload: data.message,
    });
  } catch (error) {
    console.error("Delete category error:", error);
    dispatch({
      type: "deleteCategoryFail",
      payload: error.response?.data?.message || "Failed to delete category",
    });
  }
};

export const updateCategoryImage =
  (categoryId, formData) => async (dispatch) => {
    try {
      dispatch({
        type: "updateCategoryImageRequest",
      });

      const { data } = await axios.post(
        `${server}/category/images/${categoryId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      dispatch({
        type: "updateCategoryImageSuccess",
        payload: data.message,
      });
    } catch (error) {
      dispatch({
        type: "updateCategoryImageFail",
        payload: error.response.data.message,
      });
    }
  };

export const getCategoryDetails = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "getCategoryDetailsRequest",
    });

    // Axios request
    const { data } = await axios.get(`${server}/product/category/${id}`, {
      withCredentials: true,
    });

    dispatch({
      type: "getCategoryDetailsSuccess",
      payload: data.category,
    });
  } catch (error) {
    dispatch({
      type: "getCategoryDetailsFail",
      payload: error.response.data.message,
    });
  }
};

export const updateCategory = (id, category) => async (dispatch) => {
  try {
    dispatch({
      type: "updateCategoryRequest",
    });
    const { data } = await axios.put(
      `${server}/product/category/${id}`,
      {
        category,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    dispatch({
      type: "updateCategorySuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "updateProductFail",
      payload: error.response.data.message,
    });
  }
};

export const createProduct = (formData) => async (dispatch) => {
  try {
    dispatch({
      type: "addProductRequest",
    });

    const { data } = await axios.post(`${server}/product/new`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });

    dispatch({
      type: "addProductSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "addProductFail",
      payload: error.response.data.message,
    });
  }
};
export const updateProduct =
  (id, name, description, price, stock, category) => async (dispatch) => {
    try {
      dispatch({
        type: "updateProductRequest",
      });
      const { data } = await axios.put(
        `${server}/product/single/${id}`,
        {
          name,
          description,
          price,
          stock,
          category,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      dispatch({
        type: "updateProductSuccess",
        payload: data.message,
      });
    } catch (error) {
      dispatch({
        type: "updateProductFail",
        payload: error.response.data.message,
      });
    }
  };

export const updateProductImage = (productId, formData) => async (dispatch) => {
  try {
    dispatch({
      type: "updateProductImageRequest",
    });

    const { data } = await axios.post(
      `${server}/product/images/${productId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );

    dispatch({
      type: "updateProductImageSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "updateProductImageFail",
      payload: error.response.data.message,
    });
  }
};

export const deleteProductImage = (productId, imageId) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteProductImageRequest",
    });

    const { data } = await axios.delete(
      `${server}/product/images/${productId}?id=${imageId}`,
      {
        withCredentials: true,
      }
    );

    dispatch({
      type: "deleteProductImageSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "deleteProductImageFail",
      payload: error.response.data.message,
    });
  }
};

export const deleteProduct = (productId) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteProductRequest",
    });

    const { data } = await axios.delete(
      `${server}/product/single/${productId}`,
      {
        withCredentials: true,
      }
    );

    dispatch({
      type: "deleteProductSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "deleteProductFail",
      payload: error.response.data.message,
    });
  }
};

export const forgetPassword = (email) => async (dispatch) => {
  try {
    dispatch({
      type: "forgetPasswordRequest",
    });
    const { data } = await axios.post(
      `${server}/user/forgetpassword`,
      {
        email,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    dispatch({
      type: "forgetPasswordSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "forgetPasswordFail",
      payload: error.response?.data?.message || "Failed to send password reset email",
    });
  }
};

export const resetPassword = (otp, password) => async (dispatch) => {
  try {
    dispatch({
      type: "resetPasswordRequest",
    });
    const { data } = await axios.put(
      `${server}/user/forgetpassword`,
      {
        otp,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    dispatch({
      type: "resetPasswordSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "resetPasswordFail",
      payload: error.response?.data?.message || "Failed to reset password",
    });
  }
};

export const addReview = (formData) => async (dispatch) => {
  try {
    dispatch({
      type: "addReviewRequest",
    });

    const { data } = await axios.post(`${server}/review/create`, formData, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    // Log the data if the request is successful
    console.log("Data after review addition:", data);

    dispatch({
      type: "addReviewSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "addReviewFail",
      payload: error.response.data.message,
    });
  }
};

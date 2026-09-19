import { Platform } from "react-native";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://freshmartapp.onrender.com";

export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/registration`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  },
  PRODUCTS: {
    LIST: `${API_BASE_URL}/api/product/list`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/product/${id}`,
  },
  REVIEWS: {
    GET: (productId: string) => `${API_BASE_URL}/api/review/${productId}`,
    ADD: `${API_BASE_URL}/api/review/add`,
  },
  CART: {
    GET: `${API_BASE_URL}/api/cart/get`,
    ADD: `${API_BASE_URL}/api/cart/add`,
    UPDATE: `${API_BASE_URL}/api/cart/update`,
  },
  ORDER: {
    PLACE: `${API_BASE_URL}/api/order/placeorder`,
    RAZORPAY: `${API_BASE_URL}/api/order/razorpay`,
    VERIFY_RAZORPAY: `${API_BASE_URL}/api/order/verifyrazorpay`,
    USER_ORDERS: `${API_BASE_URL}/api/order/userorder`,
  },
  SETTINGS: {
    GET_BANNERS: `${API_BASE_URL}/api/setting/banners`,
  },
};


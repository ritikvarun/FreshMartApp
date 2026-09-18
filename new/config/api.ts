import { Platform } from "react-native";

// If EXPO_PUBLIC_API_URL is configured in .env, use it; otherwise fallback to local Wi-Fi IP / emulator IP
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "android"
    ? "http://10.0.2.2:5000"
    : "http://localhost:5000");

export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/registration`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  },
  PRODUCTS: {
    LIST: `${API_BASE_URL}/api/product/list`,
  },
  CART: {
    GET: `${API_BASE_URL}/api/cart/get`,
    ADD: `${API_BASE_URL}/api/cart/add`,
    UPDATE: `${API_BASE_URL}/api/cart/update`,
  },
  ORDER: {
    PLACE: `${API_BASE_URL}/api/order/placeorder`,
    USER_ORDERS: `${API_BASE_URL}/api/order/userorder`,
  },
};


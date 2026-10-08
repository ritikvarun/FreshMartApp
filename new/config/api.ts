import { Platform } from "react-native";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://freshmartapp.onrender.com";

export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/registration`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  },
  USER: {
    GET_CURRENT: `${API_BASE_URL}/api/user/getcurrentuser`,
    UPDATE_PROFILE: `${API_BASE_URL}/api/user/updateprofile`,
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
  RETURN: {
    REQUEST: `${API_BASE_URL}/api/return/request`,
    MY_RETURNS: `${API_BASE_URL}/api/return/my`,
  },
  SETTINGS: {
    GET_BANNERS: `${API_BASE_URL}/api/setting/banners`,
    GET_HOME_SECTIONS: `${API_BASE_URL}/api/setting/home-sections`,
  },
  SHOPS: {
    LIST: `${API_BASE_URL}/api/shop/list`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/shop/${id}`,
    REGISTER: `${API_BASE_URL}/api/shop/register`,
    LOGIN: `${API_BASE_URL}/api/shop/login`,
    ADD_PRODUCT: `${API_BASE_URL}/api/shop/add-product`,
    MY_PRODUCTS: (shopId: string) =>
      `${API_BASE_URL}/api/shop/my-products/${shopId}`,
    TOGGLE_OPEN: `${API_BASE_URL}/api/shop/toggle-open`,
  },
  DELIVERY: {
    REGISTER: `${API_BASE_URL}/api/delivery/register`,
    LOGIN: `${API_BASE_URL}/api/delivery/login`,
    TOGGLE_ONLINE: `${API_BASE_URL}/api/delivery/toggle-online`,
    AVAILABLE_ORDERS: `${API_BASE_URL}/api/delivery/available-orders`,
    ACCEPT_ORDER: `${API_BASE_URL}/api/delivery/accept-order`,
    UPDATE_STATUS: `${API_BASE_URL}/api/delivery/update-status`,
    UPDATE_LOCATION: `${API_BASE_URL}/api/delivery/update-location`,
  },
};

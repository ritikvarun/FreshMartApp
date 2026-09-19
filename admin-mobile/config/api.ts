import { Platform } from "react-native";

export const API_BASE_URL =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL) ||
  "https://freshmartapp.onrender.com";

export const ENDPOINTS = {
  ADMIN_LOGIN: `${API_BASE_URL}/api/auth/adminlogin`,
  GET_ADMIN: `${API_BASE_URL}/api/user/getadmin`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  PRODUCTS: {
    LIST: `${API_BASE_URL}/api/product/list`,
    ADD: `${API_BASE_URL}/api/product/addproduct`,
    REMOVE: (id: string) => `${API_BASE_URL}/api/product/remove/${id}`,
  },
  ORDERS: {
    LIST: `${API_BASE_URL}/api/order/list`,
    STATUS: `${API_BASE_URL}/api/order/status`,
  },
  RETURNS: {
    ALL: `${API_BASE_URL}/api/return/all`,
    UPDATE: `${API_BASE_URL}/api/return/update`,
  },
  SETTINGS: {
    GET: `${API_BASE_URL}/api/setting`,
    GET_BANNERS: `${API_BASE_URL}/api/setting/banners`,
    UPDATE_IMAGE: `${API_BASE_URL}/api/setting/update-image`,
    UPDATE_BANNER: `${API_BASE_URL}/api/setting/update-banner`,
  },
};

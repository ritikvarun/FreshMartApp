// FreshMart Admin Web API Configuration

const isProduction = Boolean((import.meta as any).env?.PROD);

export const API_BASE_URL: string =
  (import.meta as any).env?.VITE_API_URL ||
  (isProduction
    ? "https://freshmartapp.onrender.com"
    : "http://localhost:5000");

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
    ASSIGN_DELIVERY: `${API_BASE_URL}/api/order/assign-delivery`,
    INVOICE: (orderId: string) =>
      `${API_BASE_URL}/api/order/invoice/${orderId}`,
  },
  RETURNS: {
    ALL: `${API_BASE_URL}/api/return/all`,
    UPDATE: `${API_BASE_URL}/api/return/update`,
  },
  SETTINGS: {
    GET: `${API_BASE_URL}/api/setting`,
    GET_BANNERS: `${API_BASE_URL}/api/setting/banners`,
    GET_HOME_SECTIONS: `${API_BASE_URL}/api/setting/home-sections`,
    UPDATE_HOME_SECTIONS: `${API_BASE_URL}/api/setting/home-sections`,
    UPDATE_IMAGE: `${API_BASE_URL}/api/setting/update-image`,
    UPDATE_BANNER: `${API_BASE_URL}/api/setting/update-banner`,
  },
  SHOPS: {
    ALL: `${API_BASE_URL}/api/shop/admin/all`,
    APPROVE: `${API_BASE_URL}/api/shop/admin/status`,
  },
  DELIVERY: {
    ALL: `${API_BASE_URL}/api/delivery/admin/all`,
    APPROVE: `${API_BASE_URL}/api/delivery/admin/status`,
  },
  SPLITS: {
    SUMMARY: `${API_BASE_URL}/api/order/splits-summary`,
    ASSIGN_DELIVERY: `${API_BASE_URL}/api/order/assign-delivery`,
  },
};

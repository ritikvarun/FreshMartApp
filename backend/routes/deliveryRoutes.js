import express from "express";
import {
  registerDeliveryPartner,
  loginDeliveryPartner,
  toggleOnlineStatus,
  updateLocation,
  getAvailableOrders,
  acceptOrder,
  updateDeliveryStatus,
  adminGetAllDeliveryPartners,
  adminApproveDeliveryPartner,
} from "../controller/deliveryController.js";
import adminAuth from "../middleware/adminAuth.js";
import deliveryAuth from "../middleware/deliveryAuth.js";

const deliveryRoutes = express.Router();

// Partner Auth & Operations
deliveryRoutes.post("/register", registerDeliveryPartner);
deliveryRoutes.post("/login", loginDeliveryPartner);
deliveryRoutes.post("/toggle-online", deliveryAuth, toggleOnlineStatus);
deliveryRoutes.post("/update-location", deliveryAuth, updateLocation);
deliveryRoutes.get("/available-orders", deliveryAuth, getAvailableOrders);
deliveryRoutes.post("/accept-order", deliveryAuth, acceptOrder);
deliveryRoutes.post("/update-status", deliveryAuth, updateDeliveryStatus);

// Admin routes
deliveryRoutes.get("/admin/all", adminAuth, adminGetAllDeliveryPartners);
deliveryRoutes.post("/admin/status", adminAuth, adminApproveDeliveryPartner);

export default deliveryRoutes;

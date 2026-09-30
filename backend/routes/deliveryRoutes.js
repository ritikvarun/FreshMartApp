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

const deliveryRoutes = express.Router();

// Partner Auth & Operations
deliveryRoutes.post("/register", registerDeliveryPartner);
deliveryRoutes.post("/login", loginDeliveryPartner);
deliveryRoutes.post("/toggle-online", toggleOnlineStatus);
deliveryRoutes.post("/update-location", updateLocation);
deliveryRoutes.get("/available-orders", getAvailableOrders);
deliveryRoutes.post("/accept-order", acceptOrder);
deliveryRoutes.post("/update-status", updateDeliveryStatus);

// Admin routes
deliveryRoutes.get("/admin/all", adminAuth, adminGetAllDeliveryPartners);
deliveryRoutes.post("/admin/status", adminAuth, adminApproveDeliveryPartner);

export default deliveryRoutes;

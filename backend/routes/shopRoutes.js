import express from "express";
import {
  registerShop,
  loginShop,
  getActiveShops,
  getShopWithProducts,
  adminGetAllShops,
  adminApproveShop,
} from "../controller/shopController.js";
import adminAuth from "../middleware/adminAuth.js";

const shopRoutes = express.Router();

// Public / Customer App routes
shopRoutes.get("/list", getActiveShops);
shopRoutes.get("/:id", getShopWithProducts);

// Shop Partner Auth routes
shopRoutes.post("/register", registerShop);
shopRoutes.post("/login", loginShop);

// Admin routes
shopRoutes.get("/admin/all", adminAuth, adminGetAllShops);
shopRoutes.post("/admin/status", adminAuth, adminApproveShop);

export default shopRoutes;

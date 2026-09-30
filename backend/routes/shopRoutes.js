import express from "express";
import {
  registerShop,
  loginShop,
  getActiveShops,
  getShopWithProducts,
  adminGetAllShops,
  adminApproveShop,
  addShopProduct,
  getMyShopProducts,
  toggleShopOpen,
} from "../controller/shopController.js";
import adminAuth from "../middleware/adminAuth.js";

const shopRoutes = express.Router();

// Public / Customer App routes
shopRoutes.get("/list", getActiveShops);
shopRoutes.get("/:id", getShopWithProducts);

// Shop Partner Auth & Management routes
shopRoutes.post("/register", registerShop);
shopRoutes.post("/login", loginShop);
shopRoutes.post("/add-product", addShopProduct);
shopRoutes.get("/my-products/:shopId", getMyShopProducts);
shopRoutes.post("/toggle-open", toggleShopOpen);

// Admin routes
shopRoutes.get("/admin/all", adminAuth, adminGetAllShops);
shopRoutes.post("/admin/status", adminAuth, adminApproveShop);

export default shopRoutes;

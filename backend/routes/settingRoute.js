import express from "express"
import { getSettings, getBanners, updateBanner, updateSettingImage } from "../controller/settingController.js"
import adminAuth from "../middleware/adminAuth.js"
import upload from "../middleware/multer.js"

const settingRouter = express.Router()

// Public route to fetch settings & banners (for frontend customer app)
settingRouter.get("/", getSettings)
settingRouter.get("/banners", getBanners)

// Admin routes to update settings and banners
settingRouter.post("/update-image", adminAuth, upload.fields([{ name: 'image', maxCount: 1 }]), updateSettingImage)
settingRouter.post("/update-banner", adminAuth, upload.fields([{ name: 'image', maxCount: 1 }]), updateBanner)

export default settingRouter

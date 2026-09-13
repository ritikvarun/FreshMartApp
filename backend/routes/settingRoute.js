import express from "express"
import { getSettings, updateSettingImage } from "../controller/settingController.js"
import adminAuth from "../middleware/adminAuth.js"
import upload from "../middleware/multer.js"

const settingRouter = express.Router()

// Public route to fetch settings (for frontend)
settingRouter.get("/", getSettings)

// Admin route to update an image setting
settingRouter.post("/update-image", adminAuth, upload.fields([{ name: 'image', maxCount: 1 }]), updateSettingImage)

export default settingRouter

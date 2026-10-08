import express from "express"
import isAuth from "../middleware/isAuth.js"
import { getAdmin, getCurrentUser, updateProfile } from "../controller/userController.js"
import adminAuth from "../middleware/adminAuth.js"
import upload from "../middleware/multer.js"

let userRoutes = express.Router()

userRoutes.get("/getcurrentuser", isAuth, getCurrentUser)
userRoutes.post("/updateprofile", isAuth, upload.single("image"), updateProfile)
userRoutes.get("/getadmin", adminAuth, getAdmin)

export default userRoutes
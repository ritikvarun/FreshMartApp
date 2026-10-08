import path from "path"
import uploadOnCloudinary from "../config/cloudinary.js"
import User from "../model/userModel.js"


export const getCurrentUser = async (req,res) => {
    try {
        let user = await User.findById(req.userId).select("-password")
        if(!user){
           return res.status(404).json({message:"user is not found"}) 
        }
        return res.status(200).json(user)
    } catch (error) {
         console.log(error)
    return res.status(500).json({message:`getCurrentUser error ${error}`})
    }
}

export const updateProfile = async (req, res) => {
    try {
        const userId = req.userId
        const { name, phone } = req.body

        const updateData = {}
        if (name && name.trim()) updateData.name = name.trim()
        if (phone !== undefined) updateData.phone = phone.trim()

        if (req.file) {
            try {
                const cloudUrl = await uploadOnCloudinary(req.file.path, "freshmart_avatars")
                updateData.image = cloudUrl
            } catch (uploadErr) {
                console.warn("Cloudinary upload failed, fallback to local url:", uploadErr.message)
                const host = req.get("host") || "localhost:5000"
                const filename = path.basename(req.file.path)
                updateData.image = `${req.protocol}://${host}/public/${filename}`
            }
        } else if (req.body.image) {
            updateData.image = req.body.image
        }

        const user = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).select("-password")
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        return res.status(200).json(user)
    } catch (error) {
        console.error("updateProfile error:", error)
        return res.status(500).json({ message: `updateProfile error: ${error.message}` })
    }
}

export const getAdmin = async (req,res) => {
    try {
        let adminEmail = req.adminEmail;
        if(!adminEmail){
            return res.status(404).json({message:"Admin is not found"}) 
        }
        return res.status(201).json({
            email:adminEmail,
            role:"admin"
        })
    } catch (error) {
        console.log(error)
    return res.status(500).json({message:`getAdmin error ${error}`})
    }
}
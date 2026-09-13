import Setting from "../model/settingModel.js"
import uploadOnCloudinary from "../config/cloudinary.js"

// Fetch all settings as key-value pairs
export const getSettings = async (req, res) => {
    try {
        const settings = await Setting.find({})
        const settingsObj = Object.fromEntries(settings.map(s => [s.key, s.value]))
        return res.status(200).json(settingsObj)
    } catch (error) {
        console.error("GetSettings error:", error)
        return res.status(500).json({ message: `GetSettings error: ${error.message}` })
    }
}

// Update an image setting via Cloudinary
export const updateSettingImage = async (req, res) => {
    try {
        const { key } = req.body
        if (!key) return res.status(400).json({ message: "Setting 'key' is required" })
        if (!req.files || !req.files.image) return res.status(400).json({ message: "No image file provided" })

        const imagePath = req.files.image[0].path
        const cloudinaryUrl = await uploadOnCloudinary(imagePath)

        if (!cloudinaryUrl) return res.status(500).json({ message: "Cloudinary upload failed" })

        // Update or create setting
        const setting = await Setting.findOneAndUpdate(
            { key },
            { value: cloudinaryUrl },
            { new: true, upsert: true }
        )

        return res.status(200).json({ message: "Setting updated", setting })
    } catch (error) {
        console.error("UpdateSettingImage error:", error)
        return res.status(500).json({ message: `UpdateSettingImage error: ${error.message}` })
    }
}

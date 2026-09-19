import Setting from "../model/settingModel.js"
import uploadOnCloudinary from "../config/cloudinary.js"
import path from "path"

const DEFAULT_BANNERS = [
  {
    id: "slide1",
    badge: "SUMMER DROP '26",
    title: "Urban Street",
    discount: "40%",
    offText: "OFF",
    btnText: "Shop Collection",
    categoryFilter: "Men",
    bgColor: "#F3F4F6",
    accentColor: "#111827",
    btnBg: "#111827",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
  },
  {
    id: "slide2",
    badge: "EXCLUSIVE DEALS",
    title: "Sneaker Fest",
    discount: "50%",
    offText: "OFF",
    btnText: "Grab Now",
    categoryFilter: "Shoes",
    bgColor: "#EEF2FF",
    accentColor: "#4F46E5",
    btnBg: "#4F46E5",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
  },
  {
    id: "slide3",
    badge: "TRENDING NOW",
    title: "Floral Elegance",
    discount: "30%",
    offText: "OFF",
    btnText: "Explore Now",
    categoryFilter: "Women",
    bgColor: "#FFF1F2",
    accentColor: "#E11D48",
    btnBg: "#E11D48",
    imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80",
  },
  {
    id: "slide4",
    badge: "MINIMAL AESTHETICS",
    title: "Linen & Casuals",
    discount: "25%",
    offText: "OFF",
    btnText: "Discover",
    categoryFilter: "Men",
    bgColor: "#FEF3C7",
    accentColor: "#D97706",
    btnBg: "#D97706",
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
  },
  {
    id: "slide5",
    badge: "PREMIUM ACCESSORIES",
    title: "Watches & Bags",
    discount: "35%",
    offText: "OFF",
    btnText: "View Deals",
    categoryFilter: "Accessories",
    bgColor: "#ECFDF5",
    accentColor: "#059669",
    btnBg: "#059669",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
  },
];

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

// Fetch 5 homepage promotional banners
export const getBanners = async (req, res) => {
    try {
        const setting = await Setting.findOne({ key: "homeBanners" });
        if (setting && Array.isArray(setting.value) && setting.value.length > 0) {
            return res.status(200).json(setting.value);
        }
        return res.status(200).json(DEFAULT_BANNERS);
    } catch (error) {
        console.error("GetBanners error:", error);
        return res.status(500).json({ message: `GetBanners error: ${error.message}` });
    }
};

// Update an individual banner slot (0 to 4)
export const updateBanner = async (req, res) => {
    try {
        const { slotIndex, title, badge, discount, offText, categoryFilter, btnText, imageUrl } = req.body;
        const idx = Number(slotIndex);

        if (isNaN(idx) || idx < 0 || idx > 4) {
            return res.status(400).json({ message: "Invalid slotIndex (must be between 0 and 4)" });
        }

        let resolvedImage = imageUrl;
        if (req.files && req.files.image && req.files.image.length > 0) {
            const imagePath = req.files.image[0].path;
            try {
                resolvedImage = await uploadOnCloudinary(imagePath, "shopx_banners");
            } catch (err) {
                console.warn("Cloudinary upload failed, using local public fallback:", err.message);
                const host = req.get("host") || "localhost:5000";
                const filename = path.basename(imagePath);
                resolvedImage = `${req.protocol}://${host}/public/${filename}`;
            }
        }

        let setting = await Setting.findOne({ key: "homeBanners" });
        let currentBanners = (setting && Array.isArray(setting.value) && setting.value.length === 5)
            ? [...setting.value]
            : [...DEFAULT_BANNERS];

        currentBanners[idx] = {
            ...currentBanners[idx],
            id: `slide${idx + 1}`,
            title: title !== undefined ? title : currentBanners[idx].title,
            badge: badge !== undefined ? badge : currentBanners[idx].badge,
            discount: discount !== undefined ? discount : currentBanners[idx].discount,
            offText: offText !== undefined ? offText : (currentBanners[idx].offText || "OFF"),
            categoryFilter: categoryFilter !== undefined ? categoryFilter : currentBanners[idx].categoryFilter,
            btnText: btnText !== undefined ? btnText : currentBanners[idx].btnText,
            imageUrl: resolvedImage || currentBanners[idx].imageUrl,
        };

        const updated = await Setting.findOneAndUpdate(
            { key: "homeBanners" },
            { value: currentBanners },
            { new: true, upsert: true }
        );

        return res.status(200).json({ message: "Banner updated successfully", banners: updated.value });
    } catch (error) {
        console.error("UpdateBanner error:", error);
        return res.status(500).json({ message: `UpdateBanner error: ${error.message}` });
    }
};

// Update an image setting via Cloudinary (legacy support)
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

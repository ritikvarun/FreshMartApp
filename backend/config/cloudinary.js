import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

export const configureCloudinary = () => {
    const cloudName = process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY || process.env.API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET;

    if (process.env.CLOUDINARY_URL) {
        cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
        return { configured: true };
    }

    if (!cloudName || !apiKey || !apiSecret) {
        const missing = [];
        if (!cloudName) missing.push("CLOUDINARY_NAME / CLOUDINARY_CLOUD_NAME");
        if (!apiKey) missing.push("CLOUDINARY_API_KEY");
        if (!apiSecret) missing.push("CLOUDINARY_API_SECRET");
        return { 
            configured: false, 
            missing, 
            error: `Missing Cloudinary environment variables: ${missing.join(", ")}` 
        };
    }

    cloudinary.config({
        cloud_name: cloudName.trim(),
        api_key: apiKey.trim(),
        api_secret: apiSecret.trim()
    });

    return { configured: true, cloudName: cloudName.trim() };
};

export const pingCloudinary = async () => {
    const configStatus = configureCloudinary();
    if (!configStatus.configured) {
        return { success: false, error: configStatus.error, missing: configStatus.missing };
    }
    try {
        const pingResult = await cloudinary.api.ping();
        return { success: true, pingResult, cloudName: configStatus.cloudName };
    } catch (err) {
        return { success: false, error: err.message || err };
    }
};

const uploadOnCloudinary = async (filePath, folderName = "shopx") => {
    const configStatus = configureCloudinary();
    if (!configStatus.configured) {
        try { if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) {}
        console.error("Cloudinary Configuration Error:", configStatus.error);
        throw new Error(configStatus.error);
    }

    if (!filePath || !fs.existsSync(filePath)) {
        console.error("Cloudinary Upload Error: Local file does not exist at:", filePath);
        throw new Error(`Local file not found for upload: ${filePath}`);
    }

    try {
        console.log(`Cloudinary: Uploading '${filePath}' to folder '${folderName}'...`);
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            folder: folderName,
            resource_type: "image"
        });

        console.log("Cloudinary Upload Success! URL:", uploadResult.secure_url);
        return uploadResult.secure_url;
    } catch (error) {
        console.error("Cloudinary Upload Failed Error:", error.message || error);
        throw new Error(`Cloudinary upload failed: ${error.message || error}`);
    } finally {
        try {
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (e) {
            /* ignore cleanup error */
        }
    }
};

export default uploadOnCloudinary;
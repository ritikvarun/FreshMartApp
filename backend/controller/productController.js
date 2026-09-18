import path from "path"
import uploadOnCloudinary from "../config/cloudinary.js"
import Product from "../model/productModel.js"


export const addProduct = async (req, res) => {
    try {
        console.log("addProduct called")
        console.log("req.body:", req.body)
        console.log("req.files:", req.files ? Object.keys(req.files) : "No files")

        let { name, description, price, category, subCategory, sizes, bestseller } = req.body

        if (!name || !description || !price || !category || !subCategory || !sizes) {
            return res.status(400).json({ message: "All fields are required" })
        }

        // Helper to get file path for expected image fields
        const getFilePath = (field) => {
            if (req.files && req.files[field] && Array.isArray(req.files[field]) && req.files[field].length > 0) {
                return req.files[field][0].path
            }
            return null
        }

        const image1Path = getFilePath('image1')
        const image2Path = getFilePath('image2')
        const image3Path = getFilePath('image3')
        const image4Path = getFilePath('image4')
        const image5Path = getFilePath('image5')

        // Resolve Image URLs (Cloudinary first, local public folder fallback)
        const resolveImageUrl = async (field, filePath, fallback = null) => {
            if (filePath) {
                try {
                    return await uploadOnCloudinary(filePath, "shopx")
                } catch (uploadErr) {
                    console.warn(`Cloudinary for ${field} failed, using local public url:`, uploadErr.message)
                    const host = req.get("host") || "localhost:5000"
                    const filename = path.basename(filePath)
                    return `${req.protocol}://${host}/public/${filename}`
                }
            }
            return req.body[field] || fallback
        }

        let image1 = await resolveImageUrl("image1", image1Path, req.body.image1)
        if (!image1) {
            return res.status(400).json({ message: "Primary product image (Image 1) is required" })
        }

        let image2 = await resolveImageUrl("image2", image2Path, image1)
        let image3 = await resolveImageUrl("image3", image3Path, image1)
        let image4 = await resolveImageUrl("image4", image4Path, image1)
        let image5 = await resolveImageUrl("image5", image5Path, image1)

        let parsedSizes = []
        try {
            parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes
        } catch (e) {
            parsedSizes = Array.isArray(sizes) ? sizes : [sizes]
        }
        
        let productData = {
            name,
            description,
            price: Number(price),
            category,
            subCategory,
            sizes: parsedSizes,
            bestseller: bestseller === "true" || bestseller === true,
            date: Date.now(),
            image1,
            image2,
            image3,
            image4,
            image5
        }

        const product = await Product.create(productData)
        console.log("Product created successfully:", product._id)

        return res.status(201).json(product)

    } catch (error) {
        console.error("AddProduct error:", error)
        return res.status(500).json({ message: `AddProduct error: ${error.message}` })
    }
}


export const listProduct = async (req,res) => {
     
    try {
        const product = await Product.find({});
        return res.status(200).json(product)

    } catch (error) {
        console.log("ListProduct error")
    return res.status(500).json({message:`ListProduct error ${error}`})
    }
}

export const removeProduct = async (req,res) => {
    try {
        let {id} = req.params;
        const product = await Product.findByIdAndDelete(id)
         return res.status(200).json(product)
    } catch (error) {
        console.log("RemoveProduct error")
    return res.status(500).json({message:`RemoveProduct error ${error}`})
    }
    
}

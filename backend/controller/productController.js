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

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: "No files received: check multipart/form-data and that files are attached" })
        }

        // Helper to get file path for expected image fields
        const getFilePath = (field) => {
            if (req.files[field] && Array.isArray(req.files[field]) && req.files[field].length > 0) {
                return req.files[field][0].path
            }
            return null
        }

        const image1Path = getFilePath('image1')
        const image2Path = getFilePath('image2')
        const image3Path = getFilePath('image3')
        const image4Path = getFilePath('image4')

        if (!image1Path) {
            return res.status(400).json({ message: "Primary product image (Image 1) is required" })
        }

        let image1, image2, image3, image4

        try {
            image1 = await uploadOnCloudinary(image1Path, "shopx")
        } catch (uploadErr) {
            console.error("Image 1 upload failed:", uploadErr)
            return res.status(500).json({ message: `Image 1 upload failed: ${uploadErr.message}` })
        }

        try {
            image2 = image2Path ? await uploadOnCloudinary(image2Path, "shopx") : image1
        } catch (uploadErr) {
            console.error("Image 2 upload failed, falling back to Image 1:", uploadErr)
            image2 = image1
        }

        try {
            image3 = image3Path ? await uploadOnCloudinary(image3Path, "shopx") : image1
        } catch (uploadErr) {
            console.error("Image 3 upload failed, falling back to Image 1:", uploadErr)
            image3 = image1
        }

        try {
            image4 = image4Path ? await uploadOnCloudinary(image4Path, "shopx") : image1
        } catch (uploadErr) {
            console.error("Image 4 upload failed, falling back to Image 1:", uploadErr)
            image4 = image1
        }

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
            image4
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

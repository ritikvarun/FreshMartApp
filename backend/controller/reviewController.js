import Review from "../model/reviewModel.js"
import Order from "../model/orderModel.js"

// Add a review for a product
export const addReview = async (req, res) => {
    try {
        const userId = req.userId
        const { productId, rating, comment } = req.body

        if (!productId || !rating || !comment) {
            return res.status(400).json({ message: "Product ID, rating, and comment are required" })
        }

        // Verify that the user has ordered this product before
        // An order should have `userId` and its `items` array should contain the `productId`
        const userOrders = await Order.find({ userId })
        
        let hasPurchased = false;
        outerLoop: for (const order of userOrders) {
            for (const item of (order.items || [])) {
                const itemId = item._id ? item._id.toString() : (item.id ? item.id.toString() : '')
                if (itemId && itemId === productId.toString()) {
                    hasPurchased = true;
                    break outerLoop;
                }
            }
        }

        if (!hasPurchased) {
            return res.status(403).json({ message: "You can only review products you have purchased." })
        }

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({ userId, productId })
        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this product." })
        }

        const newReview = new Review({
            userId,
            productId,
            rating: Number(rating),
            comment
        })

        await newReview.save()

        // Fetch populated review to return immediately
        const populatedReview = await Review.findById(newReview._id).populate('userId', 'name')

        return res.status(201).json({ message: "Review added successfully", review: populatedReview })

    } catch (error) {
        console.error("AddReview error:", error)
        return res.status(500).json({ message: `AddReview error: ${error.message}` })
    }
}

// Get all reviews for a specific product
export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params

        const reviews = await Review.find({ productId }).populate('userId', 'name').sort({ createdAt: -1 })
        
        // Calculate average rating
        let totalRating = 0;
        reviews.forEach(r => totalRating += r.rating)
        const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0

        return res.status(200).json({
            reviews,
            averageRating: Number(averageRating),
            totalReviews: reviews.length
        })

    } catch (error) {
        console.error("GetProductReviews error:", error)
        return res.status(500).json({ message: `GetProductReviews error: ${error.message}` })
    }
}

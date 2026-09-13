import mongoose from "mongoose"

const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
}, { timestamps: true })

// Ensures a user can only leave ONE review per product
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true })

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema)

export default Review

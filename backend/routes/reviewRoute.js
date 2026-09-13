import express from "express"
import { addReview, getProductReviews } from "../controller/reviewController.js"
import isAuth from "../middleware/isAuth.js"

const reviewRouter = express.Router()

// adding a review requires authentication
reviewRouter.post("/add", isAuth, addReview)

// fetching reviews is public
reviewRouter.get("/:productId", getProductReviews)

export default reviewRouter

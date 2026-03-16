import express from "express";
import { getProductReviews, addReview, deleteReview, getProductRating } from "../controllers/reviewController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/product/:productId", getProductReviews);          // Public — see reviews
router.get("/product/:productId/rating", getProductRating);    // Public — avg rating
router.post("/", protect, addReview);                          // Protected — client only
router.delete("/:id", protect, deleteReview);                  // Protected — own reviews only

export default router;

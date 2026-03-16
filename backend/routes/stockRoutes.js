import express from "express";
import { getProductStockHistory, getBusinessStockHistory } from "../controllers/stockController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/product/:productId", protect, getProductStockHistory);    // Stock history for a specific product
router.get("/business", protect, getBusinessStockHistory);             // All stock history for logged-in business

export default router;

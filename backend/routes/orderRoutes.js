import express from "express";
import { getOrders, createOrder, updateOrderStatus, getBusinessOrders, getClientOrders } from "../controllers/orderController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getOrders);
router.get("/business", protect, getBusinessOrders);
router.get("/client", protect, getClientOrders);
router.post("/", protect, createOrder);
router.put("/:id/status", protect, updateOrderStatus);

export default router;

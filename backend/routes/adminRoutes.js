import express from "express";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/auth.js";
import {
  getStats,
  getAllUsers,
  getAllProducts,
  getAllOrders,
  deleteUser,
  adminDeleteProduct,
} from "../controllers/adminController.js";

const router = express.Router();

// All admin routes require valid JWT + admin role
router.use(protect, adminOnly);

router.get("/stats",    getStats);
router.get("/users",    getAllUsers);
router.get("/products", getAllProducts);
router.get("/orders",   getAllOrders);

router.delete("/users/:id",    deleteUser);
router.delete("/products/:id", adminDeleteProduct);

export default router;

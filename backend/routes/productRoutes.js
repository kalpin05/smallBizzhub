import express from "express";
import { addProduct, getProducts, getBusinessProducts, getProductsByBusiness, updateProduct, deleteProduct } from "../controllers/productController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/business", protect, getBusinessProducts);
router.get("/business/:businessId", getProductsByBusiness);   // public - for client view
router.post("/", protect, addProduct);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

export default router;

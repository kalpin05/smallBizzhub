import express from "express";
import { getCategories, addCategory, deleteCategory } from "../controllers/categoryController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getCategories);                    // Public — anyone can see categories
router.post("/", protect, addCategory);            // Protected — only logged-in users
router.delete("/:id", protect, deleteCategory);    // Protected

export default router;

import express from "express";
import {
  signup, login, getProfile, updateProfile, getBusinesses,
  forgotPassword, verifyOtp, resetPassword,
  changePassword, toggle2FA,
  saveNotificationPreferences, getNotificationPreferences
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

/* Password change (authenticated) */
router.put("/change-password", protect, changePassword);

/* 2FA toggle */
router.put("/toggle-2fa", protect, toggle2FA);

/* Notification preferences */
router.get("/notification-preferences", protect, getNotificationPreferences);
router.put("/notification-preferences", protect, saveNotificationPreferences);

router.get("/businesses", getBusinesses);

export default router;

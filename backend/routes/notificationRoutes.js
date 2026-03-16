import express from "express";
import supabase from "../config/supabase.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/* GET /api/notifications -- fetch notifications for logged-in user */
router.get("/", protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* PUT /api/notifications/:id/read -- mark a single notification as read */
router.put("/:id/read", protect, async (req, res) => {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", req.params.id)
      .eq("user_id", req.user.id);

    if (error) throw error;
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* PUT /api/notifications/read-all -- mark ALL notifications as read */
router.put("/read-all", protect, async (req, res) => {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", req.user.id);

    if (error) throw error;
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

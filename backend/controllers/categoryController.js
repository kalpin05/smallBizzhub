import supabase from "../config/supabase.js";

/* ═════════════════════════════════════════════════════════════
   CATEGORIES CONTROLLER
   ═════════════════════════════════════════════════════════════ */

/* ─── GET ALL CATEGORIES ────────────────────────────────── */
export const getCategories = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error("Get categories error:", err.message);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

/* ─── ADD CATEGORY ──────────────────────────────────────── */
export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Category name is required" });

    const { data, error } = await supabase
      .from("categories")
      .insert([{ name: name.trim() }])
      .select()
      .single();

    if (error) {
      if (error.message?.includes("duplicate") || error.code === "23505") {
        return res.status(400).json({ error: "Category already exists" });
      }
      throw error;
    }

    res.json({ message: "Category created", category: data });
  } catch (err) {
    console.error("Add category error:", err.message);
    res.status(500).json({ error: "Failed to add category" });
  }
};

/* ─── DELETE CATEGORY ───────────────────────────────────── */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
    res.json({ message: "Category deleted" });
  } catch (err) {
    console.error("Delete category error:", err.message);
    res.status(500).json({ error: "Failed to delete category" });
  }
};

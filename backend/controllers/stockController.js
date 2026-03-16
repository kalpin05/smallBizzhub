import supabase from "../config/supabase.js";

/* ═════════════════════════════════════════════════════════════
   STOCK HISTORY CONTROLLER
   ═════════════════════════════════════════════════════════════ */

/**
 * Log a stock change. Called internally from product and order controllers.
 * @param {string} productId - UUID of the product
 * @param {number} changeAmount - positive for restock, negative for sales/removal
 * @param {string} reason - description of why stock changed
 */
export async function logStockChange(productId, changeAmount, reason) {
  try {
    await supabase
      .from("stock_history")
      .insert([{ product_id: productId, change_amount: changeAmount, reason }]);
  } catch (err) {
    console.error("Stock history log error:", err.message);
  }
}

/* ─── GET STOCK HISTORY FOR A PRODUCT ───────────────────── */
export const getProductStockHistory = async (req, res) => {
  try {
    const { productId } = req.params;

    const { data, error } = await supabase
      .from("stock_history")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error("Get stock history error:", err.message);
    res.status(500).json({ error: "Failed to fetch stock history" });
  }
};

/* ─── GET ALL STOCK HISTORY FOR LOGGED-IN BUSINESS ──────── */
export const getBusinessStockHistory = async (req, res) => {
  try {
    // Get business id
    const { data: biz } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (!biz) return res.status(403).json({ error: "No business profile found" });

    // Get all products for this business
    const { data: products } = await supabase
      .from("products1")
      .select("id, name")
      .eq("business_id", biz.id);

    if (!products || products.length === 0) return res.json([]);

    const productIds = products.map(p => p.id);
    const productNameMap = {};
    products.forEach(p => { productNameMap[p.id] = p.name; });

    // Get stock history for all these products
    const { data, error } = await supabase
      .from("stock_history")
      .select("*")
      .in("product_id", productIds)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    // Attach product name
    const result = (data || []).map(entry => ({
      ...entry,
      product_name: productNameMap[entry.product_id] || "Unknown"
    }));

    res.json(result);
  } catch (err) {
    console.error("Get business stock history error:", err.message);
    res.status(500).json({ error: "Failed to fetch stock history" });
  }
};

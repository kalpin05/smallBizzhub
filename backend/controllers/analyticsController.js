import supabase from "../config/supabase.js";

export const getStats = async (req, res) => {
  try {
    // Try to get orders for this business
    const { data: orders, error } = await supabase
      .from("orders")
      .select("total, business_id")
      .eq("business_id", req.user.id);

    if (error) {
      console.error("Supabase error fetching analytics:", error);
      // Return default values if table doesn't exist or other error
      return res.json({
        totalOrders: 0,
        totalRevenue: 0
      });
    }

    const revenue = (orders || []).reduce(
      (sum, o) => sum + (parseFloat(o.total) || 0),
      0
    );

    res.json({
      totalOrders: orders ? orders.length : 0,
      totalRevenue: revenue
    });
  } catch (error) {
    console.error("Server error fetching analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

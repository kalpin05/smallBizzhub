import supabase from "../config/supabase.js";

/* ─── HELPER: get business id from user_id ─────────────────── */
async function getBusinessId(userId) {
  const { data, error } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  return { businessId: data?.id || null, error };
}


/* ─── GET ANALYTICS STATS ────────────────────────────────── */
export const getStats = async (req, res) => {
  try {
    /* 1. Get business id */
    const { businessId, error: bizError } = await getBusinessId(req.user.id);

    if (bizError || !businessId) {
      return res.json({
        totalOrders: 0, totalRevenue: 0, totalProducts: 0,
        monthlyRevenue: [], categoryBreakdown: [], recentOrders: []
      });
    }

    /* 2. Fetch orders for this business */
    const { data: orders, error: ordersError } = await supabase
      .from("orders1")
      .select("id, total_amount, status, created_at")
      .eq("business_id", businessId)
      .order("created_at", { ascending: true });

    if (ordersError) {
      console.error("Supabase error fetching orders for analytics:", ordersError);
    }

    const allOrders = orders || [];
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce(
      (sum, o) => sum + (parseFloat(o.total_amount) || 0),
      0
    );

    /* 3. Fetch total products count for this business */
    const { data: products, error: prodError } = await supabase
      .from("products1")
      .select("id, name, price, stock, category_id")
      .eq("business_id", businessId);

    if (prodError) {
      console.error("Supabase error fetching products for analytics:", prodError);
    }

    const totalProducts = (products || []).length;

    /* 4. Build monthly revenue data from orders */
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = {};

    allOrders.forEach((order) => {
      const date = new Date(order.created_at);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const label = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

      if (!monthlyMap[key]) {
        monthlyMap[key] = { name: label, revenue: 0, orders: 0, sortKey: key };
      }
      monthlyMap[key].revenue += parseFloat(order.total_amount) || 0;
      monthlyMap[key].orders += 1;
    });

    // Sort by date and take last 12 months max
    const monthlyRevenue = Object.values(monthlyMap)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-12)
      .map(({ name, revenue, orders }) => ({ name, revenue: Math.round(revenue * 100) / 100, orders }));

    /* 5. Build category/product breakdown from order_items */
    const { data: orderItems, error: oiError } = await supabase
      .from("order_items")
      .select("quantity, price, product_id, order_id")
      .in("order_id", allOrders.map(o => o.id).length > 0 ? allOrders.map(o => o.id) : ['00000000-0000-0000-0000-000000000000']);

    if (oiError) {
      console.error("Supabase error fetching order_items:", oiError);
    }

    // Build product sales map
    const productSalesMap = {};
    (orderItems || []).forEach((item) => {
      if (!productSalesMap[item.product_id]) {
        productSalesMap[item.product_id] = { totalQty: 0, totalValue: 0 };
      }
      productSalesMap[item.product_id].totalQty += item.quantity;
      productSalesMap[item.product_id].totalValue += item.quantity * (parseFloat(item.price) || 0);
    });

    // Map product ids to names for the pie chart
    const categoryBreakdown = (products || [])
      .filter(p => productSalesMap[p.id])
      .map(p => ({
        name: p.name,
        value: Math.round(productSalesMap[p.id].totalValue * 100) / 100,
        quantity: productSalesMap[p.id].totalQty
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // top 8 products

    /* 6. Recent orders with status breakdown */
    const statusCounts = { pending: 0, processing: 0, shipped: 0, completed: 0, cancelled: 0 };
    allOrders.forEach(o => {
      if (statusCounts[o.status] !== undefined) statusCounts[o.status]++;
    });

    const recentOrders = allOrders
      .slice(-5)
      .reverse()
      .map(o => ({
        id: o.id,
        total: parseFloat(o.total_amount) || 0,
        status: o.status,
        date: o.created_at
      }));

    res.json({
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalProducts,
      monthlyRevenue,
      categoryBreakdown,
      recentOrders,
      statusCounts
    });
  } catch (error) {
    console.error("Server error fetching analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

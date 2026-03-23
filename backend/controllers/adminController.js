import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

// Service-role client bypasses RLS so admin can see all rows
const adminSupabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/* ─── GET PLATFORM STATS ───────────────────────────────────── */
export const getStats = async (req, res) => {
  try {
    const [r1, r2, r3, r4] = await Promise.all([
      adminSupabase.from("users1").select("*", { count: "exact", head: true }).neq("role", "admin"),
      adminSupabase.from("businesses").select("*", { count: "exact", head: true }),
      adminSupabase.from("products1").select("*", { count: "exact", head: true }),
      adminSupabase.from("orders1").select("*", { count: "exact", head: true }),
    ]);

    if (r1.error) console.error("stats users1 err:", r1.error.message);
    if (r2.error) console.error("stats businesses err:", r2.error.message);
    if (r3.error) console.error("stats products1 err:", r3.error.message);
    if (r4.error) console.error("stats orders1 err:", r4.error.message);

    res.json({
      totalUsers:      r1.count ?? 0,
      totalBusinesses: r2.count ?? 0,
      totalProducts:   r3.count ?? 0,
      totalOrders:     r4.count ?? 0,
    });
  } catch (err) {
    console.error("Admin getStats crash:", err.message);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

/* ─── GET ALL USERS (clients + businesses) ─────────────────── */
export const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await adminSupabase
      .from("users1")
      .select("id, name, email, role, phone, created_at")
      .neq("role", "admin")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin getAllUsers DB error:", error.message, error.code);
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
  } catch (err) {
    console.error("Admin getAllUsers crash:", err.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

/* ─── GET ALL PRODUCTS ─────────────────────────────────────── */
export const getAllProducts = async (req, res) => {
  try {
    const { data, error } = await adminSupabase
      .from("products1")
      .select("id, name, price, stock, description, image_url, created_at, business_id")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin getAllProducts DB error:", error.message, error.code);
      return res.status(500).json({ error: error.message });
    }

    // Fetch business names separately to avoid FK join issues
    const businessIds = [...new Set((data || []).map(p => p.business_id).filter(Boolean))];
    let bizMap = {};

    if (businessIds.length > 0) {
      const { data: bizData } = await adminSupabase
        .from("businesses")
        .select("id, business_name, location")
        .in("id", businessIds);

      (bizData || []).forEach(b => { bizMap[b.id] = b; });
    }

    const flat = (data || []).map((p) => ({
      id:            p.id,
      name:          p.name,
      price:         p.price,
      stock:         p.stock,
      description:   p.description,
      image_url:     p.image_url,
      created_at:    p.created_at,
      business_name: bizMap[p.business_id]?.business_name || "—",
      location:      bizMap[p.business_id]?.location      || "—",
    }));

    res.json(flat);
  } catch (err) {
    console.error("Admin getAllProducts crash:", err.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

/* ─── GET ALL ORDERS ───────────────────────────────────────── */
export const getAllOrders = async (req, res) => {
  try {
    const { data, error } = await adminSupabase
      .from("orders1")
      .select("id, status, total_amount, created_at, client_id, business_id")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin getAllOrders DB error:", error.message, error.code);
      return res.status(500).json({ error: error.message });
    }

    const orders = data || [];

    // Fetch client names via clients → users1
    const clientIds    = [...new Set(orders.map(o => o.client_id).filter(Boolean))];
    const businessIds  = [...new Set(orders.map(o => o.business_id).filter(Boolean))];

    let clientMap = {}, bizMap = {};

    if (clientIds.length > 0) {
      const { data: clientRows } = await adminSupabase
        .from("clients")
        .select("id, user_id")
        .in("id", clientIds);

      const userIds = [...new Set((clientRows || []).map(c => c.user_id).filter(Boolean))];

      const idToUserId = {};
      (clientRows || []).forEach(c => { idToUserId[c.id] = c.user_id; });

      if (userIds.length > 0) {
        const { data: userRows } = await adminSupabase
          .from("users1")
          .select("id, name, email")
          .in("id", userIds);

        const userById = {};
        (userRows || []).forEach(u => { userById[u.id] = u; });

        // build clientId → user
        Object.entries(idToUserId).forEach(([cid, uid]) => {
          clientMap[cid] = userById[uid] || {};
        });
      }
    }

    if (businessIds.length > 0) {
      const { data: bizRows } = await adminSupabase
        .from("businesses")
        .select("id, business_name")
        .in("id", businessIds);
      (bizRows || []).forEach(b => { bizMap[b.id] = b; });
    }

    const flat = orders.map(o => ({
      id:             o.id,
      status:         o.status,
      total_amount:   o.total_amount,
      created_at:     o.created_at,
      client_name:    clientMap[o.client_id]?.name    || "—",
      client_email:   clientMap[o.client_id]?.email   || "—",
      business_name:  bizMap[o.business_id]?.business_name || "—",
    }));

    res.json(flat);
  } catch (err) {
    console.error("Admin getAllOrders crash:", err.message);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

/* ─── DELETE USER ──────────────────────────────────────────── */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ error: "Cannot delete your own admin account" });
    }

    // 1. Get client/business profile IDs for this user
    const [{ data: client }, { data: business }] = await Promise.all([
      adminSupabase.from("clients").select("id").eq("user_id", id).maybeSingle(),
      adminSupabase.from("businesses").select("id").eq("user_id", id).maybeSingle(),
    ]);

    // 2. If client — clean up cart_items, reviews, then orders (order_items first)
    if (client?.id) {
      // Orders for this client
      const { data: orders } = await adminSupabase
        .from("orders1").select("id").eq("client_id", client.id);
      for (const o of (orders || [])) {
        await adminSupabase.from("order_items").delete().eq("order_id", o.id);
      }
      await adminSupabase.from("orders1").delete().eq("client_id", client.id);
      await adminSupabase.from("cart_items").delete().eq("client_id", client.id);
      await adminSupabase.from("reviews").delete().eq("client_id", client.id);
    }

    // 3. If business — clean up products (incl. order_items, analytics), orders
    if (business?.id) {
      const { data: products } = await adminSupabase
        .from("products1").select("id").eq("business_id", business.id);
      for (const p of (products || [])) {
        await adminSupabase.from("business_analytics").delete().eq("product_id", p.id);
        await adminSupabase.from("order_items").delete().eq("product_id", p.id);
        await adminSupabase.from("cart_items").delete().eq("product_id", p.id);
        await adminSupabase.from("reviews").delete().eq("product_id", p.id);
        await adminSupabase.from("stock_history").delete().eq("product_id", p.id);
      }
      await adminSupabase.from("products1").delete().eq("business_id", business.id);
      const { data: bizOrders } = await adminSupabase
        .from("orders1").select("id").eq("business_id", business.id);
      for (const o of (bizOrders || [])) {
        await adminSupabase.from("order_items").delete().eq("order_id", o.id);
      }
      await adminSupabase.from("orders1").delete().eq("business_id", business.id);
    }

    // 4. Clean up notifications
    await adminSupabase.from("notifications").delete().eq("user_id", id);

    // 5. Delete the user row (clients/businesses rows cascade via FK)
    const { error } = await adminSupabase.from("users1").delete().eq("id", id);
    if (error) throw error;

    // 6. Remove from Supabase Auth (non-blocking)
    adminSupabase.auth.admin.deleteUser(id).catch(e =>
      console.warn("Auth delete warning (non-blocking):", e.message)
    );

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Admin deleteUser crash:", err.message);
    res.status(500).json({ error: "Failed to delete user", details: err.message });
  }
};

/* ─── DELETE PRODUCT ───────────────────────────────────────── */
export const adminDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Clean up all child rows before deleting product
    // (avoids FK / trigger cascade conflicts)
    await adminSupabase.from("business_analytics").delete().eq("product_id", id);
    await adminSupabase.from("order_items").delete().eq("product_id", id);
    await adminSupabase.from("cart_items").delete().eq("product_id", id);
    await adminSupabase.from("reviews").delete().eq("product_id", id);
    await adminSupabase.from("stock_history").delete().eq("product_id", id);

    const { error } = await adminSupabase.from("products1").delete().eq("id", id);
    if (error) throw error;

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Admin deleteProduct crash:", err.message);
    res.status(500).json({ error: "Failed to delete product", details: err.message });
  }
};

import supabase from "../config/supabase.js";
import { logStockChange } from "./stockController.js";

/* ─── HELPER: insert notification ─────────────────────────────── */
async function createNotification(userId, message) {
  await supabase.from("notifications").insert([{ user_id: userId, message, is_read: false }]);
}

/* ─── HELPERS ──────────────────────────────────────────────── */
async function getClientId(userId) {
  const { data, error } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  return { clientId: data?.id || null, error };
}

async function getBusinessId(userId) {
  const { data, error } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  return { businessId: data?.id || null, error };
}


/* ─── GET ALL ORDERS (Admin) ──────────────────────────────── */
export const getOrders = async (req, res) => {
  const { data, error } = await supabase
    .from("orders1")
    .select(`
      *,
      client:client_id ( id, clients_user:user_id ( name, email ) ),
      business:business_id ( id, business_name, biz_user:user_id ( name, email ) ),
      order_items ( *, products1 ( name, price, image_url ) )
    `);

  if (error) return res.status(400).json(error);
  res.json(data);
};


/* ─── GET ORDERS FOR LOGGED-IN BUSINESS ────────────────────── */
export const getBusinessOrders = async (req, res) => {
  const { businessId, error: bizErr } = await getBusinessId(req.user.id);
  if (bizErr || !businessId) return res.status(403).json({ error: "No business profile found." });

  const { data, error } = await supabase
    .from("orders1")
    .select(`
      *,
      client:client_id ( id, clients_user:user_id ( name, email ) ),
      order_items ( *, products1 ( name, price, image_url ) )
    `)
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) return res.status(400).json(error);
  res.json(data);
};


/* ─── GET ORDERS FOR LOGGED-IN CLIENT ──────────────────────── */
export const getClientOrders = async (req, res) => {
  const { clientId, error: clientErr } = await getClientId(req.user.id);
  if (clientErr || !clientId) return res.status(403).json({ error: "No client profile found." });

  const { data, error } = await supabase
    .from("orders1")
    .select(`
      *,
      business:business_id ( id, business_name, biz_user:user_id ( name, email ) ),
      order_items ( *, products1 ( name, price, image_url ) )
    `)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) return res.status(400).json(error);
  res.json(data);
};


/* ─── CREATE ORDER ──────────────────────────────────────────── */
export const createOrder = async (req, res) => {
  const { business_id, items, total } = req.body;
  // items: [{ product_id, quantity, price }, ...]

  /* 1. Resolve client_id */
  const { clientId, error: clientErr } = await getClientId(req.user.id);
  if (clientErr || !clientId) {
    return res.status(403).json({ error: "No client profile found." });
  }

  /* 2. Insert into orders1 */
  const { data: order, error: orderError } = await supabase
    .from("orders1")
    .insert([{ client_id: clientId, business_id, total_amount: total, status: "pending" }])
    .select()
    .single();

  if (orderError) return res.status(400).json(orderError);

  /* 3. Insert each item into order_items */
  if (items && items.length > 0) {
    const orderItemsPayload = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsPayload);

    if (itemsError) {
      console.error("Order items insert error:", itemsError.message);
      return res.status(400).json({ error: "Order created but failed to save items: " + itemsError.message });
    }

    /* Log stock changes for each item and deduct stock */
    for (const item of items) {
      logStockChange(item.product_id, -item.quantity, `Sold ${item.quantity} unit(s) — Order #${order.id.substring(0,8)}`).catch(() => {});

      // Deduct stock from products1
      const { data: prod } = await supabase
        .from("products1")
        .select("stock")
        .eq("id", item.product_id)
        .maybeSingle();

      if (prod) {
        const newStock = Math.max(0, (parseInt(prod.stock) || 0) - item.quantity);
        await supabase
          .from("products1")
          .update({ stock: newStock })
          .eq("id", item.product_id);
      }
    }
  }

  /* 4. Clear the cart for this client */
  await supabase
    .from("cart_items")
    .delete()
    .eq("client_id", clientId);

  /* 5. Notify client and business */
  // Notify client
  createNotification(req.user.id, `Your order #${order.id.substring(0,8)} has been placed successfully! Total: ₹${total}`).catch(() => {});
  // Notify business owner (get their user_id)
  supabase.from("businesses").select("user_id").eq("id", business_id).maybeSingle().then(({ data }) => {
    if (data?.user_id) {
      createNotification(data.user_id, `New order received! Order #${order.id.substring(0,8)} — Total: ₹${total}`).catch(() => {});
    }
  });

  res.json({ message: "Order created successfully", order });
};


/* ─── UPDATE ORDER STATUS ───────────────────────────────────── */
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const { data, error } = await supabase
    .from("orders1")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(400).json(error);
  res.json({ message: "Order status updated", order: data });
};

import supabase from "../config/supabase.js";

/* ─── HELPER: get clients.id from user_id ─────────────────── */
async function getClientId(userId) {
  const { data, error } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  return { clientId: data?.id || null, error };
}


/* ─── ADD ITEM TO CART ─────────────────────────────────────── */
export const addToCart = async (req, res) => {
  const { product_id, quantity } = req.body;
  const user_id = req.user.id;

  try {
    /* 1. Get clients.id for this user */
    const { clientId, error: clientError } = await getClientId(user_id);
    if (clientError || !clientId) {
      return res.status(403).json({ error: "No client profile found for this user." });
    }

    /* 2. Check if item already in cart */
    const { data: existingItem, error: fetchError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("client_id", clientId)
      .eq("product_id", product_id)
      .maybeSingle();

    if (fetchError) {
      return res.status(400).json({ error: fetchError.message });
    }

    let result;
    if (existingItem) {
      /* Update quantity */
      const newQuantity = existingItem.quantity + (quantity || 1);
      const { data, error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", existingItem.id)
        .select();

      if (error) throw error;
      result = data;
    } else {
      /* Insert new cart item */
      const { data, error } = await supabase
        .from("cart_items")
        .insert([{ client_id: clientId, product_id, quantity: quantity || 1 }])
        .select();

      if (error) throw error;
      result = data;
    }

    res.json({ message: "Item added to cart", cart: result });
  } catch (error) {
    console.error("Cart Error:", error);
    res.status(500).json({ error: error.message });
  }
};


/* ─── GET CART ITEMS ──────────────────────────────────────── */
export const getCart = async (req, res) => {
  const user_id = req.user.id;
  console.log("Fetching cart for user:", user_id);

  try {
    /* 1. Get clients.id */
    const { clientId, error: clientError } = await getClientId(user_id);
    if (clientError || !clientId) {
      return res.json([]);
    }

    /* 2. Fetch cart items with product details */
    const { data: cartItems, error } = await supabase
      .from("cart_items")
      .select("*, products1(id, name, price, stock, image_url, business_id, businesses(id, business_name, users1(name)))")
      .eq("client_id", clientId);

    if (error) {
      console.error("Supabase error fetching cart:", error);
      return res.status(500).json({ error: "Failed to fetch cart items: " + error.message });
    }

    if (!cartItems || cartItems.length === 0) {
      return res.json([]);
    }

    /* 3. Flatten */
    const enriched = cartItems.map((item) => ({
      id: item.id,
      client_id: item.client_id,
      product_id: item.product_id,
      quantity: item.quantity,
      created_at: item.created_at,
      product: item.products1
        ? {
            id: item.products1.id,
            name: item.products1.name,
            price: item.products1.price,
            stock: item.products1.stock,
            image_url: item.products1.image_url,
          }
        : { name: "Unknown/Deleted Product", price: 0 },
      business: item.products1?.businesses
        ? {
            id: item.products1.businesses.id,
            business_name: item.products1.businesses.business_name,
            name: item.products1.businesses.users1?.name || "Unknown",
          }
        : { name: "Unknown Business" },
    }));

    res.json(enriched);
  } catch (error) {
    console.error("Get Cart Critical Error:", error);
    res.status(500).json({ error: error.message });
  }
};


/* ─── REMOVE ITEM FROM CART ───────────────────────────────── */
export const removeFromCart = async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* ─── CLEAR CART ──────────────────────────────────────────── */
export const clearCart = async (req, res) => {
  const user_id = req.user.id;

  try {
    const { clientId, error: clientError } = await getClientId(user_id);
    if (clientError || !clientId) {
      return res.json({ message: "Cart already empty" });
    }

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("client_id", clientId);

    if (error) throw error;

    res.json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

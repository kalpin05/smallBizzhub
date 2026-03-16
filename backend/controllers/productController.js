import supabase from "../config/supabase.js";
import { sendNewProductEmail } from "../utils/emailService.js";
import { logStockChange } from "./stockController.js";

/* ─── HELPER: get business row from user_id ──────────────── */
async function getBusiness(userId) {
  const { data, error } = await supabase
    .from("businesses")
    .select("id, business_name")
    .eq("user_id", userId)
    .maybeSingle();
  return { data, error };
}


/* ─── ADD PRODUCT ──────────────────────────────────────────── */
export const addProduct = async (req, res) => {
  try {
    const { name, price, stock, description, image_url, category_id } = req.body;

    /* 1. Get business id for this logged-in user */
    const { data: business, error: bizError } = await getBusiness(req.user.id);
    if (bizError || !business) {
      return res.status(403).json({ error: "No business profile found for this user." });
    }

    /* 2. Insert Product into products1 */
    const { data: product, error } = await supabase
      .from("products1")
      .insert([{ name, price, stock, description, image_url: image_url || null, business_id: business.id, category_id: category_id || null }])
      .select()
      .single();

    if (error) {
      console.error("Supabase error adding product:", error);
      return res.status(400).json({ error: error.message });
    }

    /* 3. Log stock history */
    if (product && product.stock > 0) {
      logStockChange(product.id, parseInt(product.stock), "Initial stock on product creation").catch(() => {});
    }

    /* 4. Fetch All Clients for email notification */
    const { data: clients } = await supabase
      .from("users1")
      .select("email, name")
      .eq("role", "client");

    if (clients && clients.length > 0) {
      const businessObj = { name: business.business_name };
      sendNewProductEmail(clients, product, businessObj).catch((err) =>
        console.error("Failed to send product emails:", err)
      );
    }

    res.json({ message: "Product added successfully", product });
  } catch (error) {
    console.error("Server error adding product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


/* ─── GET ALL PRODUCTS (with business info) ─────────────── */
export const getProducts = async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from("products1")
      .select("*, businesses(id, business_name, location, user_id, users1(name, email))");

    if (error) {
      console.error("Supabase error fetching products:", error);
      return res.status(400).json({ error: error.message });
    }

    if (!products || products.length === 0) {
      return res.json([]);
    }

    /* Flatten for frontend compatibility */
    const result = products.map((p) => ({
      ...p,
      business: p.businesses
        ? {
            id: p.businesses.id,
            name: p.businesses.users1?.name || "Unknown",
            email: p.businesses.users1?.email || "",
            business_name: p.businesses.business_name,
          }
        : { name: "Unknown Business", email: "" },
    }));

    res.json(result);
  } catch (error) {
    console.error("Server error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


/* ─── GET PRODUCTS FOR LOGGED-IN BUSINESS ──────────────── */
export const getBusinessProducts = async (req, res) => {
  try {
    const { data: business, error: bizError } = await getBusiness(req.user.id);
    if (bizError || !business) {
      return res.status(403).json({ error: "No business profile found." });
    }

    const { data, error } = await supabase
      .from("products1")
      .select("*")
      .eq("business_id", business.id);

    if (error) {
      console.error("Supabase error fetching business products:", error);
      return res.status(400).json({ error: error.message });
    }

    res.json(data || []);
  } catch (error) {
    console.error("Server error fetching business products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


/* ─── GET PRODUCTS FOR A SPECIFIC BUSINESS (Client Discover) */
export const getProductsByBusiness = async (req, res) => {
  try {
    /* businessId here is the businesses.id (PK of businesses table) */
    const { businessId } = req.params;

    const { data, error } = await supabase
      .from("products1")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products for business:", error);
      return res.status(400).json({ error: error.message });
    }

    res.json(data || []);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


/* ─── UPDATE PRODUCT ─────────────────────────────────────── */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, description, image_url, category_id } = req.body;

    const { data: business, error: bizError } = await getBusiness(req.user.id);
    if (bizError || !business) {
      return res.status(403).json({ error: "No business profile found." });
    }

    const { data, error } = await supabase
      .from("products1")
      .update({ name, price, stock, description, image_url, category_id: category_id || null })
      .eq("id", id)
      .eq("business_id", business.id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error updating product:", error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "Product updated successfully", product: data });

    /* Log stock change if stock was updated */
    if (stock !== undefined && data) {
      const oldStock = data.stock; // after update this is new value
      // We don't have old stock easily, so log the absolute set
      logStockChange(data.id, parseInt(stock), `Stock updated to ${stock} via product edit`).catch(() => {});
    }
  } catch (error) {
    console.error("Server error updating product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


/* ─── DELETE PRODUCT ─────────────────────────────────────── */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: business, error: bizError } = await getBusiness(req.user.id);
    if (bizError || !business) {
      return res.status(403).json({ error: "No business profile found." });
    }

    const { error } = await supabase
      .from("products1")
      .delete()
      .eq("id", id)
      .eq("business_id", business.id);

    if (error) {
      console.error("Supabase error deleting product:", error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Server error deleting product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

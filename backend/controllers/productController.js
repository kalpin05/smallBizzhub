import supabase from "../config/supabase.js";
import { sendNewProductEmail } from "../utils/emailService.js";

export const addProduct = async (req, res) => {
  try {
    const { name, price, stock, description, image } = req.body;
    const business_id = req.user.id;

    // 1. Insert Product
    const { data: product, error } = await supabase
      .from("products")
      .insert([
        { name, price, stock, description, image, business_id }
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error adding product:", error);
      return res.status(400).json({ error: error.message });
    }

    // 2. Fetch Business Details (for the email)
    const { data: business } = await supabase
      .from("users")
      .select("name, business_name")
      .eq("id", business_id)
      .single();

    // 3. Fetch All Clients
    const { data: clients } = await supabase
      .from("users")
      .select("email, name")
      .eq("role", "client");

    // 4. Send Email Notification (Non-blocking)
    if (clients && clients.length > 0 && business) {
      // Use business_name if available, else fallback to name
      const businessObj = { ...business, name: business.business_name || business.name };
      sendNewProductEmail(clients, product, businessObj).catch(err =>
        console.error("Failed to send product emails:", err)
      );
    }

    res.json({ message: "Product added successfully", product });
  } catch (error) {
    console.error("Server error adding product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProducts = async (req, res) => {
  try {
    // First try to get products without join
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*");

    if (productsError) {
      console.error("Supabase error fetching products:", productsError);
      return res.status(400).json({ error: productsError.message });
    }

    // If no products or no user table, return products without business info
    if (!products || products.length === 0) {
      return res.json([]);
    }

    // Try to get business info separately
    const businessIds = [...new Set(products.map(p => p.business_id))];
    const { data: businesses, error: businessError } = await supabase
      .from("users")
      .select("id, name, email")
      .in("id", businessIds);

    if (businessError) {
      console.error("Error fetching business info:", businessError);
      // Return products without business info
      return res.json(products);
    }

    // Combine products with business info
    const productsWithBusiness = products.map(product => ({
      ...product,
      business: businesses.find(b => b.id === product.business_id) || { name: "Unknown Business", email: "" }
    }));

    res.json(productsWithBusiness);
  } catch (error) {
    console.error("Server error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getBusinessProducts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("business_id", req.user.id);

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

/* Public: get products for a specific business (for client discover view) */
export const getProductsByBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { data, error } = await supabase
      .from("products")
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

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, description, image } = req.body;

    const { data, error } = await supabase
      .from("products")
      .update({ name, price, stock, description, image, updated_at: new Date() })
      .eq("id", id)
      .eq("business_id", req.user.id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error updating product:", error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "Product updated successfully", product: data });
  } catch (error) {
    console.error("Server error updating product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .eq("business_id", req.user.id);

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

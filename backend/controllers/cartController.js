import supabase from "../config/supabase.js";

// Add item to cart
export const addToCart = async (req, res) => {
    const { business_id, product_id, quantity } = req.body;
    const user_id = req.user.id; // From auth middleware

    try {
        // Check if item already exists in cart for this user and product
        const { data: existingItem, error: fetchError } = await supabase
            .from("cart")
            .select("*")
            .eq("user_id", user_id)
            .eq("product_id", product_id)
            .single();

        if (fetchError && fetchError.code !== "PGRST116") { // PGRST116 is "Row not found"
            return res.status(400).json({ error: fetchError.message });
        }

        let result;
        if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + quantity;
            const { data, error } = await supabase
                .from("cart")
                .update({ quantity: newQuantity })
                .eq("id", existingItem.id)
                .select();

            if (error) throw error;
            result = data;
        } else {
            // Insert new item
            // Ensure we clear cart if it contains items from another business? 
            // For now, let's allow mixed carts or assume frontend handles clearing. 
            // But typically a cart is per business in this type of app.
            // Let's enforce single business cart for simplicity if requested, 
            // but standard cart implementation allows mixed or multiple. 
            // Implementation Plan said: "scoped to the currently selected business".

            // Optional: Check if cart has items from another business and warn/clear.
            // For now, just insert.
            const { data, error } = await supabase
                .from("cart")
                .insert([{ user_id, business_id, product_id, quantity }])
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

// Get cart items (Manual Join for robustness)
export const getCart = async (req, res) => {
    const user_id = req.user.id;
    console.log("Fetching cart for user:", user_id);

    try {
        // 1. Fetch raw cart items
        const { data: cartItems, error } = await supabase
            .from("cart")
            .select("*")
            .eq("user_id", user_id);

        if (error) {
            console.error("Supabase error fetching cart:", error);
            // Return empty array instead of crashing if table missing or RLS error, 
            // but log it. 
            return res.status(500).json({ error: "Failed to fetch cart items: " + error.message });
        }

        if (!cartItems || cartItems.length === 0) {
            return res.json([]);
        }

        // 2. Fetch related products
        const productIds = [...new Set(cartItems.map(item => item.product_id))].filter(Boolean);
        let products = [];
        if (productIds.length > 0) {
            const { data: pData } = await supabase
                .from("products")
                .select("*")
                .in("id", productIds);
            products = pData || [];
        }

        // 3. Fetch related businesses
        const businessIds = [...new Set(cartItems.map(item => item.business_id))].filter(Boolean);
        let businesses = [];
        if (businessIds.length > 0) {
            const { data: bData } = await supabase
                .from("users")
                .select("id, name, business_name")
                .in("id", businessIds);
            businesses = bData || [];
        }

        // 4. Combine data
        const enrichedCart = cartItems.map(item => {
            const product = products.find(p => p.id === item.product_id) || null;
            const business = businesses.find(b => b.id === item.business_id) || null;

            // If product is deleted, we should probably filter this item out or show as unavailable
            // For now, return it with null product so frontend handles it
            return {
                ...item,
                product: product || { name: "Unknown/Deleted Product", price: 0 },
                business: business || { name: "Unknown Business" }
            };
        });

        res.json(enrichedCart);

    } catch (error) {
        console.error("Get Cart Critical Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
    const { id } = req.params;

    try {
        const { error } = await supabase
            .from("cart")
            .delete()
            .eq("id", id);

        if (error) throw error;

        res.json({ message: "Item removed from cart" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Clear cart
export const clearCart = async (req, res) => {
    const user_id = req.user.id;

    try {
        const { error } = await supabase
            .from("cart")
            .delete()
            .eq("user_id", user_id);

        if (error) throw error;

        res.json({ message: "Cart cleared" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

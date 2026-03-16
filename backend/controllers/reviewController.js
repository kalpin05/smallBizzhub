import supabase from "../config/supabase.js";

/* ═════════════════════════════════════════════════════════════
   REVIEWS CONTROLLER
   ═════════════════════════════════════════════════════════════ */

/* ─── HELPER: get client id from user_id ─────────────────── */
async function getClientId(userId) {
  const { data } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.id || null;
}

/* ─── GET REVIEWS FOR A PRODUCT ─────────────────────────── */
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        client:client_id (
          id,
          user_id,
          users1 ( name )
        )
      `)
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Flatten client name
    const reviews = (data || []).map(r => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      client_name: r.client?.users1?.name || "Anonymous"
    }));

    res.json(reviews);
  } catch (err) {
    console.error("Get reviews error:", err.message);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

/* ─── ADD REVIEW ────────────────────────────────────────── */
export const addReview = async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;

    if (!product_id || !rating) {
      return res.status(400).json({ error: "Product ID and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const clientId = await getClientId(req.user.id);
    if (!clientId) {
      return res.status(403).json({ error: "Only clients can leave reviews" });
    }

    // Check if the client already reviewed this product
    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("product_id", product_id)
      .eq("client_id", clientId)
      .maybeSingle();

    if (existing) {
      // Update existing review
      const { data, error } = await supabase
        .from("reviews")
        .update({ rating, comment: comment || null })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return res.json({ message: "Review updated", review: data });
    }

    // Insert new review
    const { data, error } = await supabase
      .from("reviews")
      .insert([{ product_id, client_id: clientId, rating, comment: comment || null }])
      .select()
      .single();

    if (error) throw error;
    res.json({ message: "Review added", review: data });
  } catch (err) {
    console.error("Add review error:", err.message);
    res.status(500).json({ error: "Failed to add review" });
  }
};

/* ─── DELETE REVIEW ─────────────────────────────────────── */
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const clientId = await getClientId(req.user.id);

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", id)
      .eq("client_id", clientId);

    if (error) throw error;
    res.json({ message: "Review deleted" });
  } catch (err) {
    console.error("Delete review error:", err.message);
    res.status(500).json({ error: "Failed to delete review" });
  }
};

/* ─── GET AVERAGE RATING FOR A PRODUCT ──────────────────── */
export const getProductRating = async (req, res) => {
  try {
    const { productId } = req.params;

    const { data, error } = await supabase
      .from("reviews")
      .select("rating")
      .eq("product_id", productId);

    if (error) throw error;

    const ratings = data || [];
    const avg = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    res.json({ average: Math.round(avg * 10) / 10, count: ratings.length });
  } catch (err) {
    console.error("Get rating error:", err.message);
    res.status(500).json({ error: "Failed to fetch rating" });
  }
};

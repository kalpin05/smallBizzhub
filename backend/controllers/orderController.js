import supabase from "../config/supabase.js";


export const getOrders = async (req, res) => {

  const { data, error } = await supabase
    .from("orders")
    .select("*, client:client_id(name, email), business:business_id(name, email)");

  if (error) return res.status(400).json(error);

  res.json(data);
};


export const getBusinessOrders = async (req, res) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*, client:client_id(name, email)")
    .eq("business_id", req.user.id);

  if (error) return res.status(400).json(error);

  res.json(data);
};


export const getClientOrders = async (req, res) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*, business:business_id(name, email)")
    .eq("client_id", req.user.id);

  if (error) return res.status(400).json(error);

  res.json(data);
};



export const createOrder = async (req, res) => {
  const { business_id, items, total } = req.body;
  const client_id = req.user.id;

  const { data, error } = await supabase
    .from("orders")
    .insert([
      { client_id, business_id, items, total, status: "pending" }
    ])
    .select()
    .single();

  if (error) return res.status(400).json(error);

  // Clear cart for this business (or all cart items for user if we assume single-cart)
  // Since we just ordered "items" which came from the cart, we should clear them.
  // Ideally we only clear items associated with this business if we allow multi-business carts.
  // But for now, let's clear the whole cart for simplicity as discussed or just items for this business.
  // The plan said "Verify Cart is cleared".

  await supabase
    .from("cart")
    .delete()
    .eq("user_id", client_id);

  res.json({ message: "Order created successfully", order: data });
};



export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date() })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(400).json(error);

  res.json({ message: "Order status updated", order: data });
};

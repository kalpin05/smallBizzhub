import React, { createContext, useContext, useState, useEffect } from "react";
import { getCart, addToCart as apiAddToCart, removeFromCart as apiRemoveFromCart, clearCart as apiClearCart } from "../services/api";
import { getSafeStorage } from "../utils/storage";
import { toast } from "react-toastify";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    // Only fetch cart if user is a CLIENT — business/admin users have no cart
    const token = localStorage.getItem("token");
    const user = getSafeStorage("user", null);
    if (token && user && user.role === "client") {
      fetchCart();
    }
  }, []);

  const fetchCart = async () => {
    try {
      const response = await getCart();
      setCart(response.data || []);
    } catch (error) {
      // Don't log 401s — they happen naturally for non-client users
      if (error.response?.status !== 401) {
        console.error("Error fetching cart:", error);
      }
    }
  };

  const addToCart = async (product, businessId) => {
    // Prevent cross-business contamination
    if (cart.length > 0) {
      const cartBusinessId = cart[0].business?.id || cart[0].business_id;
      if (cartBusinessId && cartBusinessId !== businessId) {
        toast.error("Your cart contains items from another business. Please clear your cart or complete your order first.");
        return;
      }
    }

    try {
      setCartLoading(true);
      await apiAddToCart({
        business_id: businessId,
        product_id: product.id,
        quantity: 1
      });
      toast.success(`${product.name} added to cart!`);
      await fetchCart();
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(`Failed to add to cart: ${error.uiMessage || error.message}`);
    } finally {
      setCartLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await apiRemoveFromCart(itemId);
      toast.info("Item removed from cart");
      await fetchCart();
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove item");
    }
  };
  
  const clearCartState = () => {
      setCart([]);
      setIsCartOpen(false);
  }

  const cartTotal = cart.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cart,
      cartLoading,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      removeFromCart,
      fetchCart,
      cartTotal,
      clearCartState
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

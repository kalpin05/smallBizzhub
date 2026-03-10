import { useState, useEffect } from "react";
import "../styles/clientDiscover.css";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  getBusinesses,
  getProductsByBusinessId,
  addToCart,
  getCart,
  removeFromCart,
  createOrder
} from "../services/api";

function ClientDiscover() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Product panel state
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Cart state
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  const userName = (() => {
    try { return JSON.parse(localStorage.getItem("user"))?.name?.split(" ")[0] || "Client"; }
    catch { return "Client"; }
  })();

  useEffect(() => {
    fetchBusinesses();
    fetchCart();
  }, []);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const response = await getBusinesses();
      setBusinesses(response.data || []);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const response = await getCart();
      setCart(response.data || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const handleViewProducts = async (biz) => {
    setSelectedBusiness(biz);
    setProducts([]);
    setProductsLoading(true);
    try {
      const response = await getProductsByBusinessId(biz.id);
      setProducts(response.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedBusiness(null);
    setProducts([]);
  };

  const handleAddToCart = async (product) => {
    if (!selectedBusiness) return;

    // Check if cart has items from another business
    if (cart.length > 0) {
      const cartBusinessId = cart[0].business_id;
      if (cartBusinessId !== selectedBusiness.id) {
        if (!window.confirm("Your cart contains items from another business. Clearing the cart to add this item?")) {
          return;
        }
        // In a real app we might clear it via API here or handle mixed carts.
        // For now, the backend adds it anyway, but let's warn.
      }
    }

    try {
      setCartLoading(true);
      await addToCart({
        business_id: selectedBusiness.id,
        product_id: product.id,
        quantity: 1
      });
      alert("Added to cart!");
      fetchCart(); // Refresh cart
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(`Failed to add to cart: ${error.response?.data?.error || error.message}`);
    } finally {
      setCartLoading(false);
    }
  };

  const handleRemoveFromCart = async (itemId) => {
    try {
      await removeFromCart(itemId);
      fetchCart();
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + (item.product?.price * item.quantity), 0);
    const business_id = cart[0].business_id;

    // Construct items array for the order
    // The order table expects 'items' jsonb. Let's store a snapshot.
    const orderItems = cart.map(item => ({
      product_id: item.product_id,
      name: item.product?.name,
      price: item.product?.price,
      quantity: item.quantity
    }));

    try {
      await createOrder({
        business_id,
        items: orderItems,
        total
      });
      alert("Order placed successfully!");
      setCart([]); // Optimistic clear
      setIsCartOpen(false);
      fetchCart(); // Backend clears it too, but sync up
      navigate("/client-orders");
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order.");
    }
  };

  const filteredBusinesses = businesses.filter((biz) =>
    `${biz.business_name || biz.name} ${biz.category || ""} ${biz.location || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const cartTotal = cart.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);

  return (
    <div className="client-container">
      <Sidebar userType="client" />

      <main className="client-main" style={{ position: 'relative' }}>
        {/* ── HEADER ── */}
        <header className="client-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>Welcome, {userName}</h1>
              <p>Find products and services from local businesses near you.</p>
            </div>
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Cart ({cart.length})
            </button>
          </div>

          {!selectedBusiness && (
            <div className="search-bar">
              <input
                placeholder="Search businesses, products, or services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button onClick={fetchBusinesses}>Search</button>
            </div>
          )}
        </header>

        {/* ── CART OVERLAY ── */}
        {isCartOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '400px',
            height: '100vh',
            background: '#1a1a2e',
            borderLeft: '1px solid rgba(255,255,255,0.1)',
            zIndex: 1000,
            padding: '20px',
            boxShadow: '-4px 0 15px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Your Cart</h2>
              <button onClick={() => setIsCartOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {cart.length === 0 ? (
                <p style={{ color: '#b0b0cc', textAlign: 'center' }}>Your cart is empty.</p>
              ) : (
                cart.map(item => (
                  <div key={item.id} style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px' }}>{item.product?.name || "Product"}</h4>
                      <p style={{ margin: 0, color: '#b0b0cc', fontSize: '13px' }}>
                        {item.quantity} x ₹{item.product?.price}
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        style={{ background: '#ef4444', border: 'none', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', marginTop: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>
                <span>Total:</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                style={{
                  width: '100%',
                  background: cart.length === 0 ? 'rgba(59, 130, 246, 0.5)' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                Checkout
              </button>
            </div>
          </div>
        )}

        {/* ── PRODUCT PANEL (when a business is selected) ── */}
        {selectedBusiness ? (
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
              <button
                onClick={handleBack}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                ← Back to Businesses
              </button>
              <div>
                <h2 className="section-title" style={{ margin: 0 }}>
                  {selectedBusiness.business_name || selectedBusiness.name}
                </h2>
                <p style={{ color: "#b0b0cc", margin: "4px 0 0", fontSize: "14px" }}>
                  {selectedBusiness.category || "General"} • {selectedBusiness.location || "Local"}
                </p>
              </div>
            </div>

            {productsLoading ? (
              <p style={{ color: "#b0b0cc" }}>Loading products...</p>
            ) : products.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "16px",
                border: "1px dashed rgba(255,255,255,0.1)"
              }}>
                <p style={{ fontSize: "48px", margin: "0 0 12px" }}>📦</p>
                <p style={{ color: "#b0b0cc", fontSize: "16px" }}>
                  This business hasn't added any products yet.
                </p>
              </div>
            ) : (
              <div className="business-grid">
                {products.map((product, index) => (
                  <div className="business-card" key={product.id || index} style={{ position: "relative" }}>
                    {/* Product Image */}
                    <img
                      src={product.image || `https://picsum.photos/300/180?random=${index}`}
                      alt={product.name}
                      style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "8px 8px 0 0" }}
                      onError={(e) => { e.target.src = `https://picsum.photos/300/180?random=${index}`; }}
                    />

                    {/* Stock Badge */}
                    <span style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      background: product.stock > 0 ? "rgba(34,197,94,0.9)" : "rgba(239,68,68,0.9)",
                      color: "white",
                      padding: "3px 10px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600"
                    }}>
                      {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </span>

                    <h3 style={{ margin: "12px 12px 4px" }}>{product.name}</h3>
                    <p style={{ color: "#b0b0cc", fontSize: "13px", margin: "0 12px 8px", lineHeight: "1.4" }}>
                      {product.description || "No description provided."}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px 12px" }}>
                      <span style={{ fontSize: "20px", fontWeight: "700", color: "#4ade80" }}>
                        ₹{Number(product.price).toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock <= 0 || cartLoading}
                        style={{
                          background: product.stock > 0 ? '#3b82f6' : 'gray',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: product.stock > 0 ? 'pointer' : 'not-allowed'
                        }}
                      >
                        {cartLoading ? '...' : (product.stock > 0 ? 'Add' : 'No Stock')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          /* ── BUSINESS LIST ── */
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 className="section-title">Businesses Near You</h2>
              <span style={{ color: "#b0b0cc", fontSize: "14px" }}>
                {filteredBusinesses.length} business{filteredBusinesses.length !== 1 ? "es" : ""} found
              </span>
            </div>

            {loading ? (
              <p style={{ color: "#b0b0cc" }}>Loading businesses...</p>
            ) : filteredBusinesses.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "16px",
                border: "1px dashed rgba(255,255,255,0.1)"
              }}>
                <p style={{ fontSize: "48px", margin: "0 0 12px" }}>🏪</p>
                <p style={{ color: "#b0b0cc" }}>No businesses found. Try a different search.</p>
              </div>
            ) : (
              <div className="business-grid">
                {filteredBusinesses.map((biz, index) => (
                  <div className="business-card" key={biz.id || index}>
                    <img
                      src={`https://picsum.photos/300/180?random=${biz.id || index}`}
                      alt={biz.business_name || biz.name}
                    />
                    <h3>{biz.business_name || biz.name}</h3>
                    <p>{biz.category || "General"} • {biz.location || "Local"}</p>
                    <span style={{ fontSize: "12px", color: "#b0b0cc", display: "block", marginBottom: "10px" }}>
                      {biz.email}
                    </span>
                    <button onClick={() => handleViewProducts(biz)}>
                      View Products →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default ClientDiscover;

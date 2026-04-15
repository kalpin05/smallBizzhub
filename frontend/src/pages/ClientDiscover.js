import { useState, useEffect } from "react";
import "../styles/clientDiscover.css";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getSafeStorage } from "../utils/storage";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import {
  getBusinesses,
  getProductsByBusinessId,
  createOrder,
  getProductReviews,
  getProductRating,
  addReview
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

  // Cart Context
  const { cart, cartLoading, isCartOpen, setIsCartOpen, addToCart, removeFromCart, cartTotal, clearCartState } = useCart();

  // Review state
  const [reviewModal, setReviewModal] = useState(null); 
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [productRatings, setProductRatings] = useState({}); 
  const [productReviews, setProductReviews] = useState([]); 
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const user = getSafeStorage("user", { name: "Client" });
  const userName = user.name?.split(" ")[0] || "Client";

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const response = await getBusinesses();
      setBusinesses(response.data || []);
    } catch (error) {
      toast.error("Error fetching businesses");
    } finally {
      setLoading(false);
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
      toast.error("Error fetching products");
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedBusiness(null);
    setProducts([]);
    setProductRatings({});
  };

  useEffect(() => {
    if (products.length > 0) {
      products.forEach(async (p) => {
        try {
          const res = await getProductRating(p.id);
          setProductRatings(prev => ({ ...prev, [p.id]: res.data }));
        } catch (e) { /* ignore */ }
      });
    }
  }, [products]);

  const handleOpenReview = async (product) => {
    setReviewModal(product);
    setReviewRating(5);
    setReviewComment("");
    setReviewsLoading(true);
    try {
      const res = await getProductReviews(product.id);
      setProductReviews(res.data || []);
    } catch (e) {
      setProductReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewModal) return;
    try {
      await addReview({ product_id: reviewModal.id, rating: reviewRating, comment: reviewComment });
      toast.success("Review submitted!");
      const res = await getProductRating(reviewModal.id);
      setProductRatings(prev => ({ ...prev, [reviewModal.id]: res.data }));
      setReviewModal(null);
    } catch (err) {
      toast.error("Failed to submit review: " + (err.uiMessage || err.message));
    }
  };

  const renderStars = (rating) => {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const total = cartTotal;
    const business_id = cart[0].business?.id || cart[0].business_id;

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
      toast.success("Order placed successfully!");
      clearCartState(); 
      navigate("/client-orders");
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(`Failed to place order: ${error.uiMessage || 'Unknown error'}`);
    }
  };

  const filteredBusinesses = businesses.filter((biz) =>
    `${biz.business_name || biz.name} ${biz.category || ""} ${biz.location || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="client-container">
      <Sidebar userType="client" />

      <main className="client-main">
        {/* HEADER */}
        <header className="client-header">
          <div className="client-header-top">
            <div>
              <h1>Welcome, {userName}</h1>
              <p>Find products and services from local businesses near you.</p>
            </div>
            <button className="cart-toggle-btn" onClick={() => setIsCartOpen(!isCartOpen)}>
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

        {/* CART OVERLAY */}
        {isCartOpen && (
          <div className="cart-overlay">
            <div className="cart-overlay-header">
              <h2>Your Cart</h2>
              <button className="cart-close-btn" onClick={() => setIsCartOpen(false)}>×</button>
            </div>

            <div className="cart-items-container">
              {cart.length === 0 ? (
                <p style={{ color: '#b0b0cc', textAlign: 'center' }}>Your cart is empty.</p>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div>
                      <h4 style={{ margin: '0 0 4px' }}>{item.product?.name || "Product"}</h4>
                      <p style={{ margin: 0, color: '#b0b0cc', fontSize: '13px' }}>
                        {item.quantity} x ₹{item.product?.price}
                      </p>
                    </div>
                    <div>
                      <button className="btn-cart-remove" onClick={() => removeFromCart(item.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="cart-footer">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>
                <span>Total:</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <button
                className={`btn-checkout ${cart.length === 0 ? 'disabled' : 'active'}`}
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                Checkout
              </button>
            </div>
          </div>
        )}

        {/* PRODUCT PANEL  */}
        {selectedBusiness ? (
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
              <button className="btn-review" onClick={handleBack}>
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
              <div className="empty-state">
                <p style={{ fontSize: "48px", margin: "0 0 12px" }}>📦</p>
                <p>This business hasn't added any products yet.</p>
              </div>
            ) : (
              <div className="business-grid">
                {products.map((product, index) => (
                  <div className="business-card" key={product.id || index}>
                    <img
                      src={product.image_url || `https://via.placeholder.com/300x180/1a1a2e/ffffff?text=${encodeURIComponent(product.name)}`}
                      alt={product.name}
                      onError={(e) => { e.target.src = `https://via.placeholder.com/300x180/1a1a2e/ffffff?text=${encodeURIComponent(product.name)}`; }}
                    />

                    <span className={`stock-indicator ${product.stock > 0 ? 'stock-in' : 'stock-out'}`}>
                      {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </span>

                    <h3 style={{ margin: "12px 12px 4px" }}>{product.name}</h3>
                    <p style={{ color: "#b0b0cc", fontSize: "13px", margin: "0 12px 8px", lineHeight: "1.4" }}>
                      {product.description || "No description provided."}
                    </p>
                    
                    <div className="product-action-row">
                      <span className="product-price">
                        ₹{Number(product.price).toFixed(2)}
                      </span>
                      <button
                        className="btn-add-cart"
                        onClick={() => addToCart(product, selectedBusiness.id)}
                        disabled={product.stock <= 0 || cartLoading}
                      >
                        {cartLoading ? '...' : (product.stock > 0 ? 'Add' : 'No Stock')}
                      </button>
                    </div>

                    <div className="product-review-row">
                      <span style={{ color: '#f59e0b', fontSize: '14px' }}>
                        {productRatings[product.id]
                          ? `${renderStars(productRatings[product.id].average)} (${productRatings[product.id].count})`
                          : '☆☆☆☆☆ (0)'}
                      </span>
                      <button className="btn-review" onClick={() => handleOpenReview(product)}>
                        Reviews
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          /* BUSINESS LIST */
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
              <div className="empty-state">
                <p style={{ fontSize: "48px", margin: "0 0 12px" }}>🏪</p>
                <p>No businesses found. Try a different search.</p>
              </div>
            ) : (
              <div className="business-grid">
                {filteredBusinesses.map((biz, index) => (
                  <div className="business-card" key={biz.id || index}>
                    <img
                      src={`https://via.placeholder.com/300x180/1a1a2e/ffffff?text=${encodeURIComponent(biz.business_name || biz.name)}`}
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

      {/* REVIEW MODAL */}
      {reviewModal && (
        <div className="modal-backdrop" onClick={() => setReviewModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0 }}>Reviews — {reviewModal.name}</h2>
              <button onClick={() => setReviewModal(null)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              {reviewsLoading ? (
                <p style={{ color: '#b0b0cc' }}>Loading reviews...</p>
              ) : productReviews.length === 0 ? (
                <p style={{ color: '#b0b0cc', fontSize: '14px' }}>No reviews yet. Be the first!</p>
              ) : (
                productReviews.map((r, i) => (
                  <div key={i} className="review-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '14px' }}>{r.client_name}</strong>
                      <span style={{ color: '#f59e0b', fontSize: '14px' }}>{renderStars(r.rating)}</span>
                    </div>
                    {r.comment && <p style={{ margin: 0, color: '#b0b0cc', fontSize: '13px' }}>{r.comment}</p>}
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
              <h4 style={{ marginBottom: '12px' }}>Write a Review</h4>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    onClick={() => setReviewRating(star)}
                    style={{
                      fontSize: '28px', cursor: 'pointer',
                      color: star <= reviewRating ? '#f59e0b' : 'rgba(255,255,255,0.2)',
                      transition: 'color 0.2s'
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <textarea
                className="review-textarea"
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                placeholder="Write your review (optional)..."
              />
              <button
                className="btn-add-cart"
                onClick={handleSubmitReview}
                style={{ marginTop: '12px', width: '100%', padding: '10px', fontWeight: '600' }}
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientDiscover;

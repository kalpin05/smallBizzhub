import { useState } from "react";
import "../styles/businessAddProduct.css";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { addProduct, logout } from "../services/api";

function BusinessAddProduct() {
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image: ""
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setProduct({
      ...product,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!product.name || !product.price || !product.stock) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await addProduct(product);
      alert("Product Added Successfully!");
      navigate("/business-products");
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  }

  const handleCancel = () => {
    navigate("/business-products");
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard-container">
      <Sidebar userType="business" />

      <main className="dashboard-main">
        <h1 className="dashboard-title">Add New Product</h1>
        <p style={{ color: '#b0b0cc', marginBottom: '30px' }}>List a new item in your business inventory</p>

        <section className="add-card">
          <form onSubmit={handleSubmit} className="add-form">
            <div className="image-upload">
              <label className="upload-box">
                <input
                  type="text"
                  name="image"
                  placeholder="Image URL"
                  value={product.image}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white' }}
                />
                {!product.image && (
                  <>
                    <span className="cloud">☁</span>
                    <p>Enter Image URL</p>
                    <small>Or paste an image link</small>
                  </>
                )}
              </label>
            </div>

            <div className="product-details">
              <div className="form-group">
                <label>Product Name *</label>
                <input name="name" value={product.name} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={product.description} onChange={handleChange} />
              </div>

              <div className="price-stock">
                <div className="form-group">
                  <label>Price *</label>
                  <input name="price" type="number" value={product.price} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Stock *</label>
                  <input name="stock" type="number" value={product.stock} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="add-btn" disabled={loading}>
                  {loading ? "Adding..." : "Add Product"}
                </button>
                <button type="button" className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default BusinessAddProduct;

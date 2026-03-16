import { useState, useEffect } from "react";
import "../styles/dashboard.css";
import "../styles/BusinessProducts.css";
import Sidebar from "../components/Sidebar";
import { getBusinessProducts, addProduct, updateProduct, deleteProduct, getProductStockHistory, logout } from "../services/api";

function BusinessProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        image: ""
    });

    // Stock history modal
    const [stockHistoryModal, setStockHistoryModal] = useState(null);
    const [stockHistory, setStockHistory] = useState([]);
    const [stockLoading, setStockLoading] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await getBusinessProducts();
            setProducts(response.data || []);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveProduct = async () => {
        if (!formData.name || !formData.price || !formData.stock) {
            alert("Please fill all required fields");
            return;
        }

        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, formData);
                alert("Product updated successfully!");
            } else {
                await addProduct(formData);
                alert("Product added successfully!");
            }
            setFormData({ name: "", description: "", price: "", stock: "", image: "" });
            setEditingProduct(null);
            fetchProducts();
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Failed to save product: " + (error.response?.data?.error || error.message));
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name || "",
            description: product.description || "",
            price: product.price || "",
            stock: product.stock || "",
            image: product.image || ""
        });
    };

    const handleDelete = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;

        try {
            await deleteProduct(productId);
            alert("Product deleted successfully!");
            fetchProducts();
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Failed to delete product");
        }
    };

    const handleReset = () => {
        setFormData({ name: "", description: "", price: "", stock: "", image: "" });
        setEditingProduct(null);
    };

    const handleLogout = () => {
        logout();
    };

    const handleViewStockHistory = async (product) => {
        setStockHistoryModal(product);
        setStockLoading(true);
        try {
            const res = await getProductStockHistory(product.id);
            setStockHistory(res.data || []);
        } catch (err) {
            console.error("Error loading stock history:", err);
            setStockHistory([]);
        } finally {
            setStockLoading(false);
        }
    };

    const getStockStatus = (stock) => {
        if (stock === 0) return { label: "Out of Stock", class: "out" };
        if (stock < 10) return { label: "Low Stock", class: "low" };
        return { label: "Active", class: "active" };
    };

    return (
        <div className="dashboard-container">
            <Sidebar userType="business" />

            <main className="dashboard-main">
                <header className="dashboard-topbar">
                    <div>
                        <h1 className="dashboard-title">Products Management</h1>
                        <p style={{ opacity: 0.7 }}>Manage your inventory and stock</p>
                    </div>
                    <button onClick={handleLogout} className="logout-btn" style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.1)' }}>Logout</button>
                </header>

                <div className="products-wrapper">
                    <div className="glass-panel">
                        <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>

                        <div className="product-form">
                            <div className="full">
                                <label>Product Name</label>
                                <input name="name" placeholder="Product Name" value={formData.name} onChange={handleInputChange} />
                            </div>

                            <div className="two-col">
                                <div>
                                    <label>Product Description</label>
                                    <textarea name="description" placeholder="Product Description" value={formData.description} onChange={handleInputChange}></textarea>
                                </div>
                                <div>
                                    <label>Image URL</label>
                                    <input name="image" placeholder="Image URL" value={formData.image} onChange={handleInputChange} />
                                </div>
                            </div>

                            <div className="three-col">
                                <input name="price" placeholder="$ Price" type="number" value={formData.price} onChange={handleInputChange} />
                                <input name="stock" placeholder="Stock Quantity" type="number" value={formData.stock} onChange={handleInputChange} />
                                <div className="btn-row">
                                    <button className="btn-primary" onClick={handleSaveProduct}>
                                        {editingProduct ? "Update Product" : "Save Product"}
                                    </button>
                                    <button className="btn-secondary" onClick={handleReset}>Reset</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel">
                        <div className="table-header">
                            <h3>All Products</h3>
                            <span className="table-count">{products.length} products</span>
                        </div>

                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center' }}>Loading products...</div>
                        ) : (
                            <table className="products-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.length === 0 ? (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No products yet</td></tr>
                                    ) : (
                                        products.map((product) => {
                                            const status = getStockStatus(parseInt(product.stock) || 0);
                                            return (
                                                <tr key={product.id}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <img src={product.image || `https://picsum.photos/80?${product.id}`} alt="" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                                                            <span>{product.name}</span>
                                                        </div>
                                                    </td>
                                                    <td>${parseFloat(product.price || 0).toFixed(2)}</td>
                                                    <td>{product.stock}</td>
                                                    <td><span className={`status ${status.class}`}>{status.label}</span></td>
                                                    <td className="actions">
                                                        <button onClick={() => handleEdit(product)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>✏️</button>
                                                        <button onClick={() => handleDelete(product.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>🗑️</button>
                                                        <button onClick={() => handleViewStockHistory(product)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }} title="Stock History">📊</button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>

            {/* Stock History Modal */}
            {stockHistoryModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.7)', zIndex: 1000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }} onClick={() => setStockHistoryModal(null)}>
                    <div style={{
                        background: '#1a1a2e', width: '500px', maxHeight: '80vh', overflowY: 'auto',
                        borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ margin: 0 }}>Stock History — {stockHistoryModal.name}</h2>
                            <button onClick={() => setStockHistoryModal(null)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}>×</button>
                        </div>

                        {stockLoading ? (
                            <p style={{ color: '#b0b0cc' }}>Loading...</p>
                        ) : stockHistory.length === 0 ? (
                            <p style={{ color: '#b0b0cc', fontSize: '14px' }}>No stock changes recorded yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {stockHistory.map((entry, i) => (
                                    <div key={i} style={{
                                        background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '10px',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '14px' }}>{entry.reason}</p>
                                            <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                                                {new Date(entry.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <span style={{
                                            fontWeight: 'bold', fontSize: '16px',
                                            color: entry.change_amount > 0 ? '#10b981' : '#ef4444'
                                        }}>
                                            {entry.change_amount > 0 ? '+' : ''}{entry.change_amount}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default BusinessProducts;

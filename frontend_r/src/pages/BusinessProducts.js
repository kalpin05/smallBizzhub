import "../styles/dashboard.css";
import "../styles/BusinessProducts.css";
import Sidebar from "../components/Sidebar";

function BusinessProducts() {
    return (
        <div className="dashboard-container">

            {/* SIDEBAR */}
            <Sidebar userType="business" />

            {/* MAIN CONTENT */}
            <main className="dashboard-main">

                <header className="dashboard-topbar">
                    <div>
                        <h1 className="dashboard-title">Products Management</h1>
                        <p style={{ opacity: 0.7 }}>Manage your inventory and stock</p>
                    </div>
                    <button className="logout-btn" style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.1)' }}>Logout</button>
                </header>

                <div className="products-wrapper">

                    {/* ADD PRODUCT */}
                    <div className="glass-panel">
                        <h2>Add New Product</h2>

                        <div className="product-form">
                            <div className="full">
                                <label>Product Name</label>
                                <input placeholder="Product Name" />
                            </div>

                            <div className="two-col">
                                <div>
                                    <label>Product Description</label>
                                    <textarea placeholder="Product Description"></textarea>
                                </div>

                                <div>
                                    <label>Product Image</label>
                                    <div className="upload-box">
                                        <span>📷</span>
                                        <p>Upload Image</p>
                                    </div>
                                </div>
                            </div>

                            <div className="three-col">
                                <input placeholder="$ Price" />
                                <input placeholder="Stock Quantity" />
                                <div className="btn-row">
                                    <button className="btn-primary">Save Product</button>
                                    <button className="btn-secondary">Reset</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PRODUCTS TABLE */}
                    <div className="glass-panel">
                        <div className="table-header">
                            <h3>All Products</h3>
                            <span className="table-count">1 – 6 of 6</span>
                        </div>

                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>Product Image</th>
                                    <th>Product Name</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr>
                                    <td><img src="https://picsum.photos/80?1" alt="" /></td>
                                    <td>Wireless Headphones</td>
                                    <td>$99.99</td>
                                    <td>120</td>
                                    <td><span className="status active">Active</span></td>
                                    <td className="actions">
                                        ✏️ 🗑
                                    </td>
                                </tr>

                                <tr>
                                    <td><img src="https://picsum.photos/80?2" alt="" /></td>
                                    <td>Gaming Mouse</td>
                                    <td>$59.99</td>
                                    <td>0</td>
                                    <td><span className="status out">Out of Stock</span></td>
                                    <td className="actions">
                                        ✏️ 🗑
                                    </td>
                                </tr>

                                <tr>
                                    <td><img src="https://picsum.photos/80?3" alt="" /></td>
                                    <td>Laptop Stand</td>
                                    <td>$39.99</td>
                                    <td>150</td>
                                    <td><span className="status active">Active</span></td>
                                    <td className="actions">
                                        ✏️ 🗑
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            </main>
        </div>
    );
}

export default BusinessProducts;

import { useState } from "react";
import "../styles/businessProfile.css";
import "../styles/dashboard.css";
import Sidebar from "../components/Sidebar";

function BusinessProfile() {
    const [formData, setFormData] = useState({
        name: "John Doe",
        business: "Doe Electronics",
        email: "john@email.com",
        phone: "9876543210",
        category: "Electronics",
        location: "New York"
    });

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    function handleSubmit(e) {
        e.preventDefault();
        alert("Profile updated successfully!");
    }

    return (
        <div className="dashboard-container">

            {/* SIDEBAR */}
            <Sidebar userType="business" />

            {/* MAIN */}
            <main className="dashboard-main">

                <header className="dashboard-topbar">
                    <h1 className="dashboard-title">Business Profile</h1>
                    <button className="logout-btn" style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.1)' }}>Logout</button>
                </header>

                <section className="edit-card" style={{ maxWidth: '100%', margin: '0 auto' }}>

                    <div className="edit-body">

                        {/* Image */}
                        <div className="edit-left">
                            <div className="image-box">
                                <img src="https://i.pravatar.cc/200" alt="user" />
                                <span className="camera">📷</span>
                            </div>
                        </div>

                        {/* Form */}
                        <form className="edit-form" onSubmit={handleSubmit}>

                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Business Name</label>
                                <input
                                    name="business"
                                    value={formData.business}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option>Electronics</option>
                                    <option>Food</option>
                                    <option>Fashion</option>
                                    <option>Services</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Actions */}
                            <div className="form-actions">
                                <button type="submit" className="save-btn">
                                    Save Changes
                                </button>

                                <button type="button" className="cancel-btn">
                                    Cancel
                                </button>
                            </div>

                        </form>

                    </div>
                </section>
            </main>
        </div>
    );
}

export default BusinessProfile;

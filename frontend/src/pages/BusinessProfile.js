import { useState, useEffect } from "react";
import "../styles/businessProfile.css";
import "../styles/dashboard.css";
import Sidebar from "../components/Sidebar";
import { getProfile, updateProfile, logout } from "../services/api";
import { toast } from "react-toastify";

function BusinessProfile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        business: "",
        email: "",
        phone: "",
        category: "Electronics",
        location: ""
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await getProfile();
            setFormData({
                name: response.data.name || "",
                business: response.data.business_name || "",
                email: response.data.email || "",
                phone: response.data.phone || "",
                category: response.data.category || "Electronics",
                location: response.data.location || ""
            });
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        try {
            await updateProfile({
                name: formData.name,
                phone: formData.phone,
                location: formData.location,
                business_name: formData.business,
                category: formData.category
            });
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    }

    const handleLogout = () => {
        logout();
    };

    const handleCancel = () => {
        fetchProfile();
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <Sidebar userType="business" />
                <main className="dashboard-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div>Loading profile...</div>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <Sidebar userType="business" />
            <main className="dashboard-main">
                <header className="dashboard-topbar">
                    <h1 className="dashboard-title">Business Profile</h1>
                    <button onClick={handleLogout} className="logout-btn" style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.1)' }}>Logout</button>
                </header>

                <section className="edit-card" style={{ maxWidth: '100%', margin: '0 auto' }}>
                    <div className="edit-body">
                        <div className="edit-left">
                            <div className="image-box">
                                <img src="https://i.pravatar.cc/200" alt="user" />
                                <span className="camera">📷</span>
                            </div>
                        </div>

                        <form className="edit-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input name="name" value={formData.name} onChange={handleChange} />
                            </div>

                            <div className="form-group">
                                <label>Business Name</label>
                                <input name="business" value={formData.business} onChange={handleChange} />
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input name="email" type="email" value={formData.email} disabled style={{ opacity: 0.5 }} />
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input name="phone" value={formData.phone} onChange={handleChange} />
                            </div>

                            <div className="form-group">
                                <label>Category</label>
                                <select name="category" value={formData.category} onChange={handleChange}>
                                    <option>Electronics</option>
                                    <option>Food</option>
                                    <option>Fashion</option>
                                    <option>Services</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Location</label>
                                <input name="location" value={formData.location} onChange={handleChange} />
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="save-btn" disabled={saving}>
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                                <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default BusinessProfile;

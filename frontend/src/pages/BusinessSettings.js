import { useState } from "react";
import "../styles/businessSettings.css";
import Sidebar from "../components/Sidebar";
import { User, Bell, Lock, CreditCard, Camera } from "lucide-react";
import { getProfile, updateProfile, logout } from "../services/api";

function BusinessSettings() {
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        marketing: true
    });
    const [activeSection, setActiveSection] = useState("account");
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        businessName: "",
        email: "",
        currentPassword: "",
        newPassword: ""
    });

    const handleToggle = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSaveAccount = async () => {
        setSaving(true);
        try {
            await updateProfile({
                business_name: formData.businessName,
            });
            alert("Account settings saved!");
        } catch (error) {
            alert("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveNotifications = () => {
        alert("Notification preferences updated!");
    };

    const handleSaveSecurity = () => {
        if (formData.newPassword && formData.newPassword.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }
        alert("Security settings updated!");
    };

    const handleLogout = () => {
        logout();
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="settings-container">
            <Sidebar userType="business" />
            <main className="settings-main">
                <header className="settings-header">
                    <div>
                        <h2 className="dashboard-title">Settings & Preferences</h2>
                        <p style={{ opacity: 0.6, marginTop: '5px' }}>Manage your account settings and preferences</p>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </header>

                <div className="settings-content" style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 240px) 1fr', gap: '30px' }}>
                    <div className="settings-nav" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '20px', height: 'fit-content' }}>
                        {[
                            { id: 'account', label: 'Account', icon: <User size={18} /> },
                            { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
                            { id: 'security', label: 'Security', icon: <Lock size={18} /> },
                            { id: 'billing', label: 'Billing & Plans', icon: <CreditCard size={18} /> },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                                    background: activeSection === item.id ? '#3b82f6' : 'transparent',
                                    color: activeSection === item.id ? 'white' : 'rgba(255,255,255,0.7)',
                                    border: 'none', borderRadius: '10px', cursor: 'pointer', marginBottom: '8px',
                                    textAlign: 'left', fontWeight: '500', transition: 'all 0.2s'
                                }}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="settings-panels">
                        {activeSection === "account" && (
                            <section className="settings-section">
                                <h3>Profile Information</h3>
                                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', alignItems: 'center' }}>
                                    <div style={{ position: 'relative' }}>
                                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(JSON.parse(localStorage.getItem("user"))?.name || 'User')}&background=6366f1&color=fff`} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid #3b82f6' }} />
                                        <button style={{ position: 'absolute', bottom: '0', right: '0', background: '#3b82f6', border: 'none', borderRadius: '50%', padding: '6px', color: 'white', cursor: 'pointer' }}>
                                            <Camera size={14} />
                                        </button>
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0' }}>{JSON.parse(localStorage.getItem("user"))?.name || 'User'}</h4>
                                        <p style={{ margin: '0', opacity: 0.6, fontSize: '14px' }}>Business Owner • {JSON.parse(localStorage.getItem("user"))?.email}</p>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Business Name / User Name</label>
                                    <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} placeholder={JSON.parse(localStorage.getItem("user"))?.name} />
                                </div>

                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="contact@business.com" />
                                </div>

                                <div className="form-group">
                                    <label>Role</label>
                                    <input type="text" defaultValue="Owner / Admin" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                                </div>

                                <div className="settings-actions">
                                    <button className="save-btn" onClick={handleSaveAccount} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
                                </div>
                            </section>
                        )}

                        {activeSection === "notifications" && (
                            <section className="settings-section">
                                <h3>Notifications</h3>
                                <div className="toggle-row">
                                    <div className="toggle-label">
                                        <h4>Email Notifications</h4>
                                        <p>Receive updates about orders and promotions</p>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" checked={notifications.email} onChange={() => handleToggle('email')} />
                                        <span className="slider"></span>
                                    </label>
                                </div>

                                <div className="toggle-row">
                                    <div className="toggle-label">
                                        <h4>SMS Alerts</h4>
                                        <p>Get important updates via SMS</p>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" checked={notifications.sms} onChange={() => handleToggle('sms')} />
                                        <span className="slider"></span>
                                    </label>
                                </div>

                                <div className="settings-actions">
                                    <button className="save-btn" onClick={handleSaveNotifications}>Update Preferences</button>
                                </div>
                            </section>
                        )}

                        {activeSection === "security" && (
                            <section className="settings-section">
                                <h3>Security & Login</h3>
                                <div className="form-group">
                                    <label>Current Password</label>
                                    <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleInputChange} placeholder="••••••••" />
                                </div>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} placeholder="New strong password" />
                                </div>
                                <div className="toggle-row">
                                    <div className="toggle-label">
                                        <h4>Two-Factor Authentication</h4>
                                        <p>Add an extra layer of security</p>
                                    </div>
                                    <label className="switch"><input type="checkbox" /><span className="slider"></span></label>
                                </div>
                                <div className="settings-actions">
                                    <button className="save-btn" onClick={handleSaveSecurity}>Update Security</button>
                                </div>
                            </section>
                        )}

                        {activeSection === "billing" && (
                            <section className="settings-section">
                                <h3>Payment Methods</h3>
                                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ width: '50px', height: '32px', background: '#e0e0e0', borderRadius: '4px' }}></div>
                                            <div>
                                                <p style={{ margin: '0', fontWeight: 'bold' }}>•••• •••• •••• 4242</p>
                                                <p style={{ margin: '0', fontSize: '12px', opacity: 0.6 }}>Expires 12/28</p>
                                            </div>
                                        </div>
                                        <span style={{ padding: '4px 10px', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', borderRadius: '20px', fontSize: '12px' }}>Default</span>
                                    </div>
                                </div>
                                <button className="cancel-btn" style={{ width: '100%' }}>+ Add Payment Method</button>
                            </section>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default BusinessSettings;

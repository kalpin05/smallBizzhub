import { useState, useEffect } from "react";
import "../styles/businessSettings.css";
import Sidebar from "../components/Sidebar";
import { Bell, Lock, CreditCard } from "lucide-react";
import {
    logout, updateProfile,
    changePassword, toggle2FA,
    getNotificationPreferences, saveNotificationPreferences
} from "../services/api";

function BusinessSettings() {
    const [notifications, setNotifications] = useState({ email: true, sms: false, marketing: true });
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    const [activeSection, setActiveSection] = useState("notifications");
    const [saving, setSaving] = useState(false);
    const [twoFALoading, setTwoFALoading] = useState(false);
    const [notifLoading, setNotifLoading] = useState(false);

    const [formData, setFormData] = useState({
        businessName: "",
        email: "",
        currentPassword: "",
        newPassword: ""
    });

    const user = (() => {
        try { return JSON.parse(localStorage.getItem("user")) || {}; }
        catch { return {}; }
    })();

    /* Load notification prefs and 2FA status on mount */
    useEffect(() => {
        getNotificationPreferences()
            .then(res => {
                if (res.data?.prefs) setNotifications(res.data.prefs);
                if (res.data?.two_factor_enabled !== undefined) setTwoFAEnabled(res.data.two_factor_enabled);
            })
            .catch(err => console.error("Failed to load preferences:", err));
    }, []);

    const handleToggle = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };



    /* ── Notifications: save to DB and create notification ── */
    const handleSaveNotifications = async () => {
        setNotifLoading(true);
        try {
            await saveNotificationPreferences(notifications);
            alert("Notification preferences updated and saved!");
        } catch (error) {
            alert("Failed to save notification preferences: " + (error.response?.data?.error || error.message));
        } finally {
            setNotifLoading(false);
        }
    };

    /* ── Security: change password via backend ── */
    const handleSaveSecurity = async () => {
        if (!formData.currentPassword) {
            alert("Please enter your current password.");
            return;
        }
        if (!formData.newPassword || formData.newPassword.length < 6) {
            alert("New password must be at least 6 characters.");
            return;
        }
        setSaving(true);
        try {
            await changePassword({ currentPassword: formData.currentPassword, newPassword: formData.newPassword });
            alert("Password updated successfully! A security notification has been sent.");
            setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "" }));
        } catch (error) {
            alert("Failed: " + (error.response?.data?.error || error.message));
        } finally {
            setSaving(false);
        }
    };

    /* ── 2FA toggle: save to DB, send email confirmation ── */
    const handleToggle2FA = async () => {
        setTwoFALoading(true);
        const newVal = !twoFAEnabled;
        try {
            const res = await toggle2FA(newVal);
            setTwoFAEnabled(res.data.two_factor_enabled);
            alert(res.data.message);
        } catch (error) {
            alert("Failed to toggle 2FA: " + (error.response?.data?.error || error.message));
        } finally {
            setTwoFALoading(false);
        }
    };

    const handleLogout = () => logout();

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


                        {/* ── NOTIFICATIONS ── */}
                        {activeSection === "notifications" && (
                            <section className="settings-section">
                                <h3>Notification Preferences</h3>
                                <p style={{ opacity: 0.6, marginBottom: '24px', fontSize: '14px' }}>Changes are saved to the database and a confirmation notification will be created.</p>

                                <div className="toggle-row">
                                    <div className="toggle-label">
                                        <h4>Email Notifications</h4>
                                        <p>Receive order updates and alerts via email</p>
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

                                <div className="toggle-row">
                                    <div className="toggle-label">
                                        <h4>Marketing Emails</h4>
                                        <p>Receive tips, promotions and product news</p>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" checked={notifications.marketing} onChange={() => handleToggle('marketing')} />
                                        <span className="slider"></span>
                                    </label>
                                </div>

                                <div className="settings-actions">
                                    <button className="save-btn" onClick={handleSaveNotifications} disabled={notifLoading}>
                                        {notifLoading ? "Saving..." : "Save Notification Preferences"}
                                    </button>
                                </div>
                            </section>
                        )}

                        {/* ── SECURITY ── */}
                        {activeSection === "security" && (
                            <section className="settings-section">
                                <h3>Security & Login</h3>

                                {/* Password Change */}
                                <div style={{ marginBottom: '30px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <h4 style={{ marginBottom: '16px' }}>Change Password</h4>
                                    <p style={{ opacity: 0.6, fontSize: '13px', marginBottom: '16px' }}>Your password is updated in Supabase Auth and you'll receive a security notification.</p>
                                    <div className="form-group">
                                        <label>Current Password</label>
                                        <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleInputChange} placeholder="••••••••" />
                                    </div>
                                    <div className="form-group">
                                        <label>New Password</label>
                                        <input type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} placeholder="Min 6 characters" />
                                    </div>
                                    <div className="settings-actions">
                                        <button className="save-btn" onClick={handleSaveSecurity} disabled={saving}>{saving ? "Updating..." : "Update Password"}</button>
                                    </div>
                                </div>

                                {/* 2FA Toggle */}
                                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <h4 style={{ marginBottom: '8px' }}>Two-Factor Authentication (2FA)</h4>
                                    <p style={{ opacity: 0.6, fontSize: '13px', marginBottom: '16px' }}>
                                        When enabled, your 2FA status is stored in the database and a confirmation email is sent to your address.
                                    </p>

                                    <div className="toggle-row" style={{ marginBottom: "16px" }}>
                                        <div className="toggle-label">
                                            <h4>Enable 2FA</h4>
                                            <p style={{ color: twoFAEnabled ? '#4ade80' : '#b0b0cc' }}>
                                                {twoFAEnabled ? "✔ Currently ENABLED" : "Currently disabled"}
                                            </p>
                                        </div>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={twoFAEnabled}
                                                onChange={handleToggle2FA}
                                                disabled={twoFALoading}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </div>

                                    {twoFALoading && <p style={{ color: '#b0b0cc', fontSize: '13px' }}>Saving 2FA setting...</p>}
                                </div>
                            </section>
                        )}

                        {/* ── BILLING ── */}
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

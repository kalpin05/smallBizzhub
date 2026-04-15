import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  adminGetStats,
  adminGetUsers,
  adminGetProducts,
  adminGetOrders,
  adminDeleteUser,
  adminDeleteProduct,
} from "../services/api";
import { toast } from "react-toastify";
import { getSafeStorage } from "../utils/storage";
import "../styles/adminDashboard.css";

/* ── Simple confirm helper ── */
function confirmDelete(name) {
  return window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`);
}

/* ── Format date ── */
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/* ─── Tabs ─────────────────────────────────────────────────── */
const TABS = [
  { key: "overview",   icon: "📊", label: "Overview"   },
  { key: "clients",    icon: "👤", label: "Clients"    },
  { key: "businesses", icon: "🏪", label: "Businesses" },
  { key: "products",   icon: "📦", label: "Products"   },
  { key: "orders",     icon: "📋", label: "Orders"     },
];

/* ═══════════════════════════════════════════════════════════ */
function AdminDashboard() {
  const navigate   = useNavigate();
  const [tab, setTab]       = useState("overview");
  const [stats, setStats]   = useState(null);
  const [users, setUsers]   = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const adminUser = getSafeStorage("user", {});

  /* ── Auth guard ── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || adminUser.role !== "admin") {
      navigate("/admin-login");
    }
  }, []);

  /* ── Fetch stats ── */
  useEffect(() => {
    adminGetStats().then(r => setStats(r.data)).catch(console.error);
  }, []);

  /* ── Fetch data by tab ── */
  const fetchTab = useCallback(async (t) => {
    setLoading(true);
    setSearch("");
    try {
      if (t === "clients" || t === "businesses") {
        const r = await adminGetUsers();
        setUsers(r.data);
      } else if (t === "products") {
        const r = await adminGetProducts();
        setProducts(r.data);
      } else if (t === "orders") {
        const r = await adminGetOrders();
        setOrders(r.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (tab !== "overview") fetchTab(tab); }, [tab]);

  /* ── Delete handlers ── */
  async function handleDeleteUser(id, name) {
    if (!confirmDelete(name)) return;
    try {
      await adminDeleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      adminGetStats().then(r => setStats(r.data)).catch(() => {});
    } catch (err) {
      toast.error("Delete failed: " + (err.uiMessage || err.message));
    }
  }

  async function handleDeleteProduct(id, name) {
    if (!confirmDelete(name)) return;
    try {
      await adminDeleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      adminGetStats().then(r => setStats(r.data)).catch(() => {});
    } catch (err) {
      toast.error("Delete failed: " + (err.uiMessage || err.message));
    }
  }

  /* ── Logout ── */
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin-login");
  }

  /* ── Filtered lists ── */
  const q = search.toLowerCase();

  const filteredClients = users
    .filter(u => u.role === "client")
    .filter(u => !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));

  const filteredBiz = users
    .filter(u => u.role === "business")
    .filter(u => !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));

  const filteredProducts = products
    .filter(p => !q || p.name?.toLowerCase().includes(q) || p.business_name?.toLowerCase().includes(q));

  const filteredOrders = orders
    .filter(o => !q || o.client_name?.toLowerCase().includes(q) || o.business_name?.toLowerCase().includes(q) || o.status?.toLowerCase().includes(q));

  /* ── Tab title ── */
  const tabInfo = TABS.find(t => t.key === tab);

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <div className="admin-container">

      {/* ── SIDEBAR ── */}
      <aside className="admin-sidebar">
        <div className="admin-brand">🛡️ Admin Panel</div>

        {TABS.map(t => (
          <button
            key={t.key}
            className={`admin-nav-item ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
            style={{ border: "none", background: "none", width: "100%", textAlign: "left", cursor: "pointer" }}
          >
            <span>{t.icon}</span> {t.label}
            {t.key === "clients"    && stats && <span className="count-pill">{stats.totalUsers - (stats.totalBusinesses || 0)}</span>}
            {t.key === "businesses" && stats && <span className="count-pill">{stats.totalBusinesses}</span>}
            {t.key === "products"   && stats && <span className="count-pill">{stats.totalProducts}</span>}
            {t.key === "orders"     && stats && <span className="count-pill">{stats.totalOrders}</span>}
          </button>
        ))}

        <div className="admin-sidebar-footer">
          <div style={{ fontSize: "0.78rem", opacity: 0.5, marginBottom: "0.7rem", padding: "0 0.8rem" }}>
            Signed in as<br /><strong>{adminUser.name || adminUser.email}</strong>
          </div>
          <button className="admin-logout-btn" onClick={logout}>🚪 Logout</button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="admin-main">

        {/* Topbar */}
        <div className="admin-topbar">
          <h2>{tabInfo?.icon} {tabInfo?.label}</h2>
          <div style={{ fontSize: "0.82rem", opacity: 0.55 }}>
            SmallBizHub Admin · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long" })}
          </div>
        </div>

        <div className="admin-content">

          {/* ━━ OVERVIEW ━━ */}
          {tab === "overview" && (
            <>
              <div className="admin-stats">
                <div className="admin-stat-card">
                  <div className="admin-stat-icon">👥</div>
                  <div className="admin-stat-label">Total Users</div>
                  <div className="admin-stat-value" style={{ color: "#60a5fa" }}>
                    {stats ? stats.totalUsers : "—"}
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-icon">🏪</div>
                  <div className="admin-stat-label">Businesses</div>
                  <div className="admin-stat-value" style={{ color: "#34d399" }}>
                    {stats ? stats.totalBusinesses : "—"}
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-icon">📦</div>
                  <div className="admin-stat-label">Products</div>
                  <div className="admin-stat-value" style={{ color: "#a78bfa" }}>
                    {stats ? stats.totalProducts : "—"}
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-icon">📋</div>
                  <div className="admin-stat-label">Orders</div>
                  <div className="admin-stat-value" style={{ color: "#fb923c" }}>
                    {stats ? stats.totalOrders : "—"}
                  </div>
                </div>
              </div>

              <p style={{ opacity: 0.5, fontSize: "0.9rem" }}>
                Use the sidebar to browse and manage clients, businesses, products, and orders.
              </p>
            </>
          )}

          {/* ━━ CLIENTS ━━ */}
          {tab === "clients" && (
            <>
              <div className="admin-toolbar">
                <div className="admin-section-title">
                  All Clients <span className="count-pill">{filteredClients.length}</span>
                </div>
                <input
                  className="admin-search"
                  placeholder="Search by name or email…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {loading ? <div className="admin-loading">Loading…</div> : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Joined</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClients.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: "center", opacity: 0.4, padding: "2rem" }}>No clients found</td></tr>
                      ) : filteredClients.map(u => (
                        <tr key={u.id}>
                          <td><strong>{u.name}</strong></td>
                          <td style={{ opacity: 0.75 }}>{u.email}</td>
                          <td style={{ opacity: 0.6 }}>{u.phone || "—"}</td>
                          <td style={{ opacity: 0.6 }}>{fmtDate(u.created_at)}</td>
                          <td>
                            <button className="admin-delete-btn" onClick={() => handleDeleteUser(u.id, u.name)}>
                              🗑 Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ━━ BUSINESSES ━━ */}
          {tab === "businesses" && (
            <>
              <div className="admin-toolbar">
                <div className="admin-section-title">
                  All Businesses <span className="count-pill">{filteredBiz.length}</span>
                </div>
                <input
                  className="admin-search"
                  placeholder="Search by name or email…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {loading ? <div className="admin-loading">Loading…</div> : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Owner Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Joined</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBiz.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: "center", opacity: 0.4, padding: "2rem" }}>No businesses found</td></tr>
                      ) : filteredBiz.map(u => (
                        <tr key={u.id}>
                          <td><strong>{u.name}</strong></td>
                          <td style={{ opacity: 0.75 }}>{u.email}</td>
                          <td style={{ opacity: 0.6 }}>{u.phone || "—"}</td>
                          <td style={{ opacity: 0.6 }}>{fmtDate(u.created_at)}</td>
                          <td>
                            <button className="admin-delete-btn" onClick={() => handleDeleteUser(u.id, u.name)}>
                              🗑 Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ━━ PRODUCTS ━━ */}
          {tab === "products" && (
            <>
              <div className="admin-toolbar">
                <div className="admin-section-title">
                  All Products <span className="count-pill">{filteredProducts.length}</span>
                </div>
                <input
                  className="admin-search"
                  placeholder="Search by product or business name…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {loading ? <div className="admin-loading">Loading…</div> : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Business</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Listed On</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length === 0 ? (
                        <tr><td colSpan={6} style={{ textAlign: "center", opacity: 0.4, padding: "2rem" }}>No products found</td></tr>
                      ) : filteredProducts.map(p => (
                        <tr key={p.id}>
                          <td><strong>{p.name}</strong></td>
                          <td style={{ opacity: 0.75 }}>{p.business_name}</td>
                          <td>₹{parseFloat(p.price).toFixed(2)}</td>
                          <td>
                            <span style={{
                              color: p.stock === 0 ? "#f87171" : p.stock < 5 ? "#facc15" : "inherit",
                              fontWeight: p.stock < 5 ? 700 : 400,
                            }}>
                              {p.stock}
                            </span>
                          </td>
                          <td style={{ opacity: 0.6 }}>{fmtDate(p.created_at)}</td>
                          <td>
                            <button className="admin-delete-btn" onClick={() => handleDeleteProduct(p.id, p.name)}>
                              🗑 Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ━━ ORDERS ━━ */}
          {tab === "orders" && (
            <>
              <div className="admin-toolbar">
                <div className="admin-section-title">
                  All Orders <span className="count-pill">{filteredOrders.length}</span>
                </div>
                <input
                  className="admin-search"
                  placeholder="Search by client, business, or status…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {loading ? <div className="admin-loading">Loading…</div> : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Business</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: "center", opacity: 0.4, padding: "2rem" }}>No orders found</td></tr>
                      ) : filteredOrders.map(o => (
                        <tr key={o.id}>
                          <td>
                            <strong>{o.client_name}</strong>
                            <div style={{ fontSize: "0.75rem", opacity: 0.55 }}>{o.client_email}</div>
                          </td>
                          <td style={{ opacity: 0.75 }}>{o.business_name}</td>
                          <td>₹{parseFloat(o.total_amount).toFixed(2)}</td>
                          <td>
                            <span className={`status-badge ${o.status}`}>{o.status}</span>
                          </td>
                          <td style={{ opacity: 0.6 }}>{fmtDate(o.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;

import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  User,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  MessageCircle,
  Bell
} from "lucide-react";

import "../styles/dashboard.css";

function BusinessDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(230);

  const isActive = (path) => location.pathname.includes(path);

  /* ================= STATIC DATA ================= */

  const stats = [
    {
      title: "Total Orders",
      value: "1,250",
      sub: "Last 7 Days: 85",
      icon: <ShoppingCart />
    },
    {
      title: "Revenue",
      value: "$24,580",
      sub: "This Month: +$5,200",
      icon: <DollarSign />
    },
    {
      title: "Active Products",
      value: "56",
      sub: "In Stock: 42",
      icon: <Package />
    },
    {
      title: "Messages",
      value: "18",
      sub: "2 New Messages",
      icon: <MessageCircle />
    }
  ];

  const orders = [
    {
      id: "#10234",
      customer: "Alice Smith",
      date: "03/22/2023",
      status: "completed",
      total: "$120.00"
    },
    {
      id: "#10233",
      customer: "Mitchell Brown",
      date: "03/21/2023",
      status: "pending",
      total: "$85.50"
    },
    {
      id: "#10232",
      customer: "Sarah Lee",
      date: "03/20/2023",
      status: "shipped",
      total: "$210.00"
    },
    {
      id: "#10231",
      customer: "David Johnson",
      date: "03/19/2023",
      status: "cancelled",
      total: "$45.00"
    }
  ];

  const notifications = [
    {
      title: "New message from James",
      desc: "Hi Mike, is this product still available?",
      time: "1 hour ago"
    },
    {
      title: "Low stock alert",
      desc: "Product ABC is running low on stock.",
      time: "2 hours ago"
    },
    {
      title: "Order #10231 cancelled",
      desc: "Order has been cancelled by customer.",
      time: "3 hours ago"
    }
  ];

  return (
    <div className="dashboard-container">

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`sidebar ${collapsed ? "collapsed" : ""}`}
        style={{ width: collapsed ? 70 : sidebarWidth }}
      >
        {/* PROFILE */}
        <div className="sidebar-profile">
          <img src="https://i.pravatar.cc/100" alt="profile" />
          {!collapsed && (
            <>
              <p>Hello,</p>
              <h3>"card signup-card.name"</h3>
            </>
          )}
        </div>

        {/* NAV */}
        <nav>
          <SidebarItem
            icon={<LayoutDashboard />}
            label="Dashboard"
            active={isActive("/business-dashboard")}
            collapsed={collapsed}
            onClick={() => navigate("/business-dashboard")}
          />
          <SidebarItem
            icon={<User />}
            label="My Profile"
            active={isActive("/profile")}
            collapsed={collapsed}
            onClick={() => navigate("/business-profile")}
          />
          <SidebarItem
            icon={<Package />}
            label="Products"
            active={isActive("/products")}
            collapsed={collapsed}
            onClick={() => navigate("/business-add-product")}
          />
          <SidebarItem
            icon={<ShoppingCart />}
            label="Orders"
            active={isActive("/orders")}
            collapsed={collapsed}
            onClick={() => navigate("/orders")}
          />
          <SidebarItem
            icon={<BarChart3 />}
            label="Analytics"
            active={isActive("/analytics")}
            collapsed={collapsed}
            onClick={() => navigate("/BusinessAnalytics")}
          />
          <SidebarItem
            icon={<Settings />}
            label="Settings"
            active={isActive("/settings")}
            collapsed={collapsed}
            onClick={() => navigate("/business-dashboard/settings")}
          />
        </nav>

        {/* RESIZE */}
        {!collapsed && (
          <input
            type="range"
            min="200"
            max="300"
            value={sidebarWidth}
            className="sidebar-resizer"
            onChange={(e) => setSidebarWidth(e.target.value)}
          />
        )}

        {/* TOGGLE */}
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="dashboard-main">
        <h1 className="dashboard-title">
          Welcome back, Business Owner
        </h1>

        {/* ================= STATS ================= */}
        <div className="stats">
          {stats.map((item, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-icon">{item.icon}</div>
              <h3>{item.value}</h3>
              <p>{item.title}</p>
              <span>{item.sub}</span>
            </div>
          ))}
        </div>

        {/* ================= CONTENT GRID ================= */}
        <div className="content-grid">

          {/* ORDERS */}
          <div className="card">
            <h3>Recent Orders</h3>
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr key={i}>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.date}</td>
                    <td className={`status ${order.status}`}>
                      {order.status}
                    </td>
                    <td>{order.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* NOTIFICATIONS */}
          <div className="card">
            <h3>Notifications</h3>
            <ul className="notifications">
              {notifications.map((note, i) => (
                <li key={i}>
                  <strong>{note.title}</strong>
                  <p>{note.desc}</p>
                  <small>{note.time}</small>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Nested Routes (Profile, Products, etc.) */}
        <Outlet />
      </main>
    </div>
  );
}

/* ================= SIDEBAR ITEM ================= */

function SidebarItem({ icon, label, active, collapsed, onClick }) {
  return (
    <div
      className={`sidebar-item ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <span className="icon">{icon}</span>
      {!collapsed && <span className="label">{label}</span>}
    </div>
  );
}

export default BusinessDashboard;

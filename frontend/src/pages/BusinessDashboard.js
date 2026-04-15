import { useState, useEffect } from "react";
import {
  DollarSign,
  MessageCircle,
  ShoppingCart,
  Package
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";
import { getBusinessOrders, getBusinessProducts, getAnalytics, logout } from "../services/api";
import { getSafeStorage } from "../utils/storage";

function BusinessDashboard() {
  const [stats, setStats] = useState([
    { title: "Total Orders", value: "0", sub: "Loading...", icon: <ShoppingCart /> },
    { title: "Revenue", value: "$0", sub: "Loading...", icon: <DollarSign /> },
    { title: "Active Products", value: "0", sub: "Loading...", icon: <Package /> },
    { title: "Messages", value: "0", sub: "No new messages", icon: <MessageCircle /> }
  ]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([
    { title: "Welcome", desc: "Your dashboard is ready", time: "Just now" }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, productsRes, analyticsRes] = await Promise.all([
        getBusinessOrders(),
        getBusinessProducts(),
        getAnalytics().catch(() => ({ data: {} }))
      ]);

      const ordersData = ordersRes.data || [];
      const productsData = productsRes.data || [];
      const analyticsData = analyticsRes.data || {};

      // Calculate stats
      const totalRevenue = ordersData.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
      const completedOrders = ordersData.filter(o => o.status === 'completed').length;
      const pendingOrders = ordersData.filter(o => o.status === 'pending').length;

      setStats([
        {
          title: "Total Orders",
          value: ordersData.length.toString(),
          sub: `${completedOrders} Completed, ${pendingOrders} Pending`,
          icon: <ShoppingCart />
        },
        {
          title: "Revenue",
          value: `$${totalRevenue.toFixed(2)}`,
          sub: `From ${ordersData.length} orders`,
          icon: <DollarSign />
        },
        {
          title: "Active Products",
          value: productsData.length.toString(),
          sub: "In Stock",
          icon: <Package />
        },
        {
          title: "Messages",
          value: "0",
          sub: "No new messages",
          icon: <MessageCircle />
        }
      ]);

      // Get recent orders (last 4)
      setOrders(ordersData.slice(0, 4).map(o => ({
        id: `#${o.id?.toString().slice(-5) || '00000'}`,
        customer: o.client?.name || 'Unknown',
        date: new Date(o.created_at).toLocaleDateString(),
        status: o.status || 'pending',
        total: `$${parseFloat(o.total || 0).toFixed(2)}`
      })));

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard-container">
      <Sidebar userType="business" collapsible={true} resizable={true} />

      <main className="dashboard-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="dashboard-title">Welcome back, {getSafeStorage("user", {name: 'Business Owner'})?.name || 'Business Owner'}</h1>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading dashboard...</div>
        ) : (
          <>
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

            <div className="content-grid">
              <div className="card">
                <h3>Recent Orders</h3>
                {orders.length === 0 ? (
                  <p>No orders yet</p>
                ) : (
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
                          <td className={`status ${order.status}`}>{order.status}</td>
                          <td>{order.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

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
          </>
        )}
      </main>
    </div>
  );
}

export default BusinessDashboard;

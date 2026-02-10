import { Outlet } from "react-router-dom";
import {
  DollarSign,
  MessageCircle,
  ShoppingCart,
  Package
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";

function BusinessDashboard() {
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

      {/* ================= SIDEBAR (XML-BASED) ================= */}
      <Sidebar userType="business" collapsible={true} resizable={true} />

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


export default BusinessDashboard;

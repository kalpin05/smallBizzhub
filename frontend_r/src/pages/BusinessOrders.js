import { useState } from "react";
import "../styles/businessOrders.css";
import "../styles/dashboard.css";
import Sidebar from "../components/Sidebar";
import { Search, Eye, MoreVertical } from "lucide-react";

function BusinessOrders() {

  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const orders = [
    {
      id: "#10234",
      customer: "Alice Smith",
      date: "03/22/2023",
      status: "completed",
      total: 120,
      payment: "UPI",
      items: 3
    },
    {
      id: "#10233",
      customer: "Mitchell Brown",
      date: "03/21/2023",
      status: "pending",
      total: 85.5,
      payment: "Card",
      items: 1
    },
    {
      id: "#10232",
      customer: "Sarah Lee",
      date: "03/20/2023",
      status: "shipped",
      total: 210,
      payment: "Cash",
      items: 5
    },
    {
      id: "#10231",
      customer: "David Johnson",
      date: "03/19/2023",
      status: "cancelled",
      total: 45,
      payment: "UPI",
      items: 2
    },
    {
      id: "#10230",
      customer: "Emily Chen",
      date: "03/18/2023",
      status: "pending",
      total: 320.00,
      payment: "Card",
      items: 4
    }
  ];

  const filteredOrders = orders.filter(order => {
    const matchesStatus = activeTab === "all" || order.status === activeTab;
    const matchesSearch =
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="dashboard-container">

      {/* SIDEBAR */}
      <Sidebar userType="business" />

      {/* MAIN */}
      <main className="dashboard-main">

        <header className="dashboard-topbar">
          <div>
            <h1 className="dashboard-title">Order Management</h1>
            <p style={{ opacity: 0.7 }}>Track and manage your customer orders</p>
          </div>
          <button className="logout-btn" style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.1)' }}>Logout</button>
        </header>

        {/* CONTROLS */}
        <div className="orders-controls" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>

          {/* TABS */}
          <div className="status-tabs" style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '5px', borderRadius: '12px' }}>
            {['all', 'pending', 'shipped', 'completed', 'cancelled'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? '#3b82f6' : 'transparent',
                  color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.6)',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* SEARCH */}
          <div className="search-box" style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '10px 10px 10px 40px',
                borderRadius: '10px',
                color: 'white',
                outline: 'none',
                minWidth: '250px'
              }}
            />
          </div>

        </div>

        {/* TABLE CARD */}
        <section className="borders-card" style={{ maxWidth: '100%', margin: '0 auto' }}>

          <div className="borders-table">

            {/* HEADER ROW */}
            <div className="borders-head">
              <span>Order ID</span>
              <span>Customer</span>
              <span>Date</span>
              <span>Items</span>
              <span>Status</span>
              <span>Total</span>
              <span>Action</span>
            </div>

            {/* DATA ROWS */}
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => (
                <div className="borders-row" key={index} style={{ transition: 'background 0.2s', cursor: 'pointer' }}>
                  <span style={{ fontWeight: '600', color: '#60a5fa' }}>{order.id}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                      {order.customer.charAt(0)}
                    </div>
                    <span>{order.customer}</span>
                  </div>
                  <span>{order.date}</span>
                  <span>{order.items} Items</span>
                  <span className={`bstatus ${order.status}`}>
                    {order.status}
                  </span>
                  <span style={{ fontWeight: 'bold' }}>${order.total.toFixed(2)}</span>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="view-btn" style={{ padding: '6px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                      <Eye size={16} />
                    </button>
                    <button className="view-btn" style={{ padding: '6px', background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                <p>No orders found matching your criteria.</p>
              </div>
            )}
          </div>

        </section>

      </main>
    </div>
  );
}

export default BusinessOrders;

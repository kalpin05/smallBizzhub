import { useState, useEffect } from "react";
import "../styles/businessOrders.css";
import "../styles/dashboard.css";
import Sidebar from "../components/Sidebar";
import { Search, Eye, MoreVertical } from "lucide-react";
import { getBusinessOrders, updateOrderStatus, logout } from "../services/api";

function BusinessOrders() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getBusinessOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      alert(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    }
  };

  /* Modal State */
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleLogout = () => {
    logout();
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = activeTab === "all" || order.status === activeTab;
    const matchesSearch =
      (order.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.id?.toString() || '').includes(searchTerm);
    return matchesStatus && matchesSearch;
  });


  return (
    <div className="dashboard-container">
      <Sidebar userType="business" />

      <main className="dashboard-main">
        {/* MODAL for Viewing Order */}
        {selectedOrder && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'
          }} onClick={() => setSelectedOrder(null)}>
            <div style={{
              background: '#1e293b', width: '500px', maxHeight: '80vh', overflowY: 'auto',
              borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)'
            }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: 'white' }}>Order Details</h2>
                <button onClick={() => setSelectedOrder(null)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}>×</button>
              </div>

              <div style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                <p><strong>Order ID:</strong> #{selectedOrder.id}</p>
                <p><strong>Status:</strong> <span className={`bstatus ${selectedOrder.status}`}>{selectedOrder.status}</span></p>
                <p><strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 10px', fontSize: '16px', color: '#94a3b8' }}>Customer Information</h3>
                <p style={{ margin: '4px 0' }}><strong>Name:</strong> {selectedOrder.client?.name || 'Unknown'}</p>
                <p style={{ margin: '4px 0' }}><strong>Email:</strong> {selectedOrder.client?.email || 'N/A'}</p>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Items Ordered</h3>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '12px' }}>
                        <th style={{ padding: '8px 0' }}>Item</th>
                        <th style={{ padding: '8px 0', textAlign: 'right' }}>Qty</th>
                        <th style={{ padding: '8px 0', textAlign: 'right' }}>Price</th>
                        <th style={{ padding: '8px 0', textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '12px 0' }}>{item.name || 'Unknown Item'}</td>
                          <td style={{ padding: '12px 0', textAlign: 'right' }}>{item.quantity}</td>
                          <td style={{ padding: '12px 0', textAlign: 'right' }}>${item.price}</td>
                          <td style={{ padding: '12px 0', textAlign: 'right' }}>${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No items found in this order.</p>
                )}
                <div style={{ marginTop: '20px', textAlign: 'right', fontSize: '18px', fontWeight: 'bold', color: '#3b82f6' }}>
                  Total: ${parseFloat(selectedOrder.total).toFixed(2)}
                </div>
              </div>

              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setSelectedOrder(null)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                  style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  <option value="pending">Mark as Pending</option>
                  <option value="shipped">Mark as Shipped</option>
                  <option value="completed">Mark as Completed</option>
                  <option value="cancelled">Mark as Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <header className="dashboard-topbar">
          <div>
            <h1 className="dashboard-title">Order Management</h1>
            <p style={{ opacity: 0.7 }}>Track and manage your customer orders</p>
          </div>
          <button onClick={handleLogout} className="logout-btn" style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.1)' }}>Logout</button>
        </header>

        <div className="orders-controls" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
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

        <section className="borders-card" style={{ maxWidth: '100%', margin: '0 auto' }}>
          <div className="borders-table">
            <div className="borders-head">
              <span>Order ID</span>
              <span>Customer</span>
              <span>Date</span>
              <span>Status</span>
              <span>Total</span>
              <span>Action</span>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Loading orders...</div>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div className="borders-row" key={order.id} style={{ transition: 'background 0.2s', cursor: 'pointer' }} onClick={() => handleViewOrder(order)}>
                  <span style={{ fontWeight: '600', color: '#60a5fa' }}>#{order.id?.toString().slice(-5)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                      {(order.client?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span>{order.client?.name || 'Unknown'}</span>
                  </div>
                  <span>{new Date(order.created_at).toLocaleDateString()}</span>
                  <span className={`bstatus ${order.status}`}>{order.status}</span>
                  <span style={{ fontWeight: 'bold' }}>${parseFloat(order.total || 0).toFixed(2)}</span>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={(e) => { e.stopPropagation(); handleViewOrder(order); }} className="view-btn" style={{ padding: '6px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                      <Eye size={16} />
                    </button>
                    <select
                      value={order.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                <p>No orders found.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default BusinessOrders;

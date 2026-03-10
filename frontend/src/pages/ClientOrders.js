import "../styles/clientOrders.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getClientOrders, logout } from "../services/api";

function ClientOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getClientOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  /* Modal State */
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  const getStatusClass = (status) => {
    return status?.toLowerCase() || 'pending';
  };

  // Calculate stats
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="orders-container">
      {/* MODAL for Viewing Order */}
      {selectedOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'
        }} onClick={() => setSelectedOrder(null)}>
          <div style={{
            background: 'white', width: '500px', maxHeight: '80vh', overflowY: 'auto',
            borderRadius: '12px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#1e293b' }}>Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ color: '#475569', marginBottom: '20px' }}>
              <p><strong>Order ID:</strong> #{selectedOrder.id}</p>
              <p><strong>Status:</strong> <span className={`status ${selectedOrder.status}`}>{selectedOrder.status}</span></p>
              <p><strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
              <p><strong>Business:</strong> {selectedOrder.business?.name || 'Unknown'}</p>
            </div>

            <div>
              <h3 style={{ fontSize: '16px', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Items Ordered</h3>
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
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 0', color: '#334155' }}>{item.name || 'Unknown Item'}</td>
                        <td style={{ padding: '12px 0', textAlign: 'right', color: '#64748b' }}>{item.quantity}</td>
                        <td style={{ padding: '12px 0', textAlign: 'right', color: '#64748b' }}>${item.price}</td>
                        <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 'bold', color: '#334155' }}>${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#64748b' }}>No items found in this order.</p>
              )}
              <div style={{ marginTop: '20px', textAlign: 'right', fontSize: '18px', fontWeight: 'bold', color: '#3b82f6' }}>
                Total: ${parseFloat(selectedOrder.total).toFixed(2)}
              </div>
            </div>

            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedOrder(null)} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="orders-header">
        <h2>SmallBizHub</h2>
        <nav>
          <span onClick={() => navigate("/client-discover")} style={{ cursor: 'pointer' }}>Home</span>
          <span>Services</span>
          <span>Support</span>
          <span>Contact</span>
        </nav>
      </header>

      {/* LAYOUT */}
      <div className="orders-layout">
        {/* SIDEBAR */}
        <aside className="orders-sidebar">
          <button onClick={() => navigate("/client-discover")}>Dashboard</button>
          <button onClick={() => navigate("/client-profile")}>My Profile</button>
          <button className="active">Orders</button>
          <button onClick={handleLogout} style={{ background: '#ef4444', marginTop: '20px' }}>Logout</button>
        </aside>

        {/* MAIN */}
        <main className="orders-main">
          <h1>My Orders</h1>
          <p className="subtitle">Track and manage your orders.</p>

          <div className="orders-content">
            {/* TABLE */}
            <div className="orders-table">
              <div className="table-head">
                <span>Order ID</span>
                <span>Business</span>
                <span>Date</span>
                <span>Status</span>
                <span>Total</span>
                <span>Action</span>
              </div>

              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>Loading orders...</div>
              ) : orders.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>No orders found.</div>
              ) : (
                orders.map((order, index) => (
                  <div className="table-row" key={order.id || index}>
                    <span>#{order.id?.toString().slice(-5) || '00000'}</span>
                    <span>{order.business?.name || 'Unknown'}</span>
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    <span className={`status ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                    <span>${parseFloat(order.total || 0).toFixed(2)}</span>
                    <button className="view-btn" onClick={() => handleViewOrder(order)}>
                      View
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* SUMMARY */}
            <div className="orders-summary">
              <div className="summary-box">
                <h4>Total Orders</h4>
                <p>{totalOrders}</p>
              </div>
              <div className="summary-box">
                <h4>Total Spent</h4>
                <p>${totalRevenue.toFixed(2)}</p>
              </div>
              <div className="summary-box">
                <h4>Pending Orders</h4>
                <p>{pendingOrders}</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* FOOTER */}
      <footer className="orders-footer">
        <p>Privacy Policy | Terms of Service | Help</p>
      </footer>
    </div>
  );
}

export default ClientOrders;

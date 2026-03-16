import { useState, useEffect } from "react";
import "../styles/businessAnalytics.css";
import "../styles/dashboard.css";
import Sidebar from "../components/Sidebar";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, ShoppingBag, Package, TrendingUp } from "lucide-react";
import { getAnalytics, logout } from "../services/api";

function BusinessAnalytics() {
  const [stats, setStats] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await getAnalytics();
      const data = response.data || {};

      setStats([
        {
          title: "Total Revenue",
          value: `₹${(data.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          icon: <DollarSign size={20} color="#10b981" />,
          color: "#10b981"
        },
        {
          title: "Total Orders",
          value: (data.totalOrders || 0).toString(),
          icon: <ShoppingBag size={20} color="#f59e0b" />,
          color: "#f59e0b"
        },
        {
          title: "Total Products",
          value: (data.totalProducts || 0).toString(),
          icon: <Package size={20} color="#8b5cf6" />,
          color: "#8b5cf6"
        },
        {
          title: "Avg. Order Value",
          value: data.totalOrders > 0
            ? `₹${(data.totalRevenue / data.totalOrders).toFixed(2)}`
            : "₹0",
          icon: <TrendingUp size={20} color="#3b82f6" />,
          color: "#3b82f6"
        }
      ]);

      setMonthlyRevenue(data.monthlyRevenue || []);
      setCategoryBreakdown(data.categoryBreakdown || []);
      setRecentOrders(data.recentOrders || []);
      setStatusCounts(data.statusCounts || {});
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  const statusColors = {
    pending: '#f59e0b',
    processing: '#3b82f6',
    shipped: '#8b5cf6',
    completed: '#10b981',
    cancelled: '#ef4444'
  };

  const hasData = monthlyRevenue.length > 0 || categoryBreakdown.length > 0;

  return (
    <div className="dashboard-container">
      <Sidebar userType="business" />
      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <h1 className="dashboard-title">Analytics Overview</h1>
            <p style={{ opacity: 0.7 }}>Real-time insights from your business data</p>
          </div>
          <button onClick={handleLogout} className="logout-btn" style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.1)' }}>Logout</button>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading analytics...</div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="stats-grid" style={{ marginBottom: '30px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              {stats.map((stat, index) => (
                <div className="stat-card" key={index} style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '5px' }}>{stat.title}</p>
                      <h2 style={{ fontSize: '28px', margin: '0' }}>{stat.value}</h2>
                    </div>
                    <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!hasData ? (
              /* Empty State */
              <div style={{
                textAlign: 'center', padding: '60px 20px',
                background: 'rgba(255,255,255,0.03)', borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                <ShoppingBag size={48} color="rgba(255,255,255,0.2)" style={{ marginBottom: '16px' }} />
                <h3 style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>No Sales Data Yet</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
                  Charts will populate once customers start placing orders. Add products and share your store to get started!
                </p>
              </div>
            ) : (
              <>
                {/* Charts Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>

                  {/* Revenue Trend Chart */}
                  <div style={{ background: 'rgba(255,255,255,0.06)', padding: '20px', borderRadius: '16px', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ marginBottom: '20px' }}>Revenue Trend</h3>
                    {monthlyRevenue.length > 0 ? (
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                          <AreaChart data={monthlyRevenue}>
                            <defs>
                              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tickLine={false} axisLine={false} />
                            <YAxis stroke="rgba(255,255,255,0.5)" tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                            <Tooltip
                              contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
                              itemStyle={{ color: '#3b82f6' }}
                              formatter={(value, name) => [`₹${value}`, name === 'revenue' ? 'Revenue' : name]}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '40px' }}>No revenue data yet</p>
                    )}
                  </div>

                  {/* Product Sales Pie Chart */}
                  <div style={{ background: 'rgba(255,255,255,0.06)', padding: '20px', borderRadius: '16px', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ marginBottom: '20px' }}>Sales by Product</h3>
                    {categoryBreakdown.length > 0 ? (
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                              {categoryBreakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
                              formatter={(value) => [`₹${value}`, 'Revenue']}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '40px' }}>No product sales yet</p>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Order Status + Recent Orders */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                  {/* Order Status Breakdown */}
                  <div style={{ background: 'rgba(255,255,255,0.06)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ marginBottom: '20px' }}>Orders by Status</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {Object.entries(statusCounts).map(([status, count]) => (
                        <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '10px', height: '10px', borderRadius: '50%',
                            background: statusColors[status] || '#888'
                          }} />
                          <span style={{ textTransform: 'capitalize', flex: 1, color: 'rgba(255,255,255,0.8)' }}>{status}</span>
                          <span style={{
                            fontWeight: 'bold', fontSize: '18px',
                            color: statusColors[status] || '#fff'
                          }}>{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div style={{ background: 'rgba(255,255,255,0.06)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ marginBottom: '20px' }}>Recent Orders</h3>
                    {recentOrders.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {recentOrders.map((order) => (
                          <div key={order.id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.05)'
                          }}>
                            <div>
                              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                                #{order.id.substring(0, 8)}
                              </p>
                              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                                {new Date(order.date).toLocaleDateString()}
                              </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ margin: 0, fontWeight: 'bold' }}>₹{order.total.toFixed(2)}</p>
                              <span style={{
                                fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                                background: `${statusColors[order.status] || '#888'}22`,
                                color: statusColors[order.status] || '#888',
                                textTransform: 'capitalize'
                              }}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '20px' }}>No orders yet</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default BusinessAnalytics;

import { useState, useEffect } from "react";
import "../styles/businessAnalytics.css";
import "../styles/dashboard.css";
import Sidebar from "../components/Sidebar";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Users, DollarSign, ShoppingBag, Activity } from "lucide-react";
import { getAnalytics, logout } from "../services/api";

function BusinessAnalytics() {
  const [stats, setStats] = useState([
    { title: "Total Revenue", value: "$0", change: "0%", isPositive: true, icon: <DollarSign size={20} color="#10b981" /> },
    { title: "Total Orders", value: "0", change: "0%", isPositive: true, icon: <ShoppingBag size={20} color="#f59e0b" /> }
  ]);
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
          value: `$${(data.totalRevenue || 0).toFixed(2)}`,
          change: "+12.5%",
          isPositive: true,
          icon: <DollarSign size={20} color="#10b981" />
        },
        {
          title: "Total Orders",
          value: (data.totalOrders || 0).toString(),
          change: "+8.2%",
          isPositive: true,
          icon: <ShoppingBag size={20} color="#f59e0b" />
        }
      ]);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Static chart data
  const salesData = [
    { name: 'Jan', revenue: 2400 },
    { name: 'Feb', revenue: 1398 },
    { name: 'Mar', revenue: 9800 },
    { name: 'Apr', revenue: 3908 },
    { name: 'May', revenue: 4800 },
    { name: 'Jun', revenue: 3800 },
    { name: 'Jul', revenue: 4300 },
  ];

  const categoryData = [
    { name: 'Electronics', value: 400 },
    { name: 'Fashion', value: 300 },
    { name: 'Home', value: 300 },
    { name: 'Beauty', value: 200 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="dashboard-container">
      <Sidebar userType="business" />
      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <h1 className="dashboard-title">Analytics Overview</h1>
            <p style={{ opacity: 0.7 }}>Real-time insights and performance metrics</p>
          </div>
          <button onClick={handleLogout} className="logout-btn" style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.1)' }}>Logout</button>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading analytics...</div>
        ) : (
          <>
            <div className="stats-grid" style={{ marginBottom: '30px' }}>
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
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '15px', gap: '5px' }}>
                    <span style={{ color: stat.isPositive ? '#10b981' : '#ef4444', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                      {stat.isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      {stat.change}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>vs last month</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div className="chart-box" style={{ background: 'rgba(255,255,255,0.06)', padding: '20px', borderRadius: '16px', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ marginBottom: '20px' }}>Revenue Trend</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <AreaChart data={salesData}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tickLine={false} axisLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.5)" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }} itemStyle={{ color: '#3b82f6' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-box" style={{ background: 'rgba(255,255,255,0.06)', padding: '20px', borderRadius: '16px', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ marginBottom: '20px' }}>Sales by Category</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default BusinessAnalytics;

import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    User,
    Package,
    ShoppingCart,
    BarChart3,
    Settings,
    Search,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { getNavigationSync } from "../utils/xmlParser";
import "../styles/sidebar.css";

/**
 * Reusable Sidebar Component
 * Loads navigation from XML configuration
 * 
 * @param {string} userType - 'business' or 'client'
 * @param {boolean} collapsible - Whether sidebar can be collapsed
 * @param {boolean} resizable - Whether sidebar can be resized
 */
function Sidebar({ userType = "business", collapsible = false, resizable = false }) {
    const navigate = useNavigate();
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(230);
    const [navItems, setNavItems] = useState([]);

    // Load navigation items from XML
    useEffect(() => {
        const items = getNavigationSync(userType);
        setNavItems(items);
    }, [userType]);

    // Check if a path is active
    const isActive = (path) => location.pathname.includes(path);

    // Map icon names to icon components
    const iconMap = {
        LayoutDashboard: <LayoutDashboard />,
        User: <User />,
        Package: <Package />,
        ShoppingCart: <ShoppingCart />,
        BarChart3: <BarChart3 />,
        Settings: <Settings />,
        Search: <Search />
    };

    return (
        <aside
            className={`sidebar ${collapsed ? "collapsed" : ""}`}
            style={{ width: collapsed ? 70 : sidebarWidth }}
        >
            {/* Profile Section */}
            <div className="sidebar-profile">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(JSON.parse(localStorage.getItem("user"))?.name || 'User')}&background=6366f1&color=fff`} alt="profile" style={{ borderRadius: '50%' }} />
                {!collapsed && (
                    <>
                        <p style={{ margin: 0, fontSize: '12px', opacity: 0.7 }}>Hello,</p>
                        <h3 style={{ margin: 0, fontSize: '16px' }}>{JSON.parse(localStorage.getItem("user"))?.name?.split(' ')[0] || 'User'}</h3>
                    </>
                )}
            </div>

            {/* Navigation Items from XML */}
            <nav>
                {navItems.map((item) => (
                    <SidebarItem
                        key={item.id}
                        icon={iconMap[item.icon]}
                        label={item.label}
                        active={isActive(item.path)}
                        collapsed={collapsed}
                        onClick={() => navigate(item.path)}
                    />
                ))}
            </nav>

            {/* Resizer */}
            {resizable && !collapsed && (
                <input
                    type="range"
                    min="200"
                    max="300"
                    value={sidebarWidth}
                    className="sidebar-resizer"
                    onChange={(e) => setSidebarWidth(e.target.value)}
                />
            )}

            {/* Collapse Toggle */}
            {collapsible && (
                <button
                    className="collapse-btn"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? <ChevronRight /> : <ChevronLeft />}
                </button>
            )}
        </aside>
    );
}

/**
 * Individual Sidebar Item Component
 */
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

export default Sidebar;

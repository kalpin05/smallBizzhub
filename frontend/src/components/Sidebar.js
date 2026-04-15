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
    ChevronRight,
    Menu,
    X,
    LogOut
} from "lucide-react";
import { getNavigationSync } from "../utils/xmlParser";
import { getSafeStorage } from "../utils/storage";
import { logout } from "../services/api";
import "../styles/sidebar.css";

/**
 * Reusable Sidebar Component
 * Loads navigation from XML configuration
 * Has a toggle button to show/hide
 * 
 * @param {string} userType - 'business' or 'client'
 */
function Sidebar({ userType = "business" }) {
    const navigate = useNavigate();
    const location = useLocation();

    const [isOpen, setIsOpen] = useState(true);
    const [navItems, setNavItems] = useState([]);
    const user = getSafeStorage("user", { name: "User" });

    // Load navigation items from XML
    useEffect(() => {
        const items = getNavigationSync(userType);
        setNavItems(items);
    }, [userType]);

    // Auto-collapse on small screens
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 900) {
                setIsOpen(false);
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Check if a path is active
    const isActive = (path) => location.pathname.includes(path);

    // Map icon names to icon components
    const iconMap = {
        LayoutDashboard: <LayoutDashboard size={20} />,
        User: <User size={20} />,
        Package: <Package size={20} />,
        ShoppingCart: <ShoppingCart size={20} />,
        BarChart3: <BarChart3 size={20} />,
        Settings: <Settings size={20} />,
        Search: <Search size={20} />
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <>
            {/* Toggle Button — always visible */}
            <button
                className="sidebar-toggle-btn"
                onClick={() => setIsOpen(!isOpen)}
                title={isOpen ? "Close menu" : "Open menu"}
            >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Backdrop on mobile when open */}
            {isOpen && (
                <div className="sidebar-backdrop" onClick={() => setIsOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
                {/* Profile Section */}
                <div className="sidebar-profile">
                    <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff`} 
                        alt="profile" 
                    />
                    <p style={{ margin: 0, fontSize: '12px', opacity: 0.7 }}>Hello,</p>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>
                        {user?.name?.split(' ')[0] || 'User'}
                    </h3>
                </div>

                {/* Navigation Items from XML */}
                <nav>
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.id}
                            icon={iconMap[item.icon]}
                            label={item.label}
                            active={isActive(item.path)}
                            onClick={() => {
                                navigate(item.path);
                                // Close sidebar on mobile after nav
                                if (window.innerWidth < 900) setIsOpen(false);
                            }}
                        />
                    ))}
                </nav>

                {/* Logout Button at bottom */}
                <div className="sidebar-footer">
                    <button className="sidebar-logout-btn" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}

/**
 * Individual Sidebar Item Component
 */
function SidebarItem({ icon, label, active, onClick }) {
    return (
        <div
            className={`sidebar-item ${active ? "active" : ""}`}
            onClick={onClick}
        >
            <span className="icon">{icon}</span>
            <span className="label">{label}</span>
        </div>
    );
}

export default Sidebar;

import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../services/api";
import { useTheme } from "../context/ThemeContext";
import { getSafeStorage } from "../utils/storage";

/* Pages that have their own sidebar — don't show Dashboard/Logout in the header */
const DASHBOARD_PATHS = [
  "/client-discover", "/client-profile", "/client-orders",
  "/business-dashboard", "/business-profile", "/business-products",
  "/business-orders", "/business-analytics", "/business-settings",
  "/business-add-product"
];

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getSafeStorage("user", null);
  const { isDark, toggleTheme } = useTheme();

  const isDashboardPage = DASHBOARD_PATHS.some(p => location.pathname.startsWith(p));

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="glass-nav">
      <div className="logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <i className="fas fa-store" style={{ marginRight: "8px" }}></i>
        SmallBizHub
      </div>

      <nav className="nav-links">
        {!user ? (
          <>
            <span
              className="nav-item"
              onClick={() => navigate("/client-login")}
            >
              For Clients
            </span>

            <span
              className="nav-item"
              onClick={() => navigate("/business-login")}
            >
              For Businesses
            </span>
          </>
        ) : isDashboardPage ? (
          /* On dashboard pages, the sidebar already has navigation — keep header minimal */
          null
        ) : (
          <>
            <span className="nav-item"
              onClick={() => navigate(user.role === 'business' ? '/business-dashboard' : '/client-discover')}>
              Dashboard
            </span>
            <span className="nav-item" style={{ fontWeight: "bold", color: "#6366f1" }}>
              Hi, {user.name?.split(' ')[0] || 'User'}
            </span>
            <span className="nav-item" onClick={handleLogout}>
              Logout
            </span>
          </>
        )}
      </nav>

      {/* Theme Toggle Button */}
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        aria-label="Toggle theme"
      >
        <i className={isDark ? "fas fa-sun" : "fas fa-moon"}></i>
      </button>
    </header>
  );
}

export default Header;

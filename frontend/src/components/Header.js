import { useNavigate } from "react-router-dom";
import { logout } from "../services/api";
import { useTheme } from "../context/ThemeContext";

function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const { isDark, toggleTheme } = useTheme();

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
        ) : (
          <>
            <span className="nav-item"
              onClick={() => navigate(user.role === 'business' ? '/business-dashboard' : '/client-discover')}>
              Dashboard
            </span>
            <span className="nav-item" style={{ fontWeight: "bold", color: "#6366f1" }}>
              Hi, {user.name.split(' ')[0]}
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

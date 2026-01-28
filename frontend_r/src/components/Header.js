import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  return (
    <header className="glass-nav">
      <div className="logo">
        <i className="fas fa-store" style={{ marginRight: "8px" }}></i>
        SmallBizHub
      </div>

      <nav className="nav-links">
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
      </nav>
    </header>
  );
}

export default Header;

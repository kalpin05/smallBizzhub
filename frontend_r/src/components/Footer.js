import { useNavigate } from "react-router-dom";

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="glass-footer footer-minimal scroll-animate">
      <nav className="footer-links">
        <span onClick={() => navigate("/about")}>About</span>
        <span onClick={() => navigate("/contact")}>Contact</span>
        <span onClick={() => navigate("/privacy-policy")}>Privacy Policy</span>
        <span onClick={() => navigate("/terms")}>Terms of Service</span>
      </nav>

      <div className="social-icons">
        <i className="fab fa-facebook-f"></i>
        <i className="fab fa-twitter"></i>
        <i className="fab fa-linkedin-in"></i>
        <i className="fab fa-instagram"></i>
      </div>

      <p className="footer-copy">
        © 2026 LocalConnect. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import apiService from "../services/api";

function BusinessSignup() {
  const navigate = useNavigate();

  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!businessName || !phone || !email || !password) {
      alert("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);
    
    try {
      const response = await apiService.register({
        username: email, // Use email as username
        email: email,
        password: password,
        password_confirm: confirmPassword,
        user_type: "business",
        phone: phone,
      });

      alert("Business registered successfully");
      navigate("/business-login");
    } catch (error) {
      alert("Registration failed: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="hero">
      <h1>Welcome New Business Sign Up</h1>

      <div className="card signup-card">
        <input
          className="input-field"
          placeholder="Business Name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          disabled={loading}
        />

        <input
          className="input-field"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={loading}
        />

        <input
          className="input-field"
          placeholder="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <input
          className="input-field"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <input
          className="input-field"
          type="password"
          placeholder="Rewrite Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
        />

        <button
          className="btn-primary green-glow"
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? "Signing Up..." : "Welcome New Business Sign Up"}
        </button>
      </div>
    </main>
  );
}

export default BusinessSignup;

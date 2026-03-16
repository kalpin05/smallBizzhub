import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { signup } from "../services/api";

function ClientSignup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!name || !email || !password) {
      alert("Name, email and password are required");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await signup({
        name: name,
        email: email,
        password: password,
        phone: phone,
        role: "client"
      });

      alert("Client registered successfully");
      navigate("/client-login");
    } catch (error) {
      alert("Registration failed: " + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="hero">
      <h1>Welcome New Client Sign Up</h1>

      <div className="card signup-card">
        <input
          className="input-field"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          className="btn-primary blue-glow"
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? "Signing Up..." : "Welcome New Client Sign Up"}
        </button>
      </div>
    </main>
  );
}

export default ClientSignup;

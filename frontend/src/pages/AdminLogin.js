import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await login({ email, password });
      const { token, user } = response.data;

      if (user.role !== "admin") {
        setError("Access denied. This login is for administrators only.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/admin");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter") handleLogin();
  }

  return (
    <main className="hero" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div
        className="card"
        style={{
          maxWidth: "420px",
          width: "100%",
          padding: "2.5rem",
          textAlign: "center",
          animation: "scaleIn 0.4s ease both",
        }}
      >
        {/* Icon */}
        <div style={{
          width: "64px", height: "64px", borderRadius: "50%",
          background: "linear-gradient(135deg,#4f46e5,#6366f1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.8rem", margin: "0 auto 1.5rem", boxShadow: "0 8px 24px rgba(99,102,241,0.35)"
        }}>
          🛡️
        </div>

        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "0.4rem" }}>
          Admin Portal
        </h1>
        <p className="subtitle" style={{ marginBottom: "1.8rem", fontSize: "0.9rem" }}>
          SmallBizHub — Admin Access Only
        </p>

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
            color: "#f87171", borderRadius: "10px", padding: "0.75rem 1rem",
            marginBottom: "1rem", fontSize: "0.88rem",
          }}>
            {error}
          </div>
        )}

        <input
          className="input-field"
          placeholder="Admin Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKey}
        />

        <input
          className="input-field"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKey}
        />

        <button
          className="btn-primary"
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%", marginTop: "1rem",
            background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg,#4f46e5,#6366f1)",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Signing in…" : "Sign In as Admin"}
        </button>

        <p className="form-link" style={{ marginTop: "1.5rem", fontSize: "0.82rem" }}>
          <span onClick={() => navigate("/")} style={{ cursor: "pointer", color: "#6366f1" }}>
            ← Back to Home
          </span>
        </p>
      </div>
    </main>
  );
}

export default AdminLogin;

import { useNavigate } from "react-router-dom";
import { useState } from "react";

function ClientLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin() {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    // ✅ LOGIN SUCCESS → REDIRECT
    navigate("/client-discover");
  }

  return (
    <main className="hero">
      <h1>Welcome Client,</h1>
      <p className="subtitle">Please log in to continue.</p>

      <div className="card signup-card">
        <input
          className="input-field"
          placeholder="Email or Phone Number"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="input-field"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div
          className="form-link"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot Password?
        </div>

        {/* 🔥 FIX IS HERE */}
        <button
          className="btn-primary blue-glow"
          onClick={handleLogin}
        >
          Log In
        </button>

        <p className="form-link">
          Not created any account?{" "}
          <span onClick={() => navigate("/client-signup")}>
            Sign Up
          </span>
        </p>
      </div>
    </main>
  );
}

export default ClientLogin;

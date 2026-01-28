import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ClientLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin() {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setError("");
    alert("Client Login Successful ✅");

    console.log("LOGIN:", email, password);

    // navigate("/client-discover"); // later
  }

  return (
    <main className="hero">
      <h1>Welcome Client</h1>

      <div className="card signup-card">
        {error && <p style={{ color: "red" }}>{error}</p>}

        <input
          className="input-field"
          placeholder="Email or Phone"
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

        <p className="form-link" onClick={() => navigate("/forgot-password")}>
          Forgot Password?
        </p>

        <button className="btn-primary blue-glow" onClick={handleLogin}>
          Log In
        </button>
      </div>
    </main>
  );
}

export default ClientLogin;

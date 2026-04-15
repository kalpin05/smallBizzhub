import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { login } from "../services/api";
import { toast } from "react-toastify";

function BusinessLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      toast.warning("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await login({ email, password });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Login successful");
      navigate("/business-dashboard");
    } catch (error) {
      toast.error("Login failed: " + (error.uiMessage || error.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="hero">
      <h1>Welcome Business,</h1>
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

        <button
          className="btn-primary green-glow"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging In..." : "Log In"}
        </button>

        <p className="form-link">
          Not created any account?{" "}
          <span onClick={() => navigate("/business-signup")}>
            Sign Up
          </span>
        </p>
      </div>
    </main>
  );
}

export default BusinessLogin;

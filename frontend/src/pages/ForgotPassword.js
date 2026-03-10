import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { forgotPassword, resetPassword } from "../services/api";

function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Check if we are in reset mode (after clicking the email link)
    // Supabase appends the token in the URL fragment (#access_token=...)
    const hash = window.location.hash;
    if (hash && hash.includes("access_token=")) {
      const params = new URLSearchParams(hash.replace("#", "?"));
      const token = params.get("access_token");
      const refresh = params.get("refresh_token");

      if (token) {
        setAccessToken(token);
        if (refresh) setRefreshToken(refresh);
        setIsResetMode(true);
      }
    }
  }, [location]);

  const handleSendLink = async () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword({ email });
      setMessage(response.data.message);
    } catch (error) {
      alert("Failed to send reset link: " + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword({
        newPassword,
        accessToken,
        refreshToken
      });
      alert(response.data.message);
      navigate("/business-login"); // Redirect to a login page
    } catch (error) {
      alert("Failed to reset password: " + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="hero">
      <h1>{isResetMode ? "Create New Password" : "Reset Password"}</h1>
      <p className="subtitle">
        {isResetMode
          ? "Please enter your new strong password below"
          : "Enter your email to receive a secure reset link"
        }
      </p>

      <div className="card signup-card">
        {!isResetMode ? (
          <>
            {message ? (
              <div style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981', marginBottom: '20px' }}>
                {message}
              </div>
            ) : (
              <>
                <input
                  className="input-field"
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <button
                  className="btn-primary blue-glow"
                  onClick={handleSendLink}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <input
              className="input-field"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <input
              className="input-field"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              className="btn-primary blue-glow"
              onClick={handleResetPassword}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </>
        )}

        <p className="form-link" style={{ marginTop: "20px" }}>
          Remember your password?{" "}
          <span onClick={() => navigate("/business-login")}>
            Login here
          </span>
        </p>
      </div>
    </main>
  );
}

export default ForgotPassword;

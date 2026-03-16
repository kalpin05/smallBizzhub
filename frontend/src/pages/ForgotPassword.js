import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword, verifyOtp, resetPassword } from "../services/api";

function ForgotPassword() {
  const navigate = useNavigate();

  // Step 1 = enter email, Step 2 = enter OTP, Step 3 = new password
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* ── Step 1: Send OTP to email ── */
  const handleSendOtp = async () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword({ email });
      setMessage(response.data.message);
      setStep(2);
    } catch (error) {
      alert("Failed to send OTP: " + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: Verify OTP ── */
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      alert("Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOtp({ email, otp });
      setMessage(response.data.message);
      setStep(3);
    } catch (error) {
      alert(error.response?.data || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 3: Set New Password ── */
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
      const response = await resetPassword({ email, newPassword });
      alert(response.data.message);
      navigate("/business-login");
    } catch (error) {
      alert("Failed to reset password: " + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = {
    1: "Reset Password",
    2: "Enter OTP",
    3: "Create New Password"
  };

  const stepSubtitles = {
    1: "Enter your email to receive a secure OTP",
    2: "Enter the 6-digit OTP sent to your email & phone",
    3: "Please enter your new strong password below"
  };

  return (
    <main className="hero">
      <h1>{stepTitles[step]}</h1>
      <p className="subtitle">{stepSubtitles[step]}</p>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            style={{
              width: '40px', height: '6px', borderRadius: '3px',
              background: s <= step ? '#3b82f6' : 'rgba(255,255,255,0.15)',
              transition: 'background 0.3s'
            }}
          />
        ))}
      </div>

      <div className="card signup-card">

        {/* ── STEP 1: Email ── */}
        {step === 1 && (
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
              onClick={handleSendOtp}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {/* ── STEP 2: OTP ── */}
        {step === 2 && (
          <>
            {message && (
              <div style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981', marginBottom: '20px', fontSize: '14px' }}>
                {message}
              </div>
            )}

            <input
              className="input-field"
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '24px', fontWeight: 'bold' }}
            />

            <button
              className="btn-primary blue-glow"
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <p style={{ opacity: 0.5, fontSize: '13px', marginTop: '12px' }}>
              Didn't receive the OTP?{" "}
              <span
                onClick={() => { setOtp(''); handleSendOtp(); }}
                style={{ color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Resend
              </span>
            </p>
          </>
        )}

        {/* ── STEP 3: New Password ── */}
        {step === 3 && (
          <>
            {message && (
              <div style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981', marginBottom: '20px', fontSize: '14px' }}>
                {message}
              </div>
            )}

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

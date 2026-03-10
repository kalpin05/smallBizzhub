import { useState } from "react";

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  function sendOtp() {
    if (!email) {
      alert("Enter email or phone");
      return;
    }
    setStep(2);
    alert("OTP Sent 📩");
  }

  function resetPassword() {
    if (!otp || !password) {
      alert("All fields required");
      return;
    }
    alert("Password Reset Successful 🔐");
  }

  return (
    <main className="hero forgot-container">

      {step === 1 && (
        <div className="card forgot-card">
          <h2>Forgot Password</h2>

          <input
            className="input-field"
            placeholder="Email or Phone Number"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button className="btn-primary blue-glow" onClick={sendOtp}>
            Send OTP
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="card forgot-card">
          <h2>Verify OTP</h2>

          <input
            className="input-field"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <input
            className="input-field"
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn-primary blue-glow" onClick={resetPassword}>
            Submit
          </button>
        </div>
      )}

    </main>
  );
}

export default ForgotPassword;

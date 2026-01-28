import { useState } from "react";

function ForgotPassword() {
  const [otpSent, setOtpSent] = useState(false);

  return (
    <main className="hero">
      <div className="card">
        {!otpSent ? (
          <>
            <input className="input-field" placeholder="Email or Phone" />
            <button className="btn-primary blue-glow"
              onClick={()=>setOtpSent(true)}>
              Send OTP
            </button>
          </>
        ) : (
          <>
            <input className="input-field" placeholder="OTP" />
            <input className="input-field" placeholder="New Password" />
            <button className="btn-primary blue-glow">
              Submit
            </button>
          </>
        )}
      </div>
    </main>
  );
}

export default ForgotPassword;

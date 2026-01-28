import { useState } from "react";

function ClientSignup() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  function handleSubmit() {
    if (
      !form.name ||
      !form.phone ||
      !form.email ||
      !form.password
    ) {
      setError("All fields are required");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    alert("Client Sign Up Successful ✅");

    console.log("CLIENT DATA:", form);
  }

  return (
    <main className="hero">
      <h1>Welcome New Client Sign Up</h1>

      <div className="card signup-card">
        {error && <p style={{ color: "red" }}>{error}</p>}

        <input
          name="name"
          className="input-field"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          name="phone"
          className="input-field"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
        />

        <input
          name="email"
          className="input-field"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          className="input-field"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />

        <input
          name="confirmPassword"
          type="password"
          className="input-field"
          placeholder="Rewrite Password"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        <button className="btn-primary blue-glow" onClick={handleSubmit}>
          Sign Up
        </button>
      </div>
    </main>
  );
}

export default ClientSignup;

import { useState } from "react";
import "../styles/clientprofile.css";
import Sidebar from "../components/Sidebar";

function ClientProfile() {

  const [formData, setFormData] = useState({
    name: "Jessica Brown",
    email: "jessica@email.com",
    phone: "9876543210",
    location: "Mumbai, India"
  });

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    alert("Profile Updated Successfully!");
  }

  return (
    <div className="client-dashboard-container" style={{ display: 'flex', minHeight: '100vh', background: 'radial-gradient(circle at center, #1c1d3f, #050510)', color: 'white' }}>

      {/* SIDEBAR (XML-BASED) */}
      <Sidebar userType="client" />

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* NAVBAR */}
        <header className="client-profile-navbar" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0 }}>SmallBizHub</h2>
          </div>
          <button className="logout-btn" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '8px 16px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Logout</button>
        </header>

        {/* PROFILE CONTENT */}
        <div className="client-profile-main" style={{ padding: '20px', flex: 1 }}>
          <section className="client-profile-card" style={{ maxWidth: '800px', margin: '0 auto', background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>

            <h1 style={{ marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>Edit Profile</h1>

            <div className="client-profile-body" style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>

              {/* LEFT IMAGE */}
              <div className="client-profile-left">
                <div className="image-box" style={{ position: 'relative', width: '120px', height: '120px' }}>
                  <img
                    src="https://i.pravatar.cc/200"
                    alt="user"
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid #3b82f6' }}
                  />
                  <span className="camera" style={{ position: 'absolute', bottom: '0', right: '0', background: '#3b82f6', borderRadius: '50%', padding: '8px', cursor: 'pointer' }}>📷</span>
                </div>
              </div>

              {/* FORM */}
              <form className="client-profile-form" onSubmit={handleSubmit} style={{ flex: 1, minWidth: '300px' }}>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', opacity: 0.7 }}>Full Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', opacity: 0.7 }}>Email</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', opacity: 0.7 }}>Phone Number</label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', opacity: 0.7 }}>Location</label>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                  />
                </div>

                <div className="form-actions" style={{ display: 'flex', gap: '15px' }}>
                  <button type="submit" className="save-btn" style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Save Changes
                  </button>
                  <button type="button" className="cancel-btn" style={{ padding: '10px 20px', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>

              </form>
            </div>
          </section>
        </div>

      </main>
    </div>
  );
}

export default ClientProfile;

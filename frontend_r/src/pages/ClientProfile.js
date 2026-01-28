import { useState } from "react";
import "../styles/clientprofile.css";

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
    <div className="client-profile-container">

      {/* NAVBAR */}
      <header className="client-profile-navbar">

        <h2>SmallBizHub</h2>

        <nav>
          <span className="active">For Clients</span>
          <span>For Businesses</span>
        </nav>

        <button className="logout-btn">Logout</button>

      </header>


      {/* MAIN */}
      <main className="client-profile-main">

        <section className="client-profile-card">

          <h1>Edit Profile</h1>

          <div className="client-profile-body">


            {/* LEFT IMAGE */}
            <div className="client-profile-left">

              <div className="image-box">
                <img
                  src="https://i.pravatar.cc/200"
                  alt="user"
                />
                <span className="camera">📷</span>
              </div>

            </div>


            {/* FORM */}
            <form
              className="client-profile-form"
              onSubmit={handleSubmit}
            >

              <div className="form-group">
                <label>Full Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>


              <div className="form-group">
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>


              <div className="form-group">
                <label>Phone Number</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>


              <div className="form-group">
                <label>Location</label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>


              {/* BUTTONS */}
              <div className="form-actions">

                <button type="submit" className="save-btn">
                  Save Changes
                </button>

                <button type="button" className="cancel-btn">
                  Cancel
                </button>

              </div>

            </form>

          </div>

        </section>

      </main>


      {/* FOOTER */}
      <footer className="client-profile-footer">

        <div>
          <h4>Company</h4>
          <p>About Us</p>
          <p>Careers</p>
        </div>

        <div>
          <h4>Support</h4>
          <p>Help Center</p>
          <p>Contact</p>
        </div>

        <div>
          <h4>Resources</h4>
          <p>Blog</p>
          <p>Guides</p>
        </div>

        <div>
          <h4>Follow Us</h4>
          <p>Facebook | Twitter | LinkedIn</p>
        </div>

      </footer>

    </div>
  );
}

export default ClientProfile;

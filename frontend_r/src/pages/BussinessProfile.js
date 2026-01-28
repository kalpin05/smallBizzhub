import { useState } from "react";
import "../styles/bussinessProfile.css";

function ClientProfile() {
  const [formData, setFormData] = useState({
    name: "John Doe",
    business: "Doe Electronics",
    email: "john@email.com",
    phone: "9876543210",
    category: "Electronics",
    location: "New York"
  });

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    alert("Profile updated successfully!");
  }

  return (
    <div className="edit-container">

      {/* Navbar */}
      <header className="edit-navbar">
        <h2>SmallBizHub</h2>

        <nav>
          <span className="active">For Clients</span>
          <span>For Businesses</span>
        </nav>

        <button className="logout-btn">Logout</button>
      </header>

      {/* Card */}
      <main className="edit-main">
        <section className="edit-card">

          <h1>Edit Profile</h1>

          <div className="edit-body">

            {/* Image */}
            <div className="edit-left">
              <div className="image-box">
                <img src="https://i.pravatar.cc/200" alt="user" />
                <span className="camera">📷</span>
              </div>
            </div>

            {/* Form */}
            <form className="edit-form" onSubmit={handleSubmit}>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Business Name</label>
                <input
                  name="business"
                  value={formData.business}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
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
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option>Electronics</option>
                  <option>Food</option>
                  <option>Fashion</option>
                  <option>Services</option>
                </select>
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              {/* Actions */}
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

      {/* Footer */}
      <footer className="edit-footer">

        <div>
          <h4>Company</h4>
          <p>About Us</p>
          <p>Careers</p>
        </div>

        <div>
          <h4>Support</h4>
          <p>Help Center</p>
          <p>Contact Us</p>
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

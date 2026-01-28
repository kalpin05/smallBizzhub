import { useState } from "react";
import "../styles/clientDiscover.css";
import { useNavigate } from "react-router-dom";
function ClientDiscover() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("Discover");
  const [search, setSearch] = useState("");
  const businesses = [
    {
      name: "Reeya's Home Bakery",
      description: "Delicious homemade cakes and pastries.",
      address: "123 Main St, Your City",
      image: "https://picsum.photos/300/180?1"
    },
    {
      name: "EcoGarden Nursery",
      description: "Plants and gardening supplies.",
      address: "456 Elm St, Your City",
      image: "https://picsum.photos/300/180?2"
    },
    {
      name: "Bella's Hair Studio",
      description: "Stylish haircuts & salon services.",
      address: "789 Oak St, Your City",
      image: "https://picsum.photos/300/180?3"
    }
  ];

  const filteredBusinesses = businesses.filter((biz) =>
    `${biz.name} ${biz.description} ${biz.address}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="client-container">

      {/* SIDEBAR */}
      <aside className="client-sidebar">

        <div className="profile-box">
          <img src="https://i.pravatar.cc/60" alt="profile" />
          <p>
            Hello,<br />
            <strong>Jessica!</strong>
          </p>
        </div>

        <nav>
          <a
            className={activeMenu === "Discover" ? "active" : ""}
            onClick={() => setActiveMenu("Discover")}
          >
            Discover
          </a>

          <a
            className={activeMenu === "My Orders" ? "active" : ""}
            onClick={() => navigate("/client-orders")}
          >
            My Orders
          </a>

          <a
            className={activeMenu === "My Profile" ? "active" : ""}
            onClick={() => navigate("/client-profile")}
          >
            My Profile
          </a>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="client-main">

        <header className="client-header">
          <h1>Discover Local Businesses</h1>
          <p>Find products and services near you.</p>

          <div className="search-bar">
            <input
              placeholder="Search for businesses, products, or services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button>Search</button>
          </div>
        </header>

        <section>
          <h2 className="section-title">Businesses Near You</h2>

          <div className="business-grid">
            {filteredBusinesses.length === 0 && (
              <p style={{ color: "#b0b0cc" }}>No businesses found.</p>
            )}

            {filteredBusinesses.map((biz, index) => (
              <div className="business-card" key={index}>
                <img src={biz.image} alt={biz.name} />
                <h3>{biz.name}</h3>
                <p>{biz.description}</p>
                <span>{biz.address}</span>
                <button>View Products</button>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

export default ClientDiscover;

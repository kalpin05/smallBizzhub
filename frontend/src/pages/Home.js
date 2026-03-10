import { useNavigate } from "react-router-dom";
import girl from "../assets/images/girl.jpeg";
import boy from "../assets/images/boy.jpeg";

function Home() {
  const navigate = useNavigate();

  return (
    <main className="hero">
      <h1>Connect with Your Local Community</h1>
      <p className="subtitle">
        Find local products and services, or list your business to reach new customers.
      </p>

      <div className="card-container">

        <div className="card">
          <div className="card-image client-bg">
            <img src={girl} alt="Client" className="character-img" />
          </div>

          <h2>I am a Client</h2>
          <p>
            Discover local products and services, support small businesses.
          </p>

          <ul>
            <li>• Browse local shops & services</li>
            <li>• Read reviews from other clients</li>
          </ul>

          <button
            className="btn-primary blue-glow"
            onClick={() => navigate("/client-login")}
          >
            🔍 Start Browsing →
          </button>
        </div>

        <div className="card">
          <div className="card-image business-bg">
            <img src={boy} alt="Business" className="character-img" />
          </div>

          <h2>I am a Business</h2>

          <ul>
            <li>🤝 Create a free business listing</li>
            <li>📈 Gain visibility</li>
            <li>💬 Connect with local clients</li>
          </ul>

          <button
            className="btn-primary green-glow"
            onClick={() => navigate("/business-login")}
          >
            🏪 Get Started →
          </button>
        </div>

      </div>
    </main>
  );
}

export default Home;

import { useState } from "react";

function ClientDiscover() {
  const [search, setSearch] = useState("");

  function handleSearch() {
    alert(`Searching for: ${search}`);
  }

  return (
    <div className="client-container">
      <main className="client-main">
        <h1>Discover Local Businesses</h1>

        <div className="search-bar">
          <input
            placeholder="Search businesses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      </main>
    </div>
  );
}

export default ClientDiscover;

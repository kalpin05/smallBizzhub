import "../styles/businessAnalytics.css";

function BusinessAnalytics() {

  const stats = [
    { title: "Total Sales", value: "$25,450", growth: "+15.5%" },
    { title: "Total Orders", value: "320", growth: "+8.7%" },
    { title: "Pending Orders", value: "14", growth: "" },
    { title: "Total Customers", value: "180", growth: "" }
  ];

  const customers = [
    {
      name: "Jessica Brown",
      date: "April 7, 2026",
      orders: 6,
      amount: 650
    },
    {
      name: "Kevin Wilson",
      date: "April 5, 2026",
      orders: 4,
      amount: 510
    },
    {
      name: "Olivia Miller",
      date: "April 2, 2026",
      orders: 5,
      amount: 410
    },
    {
      name: "Andrew Clark",
      date: "April 1, 2026",
      orders: 3,
      amount: 350
    }
  ];

  return (
    <div className="analytics-container">


      {/* HEADER */}
      <header className="analytics-header">

        <h2>SmallBizHub</h2>

        <nav>
          <span>Home</span>
          <span>Services</span>
          <span>Support</span>
          <span>Contact</span>
        </nav>

        <button className="logout-btn">Logout</button>

      </header>


      {/* LAYOUT */}
      <div className="analytics-layout">


        {/* SIDEBAR */}
        <aside className="analytics-sidebar">

          <button>Dashboard</button>
          <button>Profile</button>
          <button>Products</button>
          <button>Orders</button>

          <button className="active">Analytics</button>

          <button>Settings</button>

        </aside>


        {/* MAIN */}
        <main className="analytics-main">

          <h1>Analytics</h1>


          {/* STATS */}
          <div className="stats-grid">

            {stats.map((item, index) => (

              <div className="stat-card" key={index}>

                <h4>{item.title}</h4>

                <h2>{item.value}</h2>

                {item.growth && (
                  <span className="growth">
                    {item.growth}
                  </span>
                )}

              </div>

            ))}

          </div>


          {/* CHART + PRODUCTS */}
          <div className="analytics-middle">


            {/* SALES CHART */}
            <div className="chart-box">

              <h3>Sales Overview</h3>

              <div className="fake-chart">

                <div className="bar b1"></div>
                <div className="bar b2"></div>
                <div className="bar b3"></div>
                <div className="bar b4"></div>
                <div className="bar b5"></div>
                <div className="bar b6"></div>

              </div>

              <p>Monthly Sales</p>

            </div>


            {/* TOP PRODUCTS */}
            <div className="products-box">

              <h3>Top Products</h3>

              <ul>
                <li>Electronics - 40%</li>
                <li>Accessories - 25%</li>
                <li>Home Decor - 20%</li>
                <li>Cosmetics - 15%</li>
              </ul>

            </div>

          </div>


          {/* CUSTOMERS */}
          <div className="customers-box">

            <h3>Recent Customers</h3>


            <div className="customer-head">

              <span>Name</span>
              <span>Date</span>
              <span>Orders</span>
              <span>Amount</span>

            </div>


            {customers.map((item, index) => (

              <div className="customer-row" key={index}>

                <span>{item.name}</span>
                <span>{item.date}</span>
                <span>{item.orders}</span>
                <span>${item.amount}</span>

              </div>

            ))}

          </div>

        </main>

      </div>


      {/* FOOTER */}
      <footer className="analytics-footer">

        <p>
          Privacy Policy | Terms of Service | Help
        </p>

      </footer>

    </div>
  );
}

export default BusinessAnalytics;

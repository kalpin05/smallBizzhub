import "../styles/clientOrders.css";
import { useNavigate } from "react-router-dom";
function ClientOrders() {

  const navigate = useNavigate();

  const orders = [
    {
      id: "#10234",
      customer: "Sarah Johnson",
      date: "2022-12-01",
      status: "completed",
      total: 150
    },
    {
      id: "#10233",
      customer: "James Smith",
      date: "2022-11-28",
      status: "pending",
      total: 85
    },
    {
      id: "#10232",
      customer: "Emma Davis",
      date: "2022-11-25",
      status: "shipped",
      total: 220
    },
    {
      id: "#10231",
      customer: "Michael Brown",
      date: "2022-11-20",
      status: "cancelled",
      total: 45
    },
    {
      id: "#10230",
      customer: "Lisa White",
      date: "2022-11-18",
      status: "completed",
      total: 300
    },
    {
      id: "#10229",
      customer: "David Wilson",
      date: "2022-11-15",
      status: "pending",
      total: 120
    }
  ];

  return (
    <div className="orders-container">

      {/* HEADER */}
      <header className="orders-header">

        <h2>SmallBizHub</h2>

        <nav>
          <span>Home</span>
          <span>Services</span>
          <span>Support</span>
          <span>Contact</span>
        </nav>

      </header>


      {/* LAYOUT */}
      <div className="orders-layout">


        {/* SIDEBAR */}
        <aside className="orders-sidebar">

          <button onClick={() => navigate("/client-discover")}>Dashboard</button>
          <button onClick={() => navigate("/client-profile")}>My Profile</button>

          <button className="active">Orders</button>

          

        </aside>


        {/* MAIN */}
        <main className="orders-main">

          <h1>Orders</h1>

          <p className="subtitle">
            Manage and track your customer orders.
          </p>


          <div className="orders-content">


            {/* TABLE */}
            <div className="orders-table">


              <div className="table-head">
                <span>Order ID</span>
                <span>Customer</span>
                <span>Date</span>
                <span>Status</span>
                <span>Total</span>
                <span>Action</span>
              </div>


              {orders.map((order, index) => (

                <div className="table-row" key={index}>

                  <span>{order.id}</span>
                  <span>{order.customer}</span>
                  <span>{order.date}</span>

                  <span className={`status ${order.status}`}>
                    {order.status}
                  </span>

                  <span>${order.total}.00</span>

                  <button className="view-btn">
                    View
                  </button>

                </div>

              ))}


            </div>


            {/* SUMMARY */}
            <div className="orders-summary">


              <div className="summary-box">
                <h4>Total Orders</h4>
                <p>245</p>
              </div>

              <div className="summary-box">
                <h4>Total Revenue</h4>
                <p>$18,750</p>
              </div>

              <div className="summary-box">
                <h4>Pending Orders</h4>
                <p>12</p>
              </div>


            </div>


          </div>

        </main>

      </div>


      {/* FOOTER */}
      <footer className="orders-footer">

        <p>
          Privacy Policy | Terms of Service | Help
        </p>

      </footer>

    </div>
  );
}

export default ClientOrders;

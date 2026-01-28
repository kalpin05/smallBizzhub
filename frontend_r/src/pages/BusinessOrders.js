import "../styles/businessOrders.css";
import { useNavigate } from "react-router-dom";
function BusinessOrders() {

  const navigate = useNavigate();

  const orders = [
    {
      id: "#10234",
      customer: "Alice Smith",
      date: "03/22/2023",
      status: "completed",
      total: 120,
      payment: "UPI"
    },
    {
      id: "#10233",
      customer: "Mitchell Brown",
      date: "03/21/2023",
      status: "pending",
      total: 85.5,
      payment: "Card"
    },
    {
      id: "#10232",
      customer: "Sarah Lee",
      date: "03/20/2023",
      status: "shipped",
      total: 210,
      payment: "Cash"
    },
    {
      id: "#10231",
      customer: "David Johnson",
      date: "03/19/2023",
      status: "cancelled",
      total: 45,
      payment: "UPI"
    }
  ];

  return (
    <div className="borders-container">

      {/* HEADER */}
      <header className="borders-header">

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
      <div className="borders-layout">


        {/* SIDEBAR */}
        <aside className="borders-sidebar">

          <button onClick={() => navigate("/business-dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/business-profile")}>Profile</button>
          <button onClick={() => navigate("/business-add-product")}>Products</button>

          <button className="active">Orders</button>

          <button>Analytics</button>
          <button>Settings</button>

        </aside>


        {/* MAIN */}
        <main className="borders-main">

          <h1>Recent Orders</h1>


          {/* TABLE CARD */}
          <section className="borders-card">


            <div className="borders-table">


              {/* HEADER ROW */}
              <div className="borders-head">

                <span>Order ID</span>
                <span>Customer</span>
                <span>Date</span>
                <span>Status</span>
                <span>Total</span>
                <span>Payment</span>
                <span>Action</span>

              </div>


              {/* DATA ROWS */}
              {orders.map((order, index) => (

                <div className="borders-row" key={index}>

                  <span>{order.id}</span>
                  <span>{order.customer}</span>
                  <span>{order.date}</span>

                  <span className={`bstatus ${order.status}`}>
                    {order.status}
                  </span>

                  <span>${order.total.toFixed(2)}</span>

                  <span>{order.payment}</span>

                  <button className="view-btn">
                    View
                  </button>

                </div>

              ))}


            </div>

          </section>

        </main>

      </div>


      {/* FOOTER */}
      <footer className="borders-footer">

        <p>
          Privacy Policy | Terms of Service | Help
        </p>

      </footer>

    </div>
  );
}

export default BusinessOrders;

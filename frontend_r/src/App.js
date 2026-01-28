import "./App.css";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

// Public pages
import Home from "./pages/Home";
import ClientLogin from "./pages/ClientLogin";
import BusinessLogin from "./pages/BusinessLogin";
import ClientSignup from "./pages/ClientSignup";
import BusinessSignup from "./pages/BusinessSignup";
import ForgotPassword from "./pages/ForgotPassword";
import ClientDiscover from "./pages/ClientDiscover";
import BusinessProfile from "./pages/BussinessProfile";
import ClientProfile from "./pages/ClientProfile";
import BusinessAddProduct from "./pages/BusinessAddProduct";
import BusinessAnalytics from "./pages/BusinessAnalytics";

// Business pages
import BusinessDashboard from "./pages/BusinessDashboard";
import BusinessProducts from "./pages/BusinessProducts";
import BusinessOrders from "./pages/BusinessOrders";
import BusinessSettings from "./pages/BusinessSettings";
import ClientOrders from "./pages/ClientOrders";

function App() {
  return (
    <>
      <Header />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/client-login" element={<ClientLogin />} />
        <Route path="/business-login" element={<BusinessLogin />} />
        <Route path="/business-add-product" element={<BusinessAddProduct />} />
        <Route path="/client-profile" element={<ClientProfile />} />
        <Route path="/client-signup" element={<ClientSignup />} />
        <Route path="/business-signup" element={<BusinessSignup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/client-discover" element={<ClientDiscover />} />
        <Route path="/business-profile" element={<BusinessProfile />} />
        <Route path="/client-orders" element={<ClientOrders />} />
        <Route path="orders" element={<BusinessOrders />} />
        <Route path="BusinessAnalytics" element={<BusinessAnalytics />} />

        {/* Business Dashboard (Nested) */}
        <Route path="/business-dashboard" element={<BusinessDashboard />}>
          <Route index element={null} />
          <Route path="profile" element={<BusinessProfile />} />
          <Route path="products" element={<BusinessProducts />} />
          <Route path="settings" element={<BusinessSettings />} />
        </Route>
      </Routes>

      <Footer />
    </>
  );
}

export default App;

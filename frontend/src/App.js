import "./App.css";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Public pages
import Home from "./pages/Home";
import ClientLogin from "./pages/ClientLogin";
import BusinessLogin from "./pages/BusinessLogin";
import ClientSignup from "./pages/ClientSignup";
import BusinessSignup from "./pages/BusinessSignup";
import ForgotPassword from "./pages/ForgotPassword";

// Protected Pages
import ClientDiscover from "./pages/ClientDiscover";
import BusinessProfile from "./pages/BusinessProfile";
import ClientProfile from "./pages/ClientProfile";
import BusinessAddProduct from "./pages/BusinessAddProduct";
import BusinessAnalytics from "./pages/BusinessAnalytics";
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
        <Route path="/client-signup" element={<ClientSignup />} />
        <Route path="/business-signup" element={<BusinessSignup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ForgotPassword />} />

        {/* Client Protected */}
        <Route path="/client-discover" element={
          <ProtectedRoute role="client">
            <ClientDiscover />
          </ProtectedRoute>
        } />
        <Route path="/client-profile" element={
          <ProtectedRoute role="client">
            <ClientProfile />
          </ProtectedRoute>
        } />
        <Route path="/client-orders" element={
          <ProtectedRoute role="client">
            <ClientOrders />
          </ProtectedRoute>
        } />

        {/* Business Protected */}
        <Route path="/business-dashboard" element={
          <ProtectedRoute role="business">
            <BusinessDashboard />
          </ProtectedRoute>
        } />
        <Route path="/business-add-product" element={
          <ProtectedRoute role="business">
            <BusinessAddProduct />
          </ProtectedRoute>
        } />
        <Route path="/business-profile" element={
          <ProtectedRoute role="business">
            <BusinessProfile />
          </ProtectedRoute>
        } />
        <Route path="/business-analytics" element={
          <ProtectedRoute role="business">
            <BusinessAnalytics />
          </ProtectedRoute>
        } />
        <Route path="/business-orders" element={
          <ProtectedRoute role="business">
            <BusinessOrders />
          </ProtectedRoute>
        } />
        <Route path="/business-products" element={
          <ProtectedRoute role="business">
            <BusinessProducts />
          </ProtectedRoute>
        } />
        <Route path="/business-settings" element={
          <ProtectedRoute role="business">
            <BusinessSettings />
          </ProtectedRoute>
        } />
      </Routes>

      <Footer />
    </>
  );
}

export default App;

import { Navigate } from "react-router-dom";
import { getSafeStorage } from "../utils/storage";

const ProtectedRoute = ({ children, role }) => {
    const token = localStorage.getItem("token");
    const user = getSafeStorage("user", null);

    if (!token || !user) {
        return <Navigate to="/" replace />;
    }

    if (role && user.role !== role) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;

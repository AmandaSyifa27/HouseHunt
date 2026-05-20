import { Navigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children, role }) => {
 const { user, loading } = useAuth();

 if (loading) return <LoadingSpinner fullScreen />;
 if (!user) return <Navigate to="/login" replace />;

 if (role && user.role !== role) {
  if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (user.role === "landlord")
   return <Navigate to="/landlord/dashboard" replace />;
  return <Navigate to="/" replace />;
 }

 return children;
};

export default ProtectedRoute;

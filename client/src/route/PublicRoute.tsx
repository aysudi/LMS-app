import { Navigate } from "react-router-dom";
import AuthLayout from "../layout/AuthLayout";
import { useAuthContext } from "../context/AuthContext";
import Loading from "../components/Common/Loading";

const PublicRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return <Loading variant="overlay" message="Authenticating..." />;
  }

  if (user && user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return isAuthenticated ? <Navigate to="/" replace /> : <AuthLayout />;
};

export default PublicRoute;

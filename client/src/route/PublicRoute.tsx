import { Navigate } from "react-router-dom";
import AuthLayout from "../layout/AuthLayout";
import { useAuthContext } from "../context/AuthContext";

const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Navigate to="/" replace /> : <AuthLayout />;
};

export default PublicRoute;

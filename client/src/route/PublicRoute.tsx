import { Navigate } from "react-router-dom";
import AuthLayout from "../layout/AuthLayout";
import { useAuthContext } from "../context/AuthContext";
import Loading from "../components/Common/Loading";

const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return <Loading variant="overlay" message="Authenticating..." />;
  }

  return isAuthenticated ? <Navigate to="/" replace /> : <AuthLayout />;
};

export default PublicRoute;

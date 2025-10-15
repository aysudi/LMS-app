import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import Loading from "../components/Common/Loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return <Loading variant="overlay" message="Verifying access..." />;
  }
  if (user && user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/auth/login" replace />
  );
};

export default ProtectedRoute;

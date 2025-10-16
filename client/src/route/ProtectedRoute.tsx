import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import Loading from "../components/Common/Loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    return <Loading variant="overlay" message="Verifying access..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Auto-redirect admin users to admin dashboard when accessing root
  if (user?.role === "admin" && location.pathname === "/") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Auto-redirect instructors to instructor dashboard when accessing root
  if (user?.role === "instructor" && location.pathname === "/") {
    return <Navigate to="/instructor/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

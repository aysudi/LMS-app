import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/auth/login" replace />
  );
};

export default ProtectedRoute;

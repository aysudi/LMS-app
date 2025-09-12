import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useCurrentUser } from "../hooks/useUserQueries";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => boolean;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const checkAuth = (): boolean => {
    const token = localStorage.getItem("accessToken");
    return !!token;
  };

  // Use React Query to manage user state
  const {
    data: userData,
    isLoading,
    refetch: refetchUser,
  } = useCurrentUser({
    enabled: checkAuth(), // Only fetch user data if token exists
    retry: false, // Don't retry on failure to avoid infinite loops
  });

  const user = userData || null;
  const isAuthenticated = checkAuth() && user !== null;

  const value = {
    user,
    isAuthenticated,
    isLoading,
    checkAuth,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

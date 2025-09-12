import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

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
  setUser: (user: User | null) => void;
  checkAuth: () => boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = (): boolean => {
    const token = localStorage.getItem("accessToken");
    return !!token;
  };

  const isAuthenticated = checkAuth() && user !== null;

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token && !user) {
        try {
          // In a real app, you would validate the token and fetch user data
          // For now, we'll decode the token or fetch user data from an API
          // This is a placeholder - you should implement actual token validation

          // You can either:
          // 1. Decode JWT token to get user data
          // 2. Make an API call to validate token and get user data
          // 3. Store user data in localStorage (less secure)

          // For now, let's check if there's user data in localStorage
          const storedUser = localStorage.getItem("userData");
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } catch (error) {
          console.error("Error initializing auth:", error);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("userData");
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [user]);

  // Enhanced setUser to also store in localStorage
  const setUserWithStorage = (userData: User | null) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem("userData", JSON.stringify(userData));
    } else {
      localStorage.removeItem("userData");
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    setUser: setUserWithStorage,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useCurrentUser } from "../hooks/useUserQueries";
import { getAuthToken, removeAuthToken } from "../utils/auth-storage";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  avatar?: string;
  avatarOrInitials: string;
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
  const [hasToken, setHasToken] = useState(() => {
    const token = getAuthToken();
    return !!token;
  });

  const checkAuth = (): boolean => {
    const token = getAuthToken();
    const tokenExists = !!token;

    if (tokenExists !== hasToken) {
      setHasToken(tokenExists);
    }

    return tokenExists;
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "accessToken") {
        const newTokenExists = !!e.newValue;
        setHasToken(newTokenExists);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const handleCustomStorageChange = () => {
      const token = getAuthToken();
      const newTokenExists = !!token;
      setHasToken(newTokenExists);
    };

    window.addEventListener("auth-token-changed", handleCustomStorageChange);
    return () =>
      window.removeEventListener(
        "auth-token-changed",
        handleCustomStorageChange
      );
  }, [hasToken]);

  const {
    data: userData,
    isLoading,
    refetch: refetchUserQuery,
    error,
  } = useCurrentUser({
    enabled: hasToken,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        removeAuthToken();
        setHasToken(false);
        window.dispatchEvent(new CustomEvent("auth-token-changed"));
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000,
  });

  const refetchUser = async () => {
    const token = getAuthToken();
    if (token && !hasToken) {
      setHasToken(true);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    return refetchUserQuery();
  };

  const user = userData || null;
  const isAuthenticated = hasToken && user !== null;

  useEffect(() => {
    if (error && (error as any)?.response?.status === 401) {
      removeAuthToken();
      setHasToken(false);
      window.dispatchEvent(new CustomEvent("auth-token-changed"));
    }
  }, [error]);

  const value = {
    user,
    isAuthenticated,
    isLoading: hasToken ? isLoading : false,
    checkAuth,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

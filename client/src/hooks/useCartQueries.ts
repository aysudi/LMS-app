import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import { getCart, getCartCount, checkIfInCart } from "../services/cart.service";
import type { CartResponse, CartCountResponse } from "../types/cart.type";
import { useAuthContext } from "../context/AuthContext";

export const cartQueryKeys = {
  all: ["cart"] as const,
  list: () => [...cartQueryKeys.all, "list"] as const,
  count: () => [...cartQueryKeys.all, "count"] as const,
  check: (courseId: string) =>
    [...cartQueryKeys.all, "check", courseId] as const,
};

export const useCart = (
  options?: Omit<UseQueryOptions<CartResponse, Error>, "queryKey" | "queryFn">
) => {
  const { isAuthenticated } = useAuthContext();

  return useQuery({
    queryKey: cartQueryKeys.list(),
    queryFn: getCart,
    enabled: isAuthenticated, // Only run when user is authenticated
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 3;
    },
    ...options,
  });
};

export const useCartCount = (
  options?: Omit<
    UseQueryOptions<CartCountResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  const { isAuthenticated } = useAuthContext();

  return useQuery({
    queryKey: cartQueryKeys.count(),
    queryFn: getCartCount,
    enabled: isAuthenticated, // Only run when user is authenticated
    staleTime: 30 * 1000, // 30 seconds (more frequent updates for cart count)
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 3;
    },
    ...options,
  });
};

export const useIsInCart = (courseId: string) => {
  const { isAuthenticated } = useAuthContext();

  return useQuery({
    queryKey: cartQueryKeys.check(courseId),
    queryFn: () => checkIfInCart(courseId),
    enabled: isAuthenticated && !!courseId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 3;
    },
  });
};

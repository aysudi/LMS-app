import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import { getCart, getCartCount, checkIfInCart } from "../services/cart.service";
import type { CartResponse, CartCountResponse } from "../types/cart.type";
import { useAuthContext } from "../context/AuthContext";

export const cartQueryKeys = {
  all: ["cart"] as const,
  list: (userId?: string) =>
    [...cartQueryKeys.all, userId ?? "anonymous", "list"] as const,
  count: (userId?: string) =>
    [...cartQueryKeys.all, userId ?? "anonymous", "count"] as const,
  check: (userId: string | undefined, courseId: string) =>
    [...cartQueryKeys.all, userId ?? "anonymous", "check", courseId] as const,
};

export const useCart = (
  options?: Omit<UseQueryOptions<CartResponse, Error>, "queryKey" | "queryFn">,
) => {
  const { isAuthenticated, user } = useAuthContext();

  return useQuery({
    queryKey: cartQueryKeys.list(user?.id),
    queryFn: getCart,
    enabled: isAuthenticated && !!user?.id,
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
  >,
) => {
  const { isAuthenticated, user } = useAuthContext();

  return useQuery({
    queryKey: cartQueryKeys.count(user?.id),
    queryFn: getCartCount,
    enabled: isAuthenticated && !!user?.id,
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
  const { isAuthenticated, user } = useAuthContext();

  return useQuery({
    queryKey: cartQueryKeys.check(user?.id, courseId),
    queryFn: () => checkIfInCart(courseId),
    enabled: isAuthenticated && !!user?.id && !!courseId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 3;
    },
  });
};

import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import { getWishlist } from "../services/wishlist.service";
import type { WishlistResponse } from "../types/wishlist.type";
import { useAuthContext } from "../context/AuthContext";

export const wishlistQueryKeys = {
  all: ["wishlist"] as const,
  list: () => [...wishlistQueryKeys.all, "list"] as const,
};

export const useWishlist = (
  options?: Omit<
    UseQueryOptions<WishlistResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  const { isAuthenticated } = useAuthContext();

  return useQuery({
    queryKey: wishlistQueryKeys.list(),
    queryFn: getWishlist,
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

export const useIsInWishlist = (courseId: string) => {
  const { data: wishlistData } = useWishlist();

  const isInWishlist =
    wishlistData?.data?.some((course) => course.id === courseId) || false;

  return {
    isInWishlist,
    wishlistCount: wishlistData?.data?.length || 0,
  };
};

import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import { getWishlist } from "../services/wishlist.service";
import type { WishlistResponse } from "../types/wishlist.type";

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
  return useQuery({
    queryKey: wishlistQueryKeys.list(),
    queryFn: getWishlist,
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
    wishlistData?.data.wishlist.some((course) => course.id === courseId) ||
    false;

  return {
    isInWishlist,
    wishlistCount: wishlistData?.data.wishlist.length || 0,
  };
};

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { personalizationApi } from "../services/personalizationApi";
import type { PersonalizedRecommendations } from "../services/personalizationApi";
import { useAuthContext } from "../context/AuthContext";
import { useWishlist } from "./useWishlistQueries";
import { wishlistQueryKeys } from "./useWishlistQueries";

const emptyRecommendations: PersonalizedRecommendations = {
  recommended: [],
  popular: [],
  free: [],
};

export const personalizationQueryKeys = {
  all: ["personalization"] as const,
  recommendations: (userId?: string) =>
    [...personalizationQueryKeys.all, "recommendations", userId] as const,
};

export const usePersonalization = () => {
  const { user, isAuthenticated } = useAuthContext();
  const queryClient = useQueryClient();
  const wishlistQuery = useWishlist();
  const [error, setError] = useState<string | null>(null);

  const recommendationsQuery = useQuery({
    queryKey: personalizationQueryKeys.recommendations(user?.id),
    queryFn: async () => {
      const response = await personalizationApi.getRecommendations();
      return response.data;
    },
    enabled: isAuthenticated && !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, queryError: any) => {
      if (queryError?.response?.status === 401) return false;
      return failureCount < 1;
    },
  });

  const addToWishlist = async (courseId: string) => {
    try {
      await personalizationApi.addToWishlist(courseId);
      await queryClient.invalidateQueries({
        queryKey: wishlistQueryKeys.all,
      });
      return true;
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.message || "Failed to add to wishlist",
      );
      return false;
    }
  };

  const removeFromWishlist = async (courseId: string) => {
    try {
      await personalizationApi.removeFromWishlist(courseId);
      await queryClient.invalidateQueries({
        queryKey: wishlistQueryKeys.all,
      });
      return true;
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.message ||
          "Failed to remove from wishlist",
      );
      return false;
    }
  };

  const addToSearchHistory = async (query: string, category?: string) => {
    if (!user || !query.trim()) return;

    try {
      await personalizationApi.addToSearchHistory(query, category);
    } catch (requestError) {
      console.error("Error adding to search history:", requestError);
    }
  };

  const addViewedCourse = async (courseId: string) => {
    if (!user) return;

    try {
      await personalizationApi.addViewedCourse(courseId);
    } catch (requestError) {
      console.error("Error adding viewed course:", requestError);
    }
  };

  return {
    wishlist: wishlistQuery.data?.data || [],
    recommendations: recommendationsQuery.data || emptyRecommendations,
    loading: recommendationsQuery.isLoading,
    error,
    addToWishlist,
    removeFromWishlist,
    isInWishlist: (courseId: string) =>
      (wishlistQuery.data?.data || []).some((course) => course.id === courseId),
    addToSearchHistory,
    addViewedCourse,
    fetchRecommendations: () => recommendationsQuery.refetch(),
    refreshWishlist: () => wishlistQuery.refetch(),
  };
};

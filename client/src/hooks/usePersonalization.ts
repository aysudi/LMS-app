import { useState, useEffect } from "react";
import { personalizationApi } from "../services/personalizationApi";
import type { PersonalizedRecommendations } from "../services/personalizationApi";
import { useAuthContext } from "../context/AuthContext";

export const usePersonalization = () => {
  const { user } = useAuthContext();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [recommendations, setRecommendations] =
    useState<PersonalizedRecommendations>({
      recommended: [],
      popular: [],
      free: [],
    });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = async () => {
    if (!user) return;

    try {
      const response = await personalizationApi.getWishlist();
      setWishlist(response.data);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    }
  };

  // Add to wishlist
  const addToWishlist = async (courseId: string) => {
    try {
      await personalizationApi.addToWishlist(courseId);
      await fetchWishlist(); // Refresh wishlist
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add to wishlist");
      return false;
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (courseId: string) => {
    try {
      await personalizationApi.removeFromWishlist(courseId);
      await fetchWishlist(); // Refresh wishlist
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to remove from wishlist");
      return false;
    }
  };

  // Check if course is in wishlist
  const isInWishlist = (courseId: string) => {
    return wishlist.some((course) => course._id === courseId);
  };

  // Add to search history
  const addToSearchHistory = async (query: string, category?: string) => {
    if (!user || !query.trim()) return;

    try {
      await personalizationApi.addToSearchHistory(query, category);
    } catch (err) {
      console.error("Error adding to search history:", err);
    }
  };

  // Add viewed course
  const addViewedCourse = async (courseId: string) => {
    if (!user) return;

    try {
      await personalizationApi.addViewedCourse(courseId);
    } catch (err) {
      console.error("Error adding viewed course:", err);
    }
  };

  // Fetch recommendations
  const fetchRecommendations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await personalizationApi.getRecommendations();
      setRecommendations(response.data);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when user logs in
  useEffect(() => {
    if (user) {
      fetchWishlist();
      fetchRecommendations();
    } else {
      // Clear data when user logs out
      setWishlist([]);
      setRecommendations({ recommended: [], popular: [], free: [] });
    }
  }, [user]);

  return {
    wishlist,
    recommendations,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    addToSearchHistory,
    addViewedCourse,
    fetchRecommendations,
    refreshWishlist: fetchWishlist,
  };
};

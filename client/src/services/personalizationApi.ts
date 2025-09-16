import { api } from "./api";

export interface SearchHistoryItem {
  query: string;
  category?: string;
  timestamp: Date;
}

export interface ViewedCourse {
  course: string;
  timestamp: Date;
}

export interface PersonalizedRecommendations {
  recommended: any[];
  popular: any[];
  free: any[];
}

export const personalizationApi = {
  // Wishlist operations
  addToWishlist: (courseId: string) =>
    api.post(`/personalization/wishlist/add/${courseId}`),

  removeFromWishlist: (courseId: string) =>
    api.delete(`/personalization/wishlist/remove/${courseId}`),

  getWishlist: () => api.get("/personalization/wishlist"),

  // Search history
  addToSearchHistory: (query: string, category?: string) =>
    api.post("/personalization/search-history", { query, category }),

  getSearchHistory: (): Promise<{ data: SearchHistoryItem[] }> =>
    api.get("/personalization/search-history"),

  // Viewed courses
  addViewedCourse: (courseId: string) =>
    api.post(`/personalization/viewed/${courseId}`),

  // Recommendations
  getRecommendations: (): Promise<{ data: PersonalizedRecommendations }> =>
    api.get("/personalization/recommendations"),
};

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
  addToWishlist: (courseId: string) =>
    api.post(`/api/personalization/wishlist/add/${courseId}`),

  removeFromWishlist: (courseId: string) =>
    api.delete(`/api/personalization/wishlist/remove/${courseId}`),

  getWishlist: () => api.get("/api/personalization/wishlist"),

  // Search history
  addToSearchHistory: (query: string, category?: string) =>
    api.post("/api/personalization/search-history", { query, category }),

  getSearchHistory: (): Promise<{ data: SearchHistoryItem[] }> =>
    api.get("/api/personalization/search-history"),

  // Viewed courses
  addViewedCourse: (courseId: string) =>
    api.post(`/api/personalization/viewed/${courseId}`),

  // Recommendations
  getRecommendations: (): Promise<{ data: PersonalizedRecommendations }> =>
    api.get("/api/personalization/recommendations"),
};

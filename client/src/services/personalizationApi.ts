import type {
  PersonalizedRecommendations,
  SearchHistoryItem,
} from "../types/personalization.type";
import { api } from "./api";

export const personalizationApi = {
  addToWishlist: (courseId: string) =>
    api.post(`/api/personalization/wishlist/add/${courseId}`),

  removeFromWishlist: (courseId: string) =>
    api.delete(`/api/personalization/wishlist/remove/${courseId}`),

  getWishlist: () => api.get("/api/personalization/wishlist"),

  addToSearchHistory: (query: string, category?: string) =>
    api.post("/api/personalization/search-history", { query, category }),

  getSearchHistory: (): Promise<{ data: SearchHistoryItem[] }> =>
    api.get("/api/personalization/search-history"),

  addViewedCourse: (courseId: string) =>
    api.post(`/api/personalization/viewed/${courseId}`),

  getRecommendations: (): Promise<{ data: PersonalizedRecommendations }> =>
    api.get("/api/personalization/recommendations"),
};

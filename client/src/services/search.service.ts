import { api } from "./api";

export interface SearchSuggestion {
  id: string;
  value: string;
  label: string;
  type: "course" | "category" | "instructor" | "search";
  count?: number;
  metadata?: {
    instructorId?: string;
    categoryId?: string;
    courseId?: string;
    image?: string;
    description?: string;
    rating?: number;
    price?: number;
  };
}

export interface RecentSearch {
  _id?: string;
  query: string;
  type: "search" | "suggestion";
  timestamp: string;
  metadata?: {
    resultCount?: number;
    selectedSuggestion?: string;
  };
}

export interface SearchSuggestionsResponse {
  success: boolean;
  data: SearchSuggestion[];
}

export interface SearchHistoryResponse {
  success: boolean;
  data: RecentSearch[];
}

export const getSearchSuggestions = async (
  query: string
): Promise<SearchSuggestion[]> => {
  try {
    if (!query.trim()) {
      return [];
    }

    // Request course suggestions that match the query
    const response = await api.get<SearchSuggestionsResponse>(
      `/api/search/suggestions?q=${encodeURIComponent(
        query.trim()
      )}&type=course&limit=9`
    );

    const courseSuggestions = response.data.data || [];

    // Create the search term suggestion as the first item
    const searchTermSuggestion: SearchSuggestion = {
      id: `search-${query.trim()}`,
      value: query.trim(),
      label: `Search for "${query.trim()}"`,
      type: "search",
    };

    // Return search term first, then course suggestions
    return [searchTermSuggestion, ...courseSuggestions];
  } catch (error) {
    console.error("Failed to fetch search suggestions:", error);

    // Even on error, return the search term suggestion
    if (query.trim()) {
      return [
        {
          id: `search-${query.trim()}`,
          value: query.trim(),
          label: `Search for "${query.trim()}"`,
          type: "search",
        },
      ];
    }

    return [];
  }
};

export const getSearchHistory = async (): Promise<RecentSearch[]> => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      return getGuestSearchHistory();
    }

    const response = await api.get<SearchHistoryResponse>(
      "/api/search/history"
    );
    return response.data.data || [];
  } catch (error) {
    console.error("Failed to fetch search history:", error);

    return getGuestSearchHistory();
  }
};

export const saveSearchToHistory = async (
  query: string,
  type: "search" | "suggestion" = "search",
  metadata?: { resultCount?: number; selectedSuggestion?: string }
): Promise<void> => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      saveGuestSearchHistory({
        query,
        type,
        timestamp: new Date().toISOString(),
        metadata,
      });
      return;
    }

    await api.post("/api/search/history", {
      query: query.trim(),
      type,
      metadata,
    });
  } catch (error) {
    console.error("Failed to save search to history:", error);

    saveGuestSearchHistory({
      query,
      type,
      timestamp: new Date().toISOString(),
      metadata,
    });
  }
};

export const clearSearchHistory = async (): Promise<void> => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      clearGuestSearchHistory();
      return;
    }

    await api.delete("/api/search/history");
  } catch (error) {
    console.error("Failed to clear search history:", error);

    clearGuestSearchHistory();
  }
};

export const getPopularSearches = async (): Promise<string[]> => {
  try {
    const response = await api.get<{ success: boolean; data: string[] }>(
      "/api/search/popular"
    );
    return response.data.data || [];
  } catch (error) {
    console.error("Failed to fetch popular searches:", error);
    return [];
  }
};

const GUEST_SEARCH_HISTORY_KEY = "guest_search_history";
const MAX_GUEST_HISTORY = 20;

const getGuestSearchHistory = (): RecentSearch[] => {
  try {
    const stored = localStorage.getItem(GUEST_SEARCH_HISTORY_KEY);
    if (!stored) return [];

    const history: RecentSearch[] = JSON.parse(stored);
    return history.slice(0, MAX_GUEST_HISTORY);
  } catch (error) {
    console.error("Failed to parse guest search history:", error);
    return [];
  }
};

const saveGuestSearchHistory = (search: RecentSearch): void => {
  try {
    const history = getGuestSearchHistory();

    const filteredHistory = history.filter(
      (item) => item.query !== search.query
    );

    const newHistory = [search, ...filteredHistory].slice(0, MAX_GUEST_HISTORY);

    localStorage.setItem(GUEST_SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error("Failed to save guest search history:", error);
  }
};

const clearGuestSearchHistory = (): void => {
  try {
    localStorage.removeItem(GUEST_SEARCH_HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear guest search history:", error);
  }
};

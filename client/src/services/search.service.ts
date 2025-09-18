import { api } from "./api";

export interface SearchSuggestion {
  id: string;
  value: string;
  label: string;
  type: "course" | "category" | "instructor";
  count?: number;
  metadata?: {
    instructorId?: string;
    categoryId?: string;
    courseId?: string;
    image?: string;
    description?: string;
  };
}

export interface RecentSearch {
  query: string;
  timestamp: string;
  type: "search" | "suggestion";
}

export interface SearchSuggestionsResponse {
  success: boolean;
  data: SearchSuggestion[];
}

export interface SearchHistoryResponse {
  success: boolean;
  data: RecentSearch[];
}

const mockCategories = [
  "Development",
  "Design",
  "Business",
  "Marketing",
  "Photography",
  "Music",
  "Health & Fitness",
  "Personal Development",
  "IT & Software",
  "Office Productivity",
  "Lifestyle",
  "Language",
  "Teaching & Academics",
];

const mockInstructors = [
  { id: "1", name: "Dr. Angela Yu", specialization: "Web Development" },
  { id: "2", name: "Jonas Schmedtmann", specialization: "JavaScript" },
  { id: "3", name: "Maximilian Schwarzmüller", specialization: "React" },
  { id: "4", name: "Brad Traversy", specialization: "Full Stack" },
  { id: "5", name: "Colt Steele", specialization: "Python" },
];

export const getSearchSuggestions = async (
  query: string
): Promise<SearchSuggestionsResponse> => {
  try {
    const response = await api.get(`/api/search/suggestions`, {
      params: { q: query, limit: 10 },
    });
    return response.data;
  } catch (error) {
    const suggestions: SearchSuggestion[] = [];
    const queryLower = query.toLowerCase();

    const mockCourses = [
      "React - The Complete Guide",
      "JavaScript: The Complete Course",
      "Python for Everybody",
      "Web Development Bootcamp",
      "Machine Learning A-Z",
      "Node.js Complete Course",
      "Angular - The Complete Guide",
      "Vue.js Complete Course",
      "Data Science Masterclass",
      "Digital Marketing Course",
    ];

    mockCourses
      .filter((course) => course.toLowerCase().includes(queryLower))
      .slice(0, 4)
      .forEach((course, index) => {
        suggestions.push({
          id: `course-${index}`,
          value: course,
          label: course,
          type: "course",
          count: Math.floor(Math.random() * 1000) + 100,
          metadata: {
            courseId: `course-${index}`,
            image: `https://images.unsplash.com/photo-${
              1500000000000 + index
            }?w=300&h=200&fit=crop`,
            description: `Learn ${course} from scratch to advanced level`,
          },
        });
      });

    mockCategories
      .filter((category) => category.toLowerCase().includes(queryLower))
      .slice(0, 3)
      .forEach((category, index) => {
        suggestions.push({
          id: `category-${index}`,
          value: category,
          label: category,
          type: "category",
          count: Math.floor(Math.random() * 500) + 50,
          metadata: {
            categoryId: category.toLowerCase().replace(/\s+/g, "-"),
          },
        });
      });

    mockInstructors
      .filter(
        (instructor) =>
          instructor.name.toLowerCase().includes(queryLower) ||
          instructor.specialization.toLowerCase().includes(queryLower)
      )
      .slice(0, 2)
      .forEach((instructor, index) => {
        suggestions.push({
          id: `instructor-${index}`,
          value: instructor.name,
          label: `${instructor.name} - ${instructor.specialization}`,
          type: "instructor",
          count: Math.floor(Math.random() * 100) + 10,
          metadata: {
            instructorId: instructor.id,
            description: `Expert in ${instructor.specialization}`,
          },
        });
      });

    return {
      success: true,
      data: suggestions.slice(0, 8),
    };
  }
};

export const saveSearchHistory = async (
  searchData: Omit<RecentSearch, "timestamp">
): Promise<void> => {
  try {
    await api.post("/api/search/history", {
      ...searchData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to save search history to server:", error);
    const historyData = {
      ...searchData,
      timestamp: new Date().toISOString(),
    };
    saveLocalSearchHistory(historyData);
  }
};

export const getSearchHistory = async (): Promise<SearchHistoryResponse> => {
  try {
    const response = await api.get("/api/search/history", {
      params: { limit: 10 },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch search history from server:", error);
    return {
      success: true,
      data: getLocalSearchHistory(),
    };
  }
};

export const clearSearchHistory = async (): Promise<void> => {
  try {
    await api.delete("/api/search/history");
  } catch (error) {
    console.error("Failed to clear search history on server:", error);
  }
  clearLocalSearchHistory();
};

export const getLocalSearchHistory = (): RecentSearch[] => {
  try {
    const history = localStorage.getItem("searchHistory");
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error("Failed to parse local search history:", error);
    return [];
  }
};

export const saveLocalSearchHistory = (searchData: RecentSearch): void => {
  try {
    const currentHistory = getLocalSearchHistory();
    const updatedHistory = [
      searchData,
      ...currentHistory.filter((item) => item.query !== searchData.query),
    ].slice(0, 10);

    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Failed to save search history to local storage:", error);
  }
};

export const clearLocalSearchHistory = (): void => {
  try {
    localStorage.removeItem("searchHistory");
  } catch (error) {
    console.error("Failed to clear local search history:", error);
  }
};

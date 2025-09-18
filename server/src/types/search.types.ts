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
    rating?: number;
    price?: number;
  };
}

export interface SearchHistory {
  _id?: string;
  user?: string;
  query: string;
  type: "search" | "suggestion";
  timestamp: Date;
  metadata?: {
    resultCount?: number;
    selectedSuggestion?: string;
  };
}

export interface SearchQuery {
  q: string;
  limit?: number;
  includeCategories?: boolean;
  includeInstructors?: boolean;
  includeCourses?: boolean;
}

export interface SearchHistoryQuery {
  limit?: number;
  type?: "search" | "suggestion";
}

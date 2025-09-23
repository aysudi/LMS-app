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

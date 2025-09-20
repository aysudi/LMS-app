export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  category: string;
  subcategory?: string;
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  originalPrice: number;
  discountPrice?: number;
  isFree: boolean;
  currentPrice?: number;
  rating: number;
  ratingsCount: number;
  studentsEnrolled: string[];
  enrollmentCount: number;
  image: string;
  videoPromo?: string;
  tags: string[];
  level: "Beginner" | "Intermediate" | "Advanced";
  language: string;
  sections: any[];
  learningObjectives: string[];
  requirements: string[];
  targetAudience: string[];
  totalDuration: number;
  totalLessons: number;
  certificateProvided: boolean;
  isPublished: boolean;
  publishedAt?: string;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
  reviews: {
    user: string;
    rating: number;
    comment: string;
    date: string;
  }[];
  progress?: {
    user: string;
    completedLessons: string[];
    progressPercentage: number;
    lastAccessedLesson?: string;
    enrollmentDate: string;
  }[];
}

export interface CourseQuery {
  page?: number;
  limit?: number;
  category?: string;
  level?: string;
  search?: string;
  instructor?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "rating" | "originalPrice" | "createdAt" | "studentsCount";
  sortOrder?: "asc" | "desc";
}

export interface CreateCourseData {
  title: string;
  description: string;
  shortDescription?: string;
  category: string;
  subcategory?: string;
  originalPrice: number;
  discountPrice?: number;
  isFree?: boolean;
  image?: string;
  videoPromo?: string;
  tags?: string[];
  level: "Beginner" | "Intermediate" | "Advanced";
  language?: string;
  learningObjectives?: string[];
  requirements?: string[];
  targetAudience?: string[];
  certificateProvided?: boolean;
}

export interface UpdateCourseData extends Partial<CreateCourseData> {
  isPublished?: boolean;
}

export interface CoursesResponse {
  success: boolean;
  data: Course[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCourses: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CourseResponse {
  success: boolean;
  data: Course;
}

export interface CourseListResponse {
  success: boolean;
  data: Course[];
}

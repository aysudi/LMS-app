import { api } from "./api";

// Course types
export interface Course {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  category: string;
  subcategory?: string;
  instructor: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  price: number;
  discountPrice?: number;
  originalPrice?: number;
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
  sortBy?: "rating" | "price" | "createdAt" | "studentsCount";
  sortOrder?: "asc" | "desc";
}

export interface CreateCourseData {
  title: string;
  description: string;
  shortDescription?: string;
  category: string;
  subcategory?: string;
  price: number;
  discountPrice?: number;
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

// API Functions

// Get all courses with filtering and pagination
export const getCourses = async (
  params: CourseQuery = {}
): Promise<CoursesResponse> => {
  const response = await api.get("/api/courses", { params });
  return response.data;
};

// Get course by ID
export const getCourseById = async (
  courseId: string
): Promise<CourseResponse> => {
  const response = await api.get(`/api/courses/${courseId}`);
  return response.data;
};

// Get user's enrolled courses
export const getUserCourses = async (): Promise<CourseListResponse> => {
  const response = await api.get("/api/courses/user/enrolled");
  return response.data;
};

// Get instructor's courses
export const getInstructorCourses = async (): Promise<CourseListResponse> => {
  const response = await api.get("/api/courses/instructor/courses");
  return response.data;
};

// Create new course (instructor only)
export const createCourse = async (
  courseData: CreateCourseData
): Promise<CourseResponse> => {
  const response = await api.post("/api/courses", courseData);
  return response.data;
};

// Update course (instructor only)
export const updateCourse = async (
  courseId: string,
  updateData: UpdateCourseData
): Promise<CourseResponse> => {
  const response = await api.put(`/api/courses/${courseId}`, updateData);
  return response.data;
};

// Delete course (instructor only)
export const deleteCourse = async (
  courseId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/api/courses/${courseId}`);
  return response.data;
};

// Search courses with specific filters
export const searchCourses = async (
  searchQuery: string,
  filters: Partial<CourseQuery> = {}
): Promise<CoursesResponse> => {
  const params = { search: searchQuery, ...filters };
  return getCourses(params);
};

// Get courses by category
export const getCoursesByCategory = async (
  category: string,
  additionalParams: Partial<CourseQuery> = {}
): Promise<CoursesResponse> => {
  const params = { category, ...additionalParams };
  return getCourses(params);
};

// Get courses by instructor
export const getCoursesByInstructor = async (
  instructorId: string,
  additionalParams: Partial<CourseQuery> = {}
): Promise<CoursesResponse> => {
  const params = { instructor: instructorId, ...additionalParams };
  return getCourses(params);
};

// Get featured/popular courses
export const getFeaturedCourses = async (
  limit = 10
): Promise<CoursesResponse> => {
  const params = {
    sortBy: "rating" as const,
    sortOrder: "desc" as const,
    limit,
    page: 1,
  };
  return getCourses(params);
};

// Get free courses
export const getFreeCourses = async (limit = 10): Promise<CoursesResponse> => {
  const params = {
    maxPrice: 0,
    limit,
    page: 1,
  };
  return getCourses(params);
};

// Get courses by price range
export const getCoursesByPriceRange = async (
  minPrice: number,
  maxPrice: number,
  additionalParams: Partial<CourseQuery> = {}
): Promise<CoursesResponse> => {
  const params = { minPrice, maxPrice, ...additionalParams };
  return getCourses(params);
};

// Get trending courses (most enrolled)
export const getTrendingCourses = async (
  limit = 10
): Promise<CoursesResponse> => {
  const params = {
    sortBy: "studentsCount" as const,
    sortOrder: "desc" as const,
    limit,
    page: 1,
  };
  return getCourses(params);
};

import type {
  CourseListResponse,
  CourseQuery,
  CourseResponse,
  CoursesResponse,
  CreateCourseData,
  UpdateCourseData,
} from "../types/course.type";
import { api } from "./api";

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

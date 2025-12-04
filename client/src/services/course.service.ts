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

// Track course view for analytics
export const trackCourseView = async (courseId: string, userId?: string) => {
  try {
    await api.post(`/api/courses/track-view/${courseId}`, {
      userId: userId || null,
    });
  } catch (error) {
    console.error("Failed to track course view:", error);
  }
};

// Track watch time for analytics
export const trackWatchTime = async (
  courseId: string,
  watchTimeSeconds: number,
  userId?: string
) => {
  try {
    await api.post(`/api/courses/track-watch-time/${courseId}`, {
      watchTimeSeconds,
      userId: userId || null,
    });
  } catch (error) {
    console.error("Failed to track watch time:", error);
  }
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
  courseData: CreateCourseData | FormData
): Promise<CourseResponse> => {
  let config = {};

  if (courseData instanceof FormData) {
    config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
  }

  const response = await api.post("/api/courses", courseData, config);
  return response.data;
};

// Update course (instructor only)
export const updateCourse = async (
  courseId: string,
  updateData: UpdateCourseData
): Promise<CourseResponse> => {
  const hasImageFile =
    updateData.image instanceof File ||
    (typeof updateData.image === "object" &&
      updateData.image?.file instanceof File);
  const hasVideoFile =
    updateData.videoPromo instanceof File ||
    (typeof updateData.videoPromo === "object" &&
      updateData.videoPromo?.file instanceof File);
  const hasFiles = hasImageFile || hasVideoFile;

  if (hasFiles) {
    const formData = new FormData();

    Object.entries(updateData).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (key === "image") {
        if (value instanceof File) {
          formData.append("image", value);
        } else if (typeof value === "object" && value.file instanceof File) {
          formData.append("image", value.file);
        }
      } else if (key === "videoPromo") {
        if (value instanceof File) {
          formData.append("videoPromo", value);
        } else if (typeof value === "object" && value.file instanceof File) {
          formData.append("videoPromo", value.file);
        }
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, item);
        });
      } else if (typeof value === "object") {
        if (!(value instanceof File) && !value.file) {
          formData.append(key, JSON.stringify(value));
        }
      } else {
        formData.append(key, String(value));
      }
    });

    const response = await api.put(`/api/courses/${courseId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  // Regular JSON update if no files
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

// Toggle course status (instructor only)
export const toggleCourseStatus = async (
  courseId: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  const response = await api.patch(`/api/courses/${courseId}/toggle-status`);
  return response.data;
};

// Submit course for approval (instructor only)
export const submitCourseForApproval = async (
  courseId: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  const response = await api.patch(
    `/api/courses/${courseId}/submit-for-approval`
  );
  return response.data;
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationOptions } from "@tanstack/react-query";
import { courseQueryKeys } from "./useCourseQueries";
import { api } from "../services/api";
import type { Course, CourseResponse } from "../types/course.type";

interface EnrollCourseResponse {
  success: boolean;
  message: string;
  data?: {
    course: Course;
    enrollment: {
      enrollmentDate: string;
      progress: number;
    };
  };
}

interface UnenrollCourseResponse {
  success: boolean;
  message: string;
}

interface RateCourseData {
  rating: number;
  comment?: string;
}

interface RateCourseResponse {
  success: boolean;
  message: string;
  data: {
    rating: number;
    comment?: string;
    date: string;
  };
}

interface UpdateProgressData {
  lessonId: string;
  completed: boolean;
  watchTime?: number;
}

interface UpdateProgressResponse {
  success: boolean;
  message: string;
  data: {
    progressPercentage: number;
    completedLessons: string[];
    lastAccessedLesson: string;
  };
}

// Course bookmark/favorite mutation
interface BookmarkCourseResponse {
  success: boolean;
  message: string;
}

// API Functions

// Create course with file upload support
const createCourseWithFiles = async (
  formData: FormData
): Promise<CourseResponse> => {
  const response = await api.post("/api/courses", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const enrollInCourse = async (
  courseId: string
): Promise<EnrollCourseResponse> => {
  const response = await api.post(`/api/courses/${courseId}/enroll`);
  return response.data;
};

const unenrollFromCourse = async (
  courseId: string
): Promise<UnenrollCourseResponse> => {
  const response = await api.delete(`/api/courses/${courseId}/enroll`);
  return response.data;
};

const rateCourse = async (
  courseId: string,
  ratingData: RateCourseData
): Promise<RateCourseResponse> => {
  const response = await api.post(
    `/api/courses/${courseId}/rating`,
    ratingData
  );
  return response.data;
};

const updateCourseProgress = async (
  courseId: string,
  progressData: UpdateProgressData
): Promise<UpdateProgressResponse> => {
  const response = await api.put(
    `/api/courses/${courseId}/progress`,
    progressData
  );
  return response.data;
};

const bookmarkCourse = async (
  courseId: string
): Promise<BookmarkCourseResponse> => {
  const response = await api.post(`/api/courses/${courseId}/bookmark`);
  return response.data;
};

const unbookmarkCourse = async (
  courseId: string
): Promise<BookmarkCourseResponse> => {
  const response = await api.delete(`/api/courses/${courseId}/bookmark`);
  return response.data;
};

const reportCourse = async (
  courseId: string,
  reason: string
): Promise<{ success: boolean; message: string }> => {
  const response = await api.post(`/api/courses/${courseId}/report`, {
    reason,
  });
  return response.data;
};

// Custom Hooks

// Enroll in course mutation
export const useEnrollCourse = (
  options?: UseMutationOptions<EnrollCourseResponse, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollInCourse,
    onSuccess: (data, courseId) => {
      queryClient.setQueryData(
        courseQueryKeys.detail(courseId),
        (oldData: CourseResponse | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              studentsEnrolled: [
                ...oldData.data.studentsEnrolled,
                data.data?.enrollment ? "current-user" : "",
              ],
              enrollmentCount: (oldData.data.enrollmentCount || 0) + 1,
            },
          };
        }
      );

      queryClient.invalidateQueries({
        queryKey: courseQueryKeys.userCourses(),
      });

      queryClient.invalidateQueries({ queryKey: courseQueryKeys.lists() });
    },
    ...options,
  });
};

// Unenroll from course mutation
export const useUnenrollCourse = (
  options?: UseMutationOptions<UnenrollCourseResponse, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unenrollFromCourse,
    onSuccess: (_, courseId) => {
      queryClient.setQueryData(
        courseQueryKeys.detail(courseId),
        (oldData: CourseResponse | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              studentsEnrolled: oldData.data.studentsEnrolled.filter(
                (id) => id !== "current-user"
              ),
              enrollmentCount: Math.max(
                (oldData.data.enrollmentCount || 1) - 1,
                0
              ),
            },
          };
        }
      );

      queryClient.invalidateQueries({
        queryKey: courseQueryKeys.userCourses(),
      });

      queryClient.invalidateQueries({ queryKey: courseQueryKeys.lists() });
    },
    ...options,
  });
};

// Rate course mutation
export const useRateCourse = (
  options?: UseMutationOptions<
    RateCourseResponse,
    Error,
    { courseId: string; ratingData: RateCourseData }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, ratingData }) => rateCourse(courseId, ratingData),
    onSuccess: (data, { courseId }) => {
      queryClient.setQueryData(
        courseQueryKeys.detail(courseId),
        (oldData: CourseResponse | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              reviews: [
                ...oldData.data.reviews,
                {
                  user: "current-user",
                  rating: data.data.rating,
                  comment: data.data.comment || "",
                  date: data.data.date,
                },
              ],
              ratingsCount: (oldData.data.ratingsCount || 0) + 1,
            },
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: courseQueryKeys.lists() });
    },
    ...options,
  });
};

// Update course progress mutation
export const useUpdateCourseProgress = (
  options?: UseMutationOptions<
    UpdateProgressResponse,
    Error,
    { courseId: string; progressData: UpdateProgressData }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, progressData }) =>
      updateCourseProgress(courseId, progressData),
    onSuccess: (data, { courseId }) => {
      queryClient.setQueryData(
        courseQueryKeys.detail(courseId),
        (oldData: CourseResponse | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              progress:
                oldData.data.progress?.map((p) =>
                  p.user === "current-user"
                    ? {
                        ...p,
                        completedLessons: data.data.completedLessons,
                        progressPercentage: data.data.progressPercentage,
                        lastAccessedLesson: data.data.lastAccessedLesson,
                      }
                    : p
                ) || [],
            },
          };
        }
      );

      queryClient.removeQueries({
        predicate: (query) => {
          return (
            query.queryKey[0] === "instructor" &&
            query.queryKey[1] === "courses"
          );
        },
      });

      queryClient.refetchQueries({
        predicate: (query) => {
          return (
            query.queryKey[0] === "instructor" &&
            query.queryKey[1] === "courses"
          );
        },
      });

      queryClient.invalidateQueries({
        queryKey: courseQueryKeys.userCourses(),
      });
    },
    ...options,
  });
};

// Bookmark course mutation
export const useBookmarkCourse = (
  options?: UseMutationOptions<BookmarkCourseResponse, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookmarkCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personalization"] });
    },
    ...options,
  });
};

// Unbookmark course mutation
export const useUnbookmarkCourse = (
  options?: UseMutationOptions<BookmarkCourseResponse, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unbookmarkCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personalization"] });
    },
    ...options,
  });
};

// Report course mutation
export const useReportCourse = (
  options?: UseMutationOptions<
    { success: boolean; message: string },
    Error,
    { courseId: string; reason: string }
  >
) => {
  return useMutation({
    mutationFn: ({ courseId, reason }) => reportCourse(courseId, reason),
    ...options,
  });
};

// Combined enrollment toggle hook
export const useToggleEnrollment = () => {
  const enrollMutation = useEnrollCourse();
  const unenrollMutation = useUnenrollCourse();

  const toggleEnrollment = (courseId: string, isCurrentlyEnrolled: boolean) => {
    if (isCurrentlyEnrolled) {
      return unenrollMutation.mutate(courseId);
    } else {
      return enrollMutation.mutate(courseId);
    }
  };

  return {
    toggleEnrollment,
    isLoading: enrollMutation.isPending || unenrollMutation.isPending,
    error: enrollMutation.error || unenrollMutation.error,
    isSuccess: enrollMutation.isSuccess || unenrollMutation.isSuccess,
  };
};

// Combined bookmark toggle hook
export const useToggleBookmark = () => {
  const bookmarkMutation = useBookmarkCourse();
  const unbookmarkMutation = useUnbookmarkCourse();

  const toggleBookmark = (courseId: string, isCurrentlyBookmarked: boolean) => {
    if (isCurrentlyBookmarked) {
      return unbookmarkMutation.mutate(courseId);
    } else {
      return bookmarkMutation.mutate(courseId);
    }
  };

  return {
    toggleBookmark,
    isLoading: bookmarkMutation.isPending || unbookmarkMutation.isPending,
    error: bookmarkMutation.error || unbookmarkMutation.error,
    isSuccess: bookmarkMutation.isSuccess || unbookmarkMutation.isSuccess,
  };
};

// Create course mutation
export const useCreateCourse = (
  options?: UseMutationOptions<CourseResponse, Error, FormData>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCourseWithFiles,
    onSuccess: (data) => {
      queryClient.setQueryData(
        courseQueryKeys.instructorCourses(),
        (oldData: { success: boolean; data: Course[] } | undefined) => {
          if (!oldData) return { success: true, data: [data.data] };
          return {
            ...oldData,
            data: [...oldData.data, data.data],
          };
        }
      );

      // Remove and refetch instructor course queries for immediate updates
      queryClient.removeQueries({
        predicate: (query) => {
          return (
            query.queryKey[0] === "instructor" &&
            query.queryKey[1] === "courses"
          );
        },
      });

      queryClient.refetchQueries({
        predicate: (query) => {
          return (
            query.queryKey[0] === "instructor" &&
            query.queryKey[1] === "courses"
          );
        },
      });

      queryClient.invalidateQueries({
        queryKey: courseQueryKeys.lists(),
      });
    },
    ...options,
  });
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCourseStatus,
  searchCourses,
  submitCourseForApproval,
} from "../services/course.service";

import type {
  UpdateCourseData,
  CourseResponse,
  CourseQuery,
  CoursesResponse,
} from "../types/course.type";

// Query keys for consistent caching
export const courseQueryKeys = {
  all: ["courses"] as const,
  lists: () => [...courseQueryKeys.all, "list"] as const,
  list: (filters: CourseQuery) =>
    [...courseQueryKeys.lists(), filters] as const,
  details: () => [...courseQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...courseQueryKeys.details(), id] as const,
  search: (term: string) => [...courseQueryKeys.all, "search", term] as const,
  userCourses: (userId?: string) =>
    [...courseQueryKeys.all, "user", userId] as const,
  instructorCourses: (instructorId?: string) =>
    [...courseQueryKeys.all, "instructor", instructorId] as const,
  category: (category: string) =>
    [...courseQueryKeys.all, "category", category] as const,
  featured: () => [...courseQueryKeys.all, "featured"] as const,
  free: () => [...courseQueryKeys.all, "free"] as const,
  trending: () => [...courseQueryKeys.all, "trending"] as const,
};

// QUERY HOOKS

export const useCourses = (
  params?: CourseQuery,
  options?: Omit<
    UseQueryOptions<CoursesResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: courseQueryKeys.list(params || {}),
    queryFn: () => getCourses(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCourse = (
  courseId: string,
  options?: Omit<UseQueryOptions<CourseResponse, Error>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: courseQueryKeys.detail(courseId),
    queryFn: () => getCourseById(courseId),
    enabled: !!courseId,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

export const useSearchCourses = (
  searchTerm: string,
  params?: CourseQuery,
  options?: Omit<
    UseQueryOptions<CoursesResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: courseQueryKeys.search(searchTerm),
    queryFn: () => searchCourses(searchTerm, params),
    enabled: !!searchTerm && searchTerm.length > 0,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

export const useUserCourses = (
  userId?: string,
  params?: CourseQuery,
  options?: Omit<
    UseQueryOptions<CoursesResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: courseQueryKeys.userCourses(userId),
    queryFn: () => getCourses({ ...params, instructor: userId }),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useInstructorCourses = (
  instructorId?: string,
  params?: CourseQuery,
  options?: Omit<
    UseQueryOptions<CoursesResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: courseQueryKeys.instructorCourses(instructorId),
    queryFn: () => getCourses({ ...params, instructor: instructorId }),
    enabled: !!instructorId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCoursesByCategory = (
  category: string,
  params?: CourseQuery,
  options?: Omit<
    UseQueryOptions<CoursesResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: courseQueryKeys.category(category),
    queryFn: () => getCourses({ ...params, category }),
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useFeaturedCourses = (
  limit?: number | CourseQuery,
  options?: Omit<
    UseQueryOptions<CoursesResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  const params = typeof limit === "number" ? { limit } : limit;
  return useQuery({
    queryKey: courseQueryKeys.featured(),
    queryFn: () => getCourses(params),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

export const useFreeCourses = (
  limit?: number | CourseQuery,
  options?: Omit<
    UseQueryOptions<CoursesResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  const params = typeof limit === "number" ? { limit } : limit;
  return useQuery({
    queryKey: courseQueryKeys.free(),
    queryFn: () => getCourses({ ...params, minPrice: 0, maxPrice: 0 }),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useTrendingCourses = (
  limit?: number | CourseQuery,
  options?: Omit<
    UseQueryOptions<CoursesResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  const params = typeof limit === "number" ? { limit } : limit;
  return useQuery({
    queryKey: courseQueryKeys.trending(),
    queryFn: () => getCourses(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// MUTATION HOOKS

export const useCreateCourse = (
  options?: UseMutationOptions<CourseResponse, Error, FormData>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseData: FormData) => createCourse(courseData),
    onSuccess: () => {
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

export const useUpdateCourse = (
  options?: UseMutationOptions<
    CourseResponse,
    Error,
    { courseId: string; updateData: UpdateCourseData }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, updateData }) =>
      updateCourse(courseId, updateData),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        courseQueryKeys.detail(variables.courseId),
        data
      );

      queryClient.invalidateQueries({ queryKey: courseQueryKeys.lists() });

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
    },
    ...options,
  });
};

export const useDeleteCourse = (
  options?: UseMutationOptions<
    { success: boolean; message: string },
    Error,
    string
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCourse,
    onSuccess: (_, courseId) => {
      queryClient.removeQueries({ queryKey: courseQueryKeys.detail(courseId) });

      queryClient.invalidateQueries({ queryKey: courseQueryKeys.lists() });

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
    },
    ...options,
  });
};

export const useToggleCourseStatus = (
  options?: UseMutationOptions<
    { success: boolean; message: string; data?: any },
    Error,
    string
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleCourseStatus,
    onSuccess: (_, courseId) => {
      queryClient.setQueryData(
        courseQueryKeys.detail(courseId),
        (oldData: CourseResponse | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              isPublished: !oldData.data.isPublished,
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
    },
    ...options,
  });
};

// UTILITY HOOKS

export const usePrefetchCourses = () => {
  const queryClient = useQueryClient();

  const prefetchCourses = (params: CourseQuery = {}) => {
    queryClient.prefetchQuery({
      queryKey: courseQueryKeys.list(params),
      queryFn: () => getCourses(params),
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchCourse = (courseId: string) => {
    queryClient.prefetchQuery({
      queryKey: courseQueryKeys.detail(courseId),
      queryFn: () => getCourseById(courseId),
      staleTime: 10 * 60 * 1000,
    });
  };

  return {
    prefetchCourses,
    prefetchCourse,
  };
};

export const useInvalidateCourses = () => {
  const queryClient = useQueryClient();

  const invalidateAllCourses = () => {
    queryClient.invalidateQueries({
      queryKey: courseQueryKeys.all,
    });
  };

  const invalidateCourseLists = () => {
    queryClient.invalidateQueries({
      queryKey: courseQueryKeys.lists(),
    });
  };

  const invalidateCourse = (courseId: string) => {
    queryClient.invalidateQueries({
      queryKey: courseQueryKeys.detail(courseId),
    });
  };

  return {
    invalidateAllCourses,
    invalidateCourseLists,
    invalidateCourse,
  };
};

// Submit course for approval hook
export const useSubmitCourseForApproval = (
  options?: UseMutationOptions<
    { success: boolean; message: string; data?: any },
    Error,
    string
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => submitCourseForApproval(courseId),
    onSuccess: (data) => {
      // Invalidate instructor courses to reflect status change
      queryClient.invalidateQueries({
        queryKey: courseQueryKeys.instructorCourses(),
      });

      // Show success message
      console.log(data.message);
    },
    onError: (error) => {
      console.error("Failed to submit course for approval:", error);
    },
    ...options,
  });
};

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import {
  getCourses,
  getCourseById,
  getUserCourses,
  getInstructorCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  searchCourses,
  getCoursesByCategory,
  getCoursesByInstructor,
  getFeaturedCourses,
  getFreeCourses,
  getCoursesByPriceRange,
  getTrendingCourses,
} from "../services/course.service";
import type {
  CourseQuery,
  CreateCourseData,
  UpdateCourseData,
  CoursesResponse,
  CourseResponse,
  CourseListResponse,
} from "../types/course.type";

// Query keys for consistent cache management
export const courseQueryKeys = {
  all: ["courses"] as const,
  lists: () => [...courseQueryKeys.all, "list"] as const,
  list: (params: CourseQuery) => [...courseQueryKeys.lists(), params] as const,
  details: () => [...courseQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...courseQueryKeys.details(), id] as const,
  userCourses: () => [...courseQueryKeys.all, "user"] as const,
  instructorCourses: () => [...courseQueryKeys.all, "instructor"] as const,
  search: (query: string, filters?: Partial<CourseQuery>) =>
    [...courseQueryKeys.all, "search", query, filters] as const,
  category: (category: string) =>
    [...courseQueryKeys.all, "category", category] as const,
  byInstructor: (instructorId: string) =>
    [...courseQueryKeys.all, "instructor", instructorId] as const,
  featured: () => [...courseQueryKeys.all, "featured"] as const,
  free: () => [...courseQueryKeys.all, "free"] as const,
  trending: () => [...courseQueryKeys.all, "trending"] as const,
  priceRange: (minPrice: number, maxPrice: number) =>
    [...courseQueryKeys.all, "priceRange", minPrice, maxPrice] as const,
};

// Get courses with pagination and filtering
export const useCourses = (
  params: CourseQuery = {},
  options?: Omit<
    UseQueryOptions<CoursesResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: courseQueryKeys.list(params),
    queryFn: () => getCourses(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// Infinite query for courses (for pagination with load more)
export const useInfiniteCourses = (
  baseParams: Omit<CourseQuery, "page"> = {},
  options?: any
) => {
  return useInfiniteQuery({
    queryKey: [...courseQueryKeys.lists(), "infinite", baseParams],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getCourses({ ...baseParams, page: pageParam }),
    getNextPageParam: (lastPage: CoursesResponse) => {
      const { pagination } = lastPage;
      return pagination.hasNextPage ? pagination.currentPage + 1 : undefined;
    },
    getPreviousPageParam: (firstPage: CoursesResponse) => {
      const { pagination } = firstPage;
      return pagination.hasPreviousPage
        ? pagination.currentPage - 1
        : undefined;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    initialPageParam: 1,
    ...options,
  });
};

// Get course by ID
export const useCourse = (
  courseId: string,
  options?: Omit<UseQueryOptions<CourseResponse, Error>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: courseQueryKeys.detail(courseId),
    queryFn: () => getCourseById(courseId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!courseId,
    ...options,
  });
};

// Get user's enrolled courses
export const useUserCourses = (
  options?: Omit<
    UseQueryOptions<CourseListResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: courseQueryKeys.userCourses(),
    queryFn: getUserCourses,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 3;
    },
    ...options,
  });
};

// Get instructor's courses
export const useInstructorCourses = (
  options?: Omit<
    UseQueryOptions<CourseListResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: courseQueryKeys.instructorCourses(),
    queryFn: getInstructorCourses,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403)
        return false;
      return failureCount < 3;
    },
    ...options,
  });
};

// Search courses
export const useSearchCourses = (
  searchQuery: string,
  filters: Partial<CourseQuery> = {},
  options?: Omit<
    UseQueryOptions<CoursesResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: courseQueryKeys.search(searchQuery, filters),
    queryFn: () => searchCourses(searchQuery, filters),
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!searchQuery && searchQuery.trim().length > 0,
    ...options,
  });
};

// Get courses by category
export const useCoursesByCategory = (
  category: string,
  additionalParams: Partial<CourseQuery> = {},
  options?: Omit<
    UseQueryOptions<CoursesResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: courseQueryKeys.category(category),
    queryFn: () => getCoursesByCategory(category, additionalParams),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: !!category,
    ...options,
  });
};

// Get courses by instructor
export const useCoursesByInstructor = (
  instructorId: string,
  additionalParams: Partial<CourseQuery> = {},
  options?: Omit<
    UseQueryOptions<CoursesResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: courseQueryKeys.byInstructor(instructorId),
    queryFn: () => getCoursesByInstructor(instructorId, additionalParams),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: !!instructorId,
    ...options,
  });
};

// Get featured courses
export const useFeaturedCourses = (
  limit = 10,
  options?: Omit<
    UseQueryOptions<CoursesResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: courseQueryKeys.featured(),
    queryFn: () => getFeaturedCourses(limit),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    ...options,
  });
};

// Get free courses
export const useFreeCourses = (
  limit = 10,
  options?: Omit<
    UseQueryOptions<CoursesResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: courseQueryKeys.free(),
    queryFn: () => getFreeCourses(limit),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    ...options,
  });
};

// Get trending courses
export const useTrendingCourses = (
  limit = 10,
  options?: Omit<
    UseQueryOptions<CoursesResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: courseQueryKeys.trending(),
    queryFn: () => getTrendingCourses(limit),
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    ...options,
  });
};

// Get courses by price range
export const useCoursesByPriceRange = (
  minPrice: number,
  maxPrice: number,
  additionalParams: Partial<CourseQuery> = {},
  options?: Omit<
    UseQueryOptions<CoursesResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: courseQueryKeys.priceRange(minPrice, maxPrice),
    queryFn: () => getCoursesByPriceRange(minPrice, maxPrice, additionalParams),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: typeof minPrice === "number" && typeof maxPrice === "number",
    ...options,
  });
};

// Create course mutation
export const useCreateCourse = (
  options?: UseMutationOptions<CourseResponse, Error, CreateCourseData>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCourse,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.all });

      queryClient.setQueryData(courseQueryKeys.detail(data.data.id), data);
    },
    ...options,
  });
};

// Update course mutation
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
      queryClient.invalidateQueries({
        queryKey: courseQueryKeys.instructorCourses(),
      });

      // Remove and refetch instructor courses for immediate UI updates
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

// Delete course mutation
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
      queryClient.invalidateQueries({
        queryKey: courseQueryKeys.instructorCourses(),
      });

      queryClient.invalidateQueries({
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

// Prefetch courses hook for performance optimization
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

  const prefetchFeaturedCourses = () => {
    queryClient.prefetchQuery({
      queryKey: courseQueryKeys.featured(),
      queryFn: () => getFeaturedCourses(),
      staleTime: 10 * 60 * 1000,
    });
  };

  const prefetchTrendingCourses = () => {
    queryClient.prefetchQuery({
      queryKey: courseQueryKeys.trending(),
      queryFn: () => getTrendingCourses(),
      staleTime: 15 * 60 * 1000,
    });
  };

  return {
    prefetchCourses,
    prefetchCourse,
    prefetchFeaturedCourses,
    prefetchTrendingCourses,
  };
};

// Helper hook for invalidating course queries
export const useInvalidateCourses = () => {
  const queryClient = useQueryClient();

  const invalidateAllCourses = () => {
    queryClient.invalidateQueries({ queryKey: courseQueryKeys.all });
  };

  const invalidateCoursesList = () => {
    queryClient.invalidateQueries({ queryKey: courseQueryKeys.lists() });
  };

  const invalidateCourse = (courseId: string) => {
    queryClient.invalidateQueries({
      queryKey: courseQueryKeys.detail(courseId),
    });
  };

  const invalidateUserCourses = () => {
    queryClient.invalidateQueries({ queryKey: courseQueryKeys.userCourses() });
  };

  const invalidateInstructorCourses = () => {
    queryClient.invalidateQueries({
      queryKey: courseQueryKeys.instructorCourses(),
    });
  };

  const invalidateFeaturedCourses = () => {
    queryClient.invalidateQueries({ queryKey: courseQueryKeys.featured() });
  };

  const invalidateTrendingCourses = () => {
    queryClient.invalidateQueries({ queryKey: courseQueryKeys.trending() });
  };

  return {
    invalidateAllCourses,
    invalidateCoursesList,
    invalidateCourse,
    invalidateUserCourses,
    invalidateInstructorCourses,
    invalidateFeaturedCourses,
    invalidateTrendingCourses,
  };
};

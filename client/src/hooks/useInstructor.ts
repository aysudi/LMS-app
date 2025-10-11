import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import type {
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import {
  getInstructorOverview,
  getInstructorCoursesWithStats,
  getCourseStudents,
  getInstructorMessages,
  replyToMessage,
  markMessageAsRead,
  markMessageAsResolved,
  getMessageStats,
  getInstructorEarnings,
  getInstructorEarningsByCourse,
  updatePayoutStatus,
  createSection,
  updateSection,
  deleteSection,
  getSectionsByCourse,
  getSectionsWithCount,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonsBySection,
  getLessonById,
  addNoteToLesson,
  getUserNotesForLesson,
  deleteCourse,
  toggleCourseStatus,
} from "../services/instructor.service";
import type {
  InstructorOverviewResponse,
  InstructorCoursesResponse,
  CourseStudentsResponse,
  InstructorMessagesResponse,
  MessageStatsResponse,
  InstructorEarningsResponse,
  InstructorEarningsByCourseResponse,
  ReplyToMessageData,
  UpdatePayoutStatusData,
  InstructorCoursesQuery,
  InstructorMessagesQuery,
  CreateSectionData,
  UpdateSectionData,
  CreateLessonData,
  UpdateLessonData,
} from "../types/instructor.type";

// Query keys for consistent cache management
export const instructorQueryKeys = {
  all: ["instructor"] as const,
  overview: () => [...instructorQueryKeys.all, "overview"] as const,
  courses: () => [...instructorQueryKeys.all, "courses"] as const,
  coursesWithStats: (params: InstructorCoursesQuery) =>
    [...instructorQueryKeys.courses(), "stats", params] as const,
  courseStudents: (courseId: string) =>
    [...instructorQueryKeys.courses(), courseId, "students"] as const,
  messages: () => [...instructorQueryKeys.all, "messages"] as const,
  messagesList: (params: InstructorMessagesQuery) =>
    [...instructorQueryKeys.messages(), "list", params] as const,
  messageStats: () => [...instructorQueryKeys.messages(), "stats"] as const,
  earnings: () => [...instructorQueryKeys.all, "earnings"] as const,
  earningsByCourse: (courseId?: string) =>
    [...instructorQueryKeys.earnings(), "by-course", courseId] as const,
  sections: () => [...instructorQueryKeys.all, "sections"] as const,
  sectionsByCourse: (courseId: string) =>
    [...instructorQueryKeys.sections(), courseId] as const,
  lessons: () => [...instructorQueryKeys.all, "lessons"] as const,
  lessonsBySection: (sectionId: string) =>
    [...instructorQueryKeys.lessons(), "by-section", sectionId] as const,
  lesson: (lessonId: string) =>
    [...instructorQueryKeys.lessons(), lessonId] as const,
  lessonNotes: (courseId: string, sectionId: string, lessonId: string) =>
    [
      ...instructorQueryKeys.lessons(),
      courseId,
      sectionId,
      lessonId,
      "notes",
    ] as const,
};

// Dashboard & Overview Hooks
export const useInstructorOverview = (
  options?: Omit<
    UseQueryOptions<InstructorOverviewResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: instructorQueryKeys.overview(),
    queryFn: getInstructorOverview,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403)
        return false;
      return failureCount < 3;
    },
    ...options,
  });
};

// Course Management Hooks
export const useInstructorCoursesWithStats = (
  params: InstructorCoursesQuery = {},
  options?: Omit<
    UseQueryOptions<InstructorCoursesResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: instructorQueryKeys.coursesWithStats(params),
    queryFn: () => getInstructorCoursesWithStats(params),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403)
        return false;
      return failureCount < 3;
    },
    ...options,
  });
};

export const useCourseStudents = (
  courseId: string,
  params: { page?: number; limit?: number } = {},
  options?: Omit<
    UseQueryOptions<CourseStudentsResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: instructorQueryKeys.courseStudents(courseId),
    queryFn: () => getCourseStudents(courseId, params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!courseId,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403)
        return false;
      return failureCount < 3;
    },
    ...options,
  });
};

// Communication Hooks
export const useInstructorMessages = (
  params: InstructorMessagesQuery = {},
  options?: Omit<
    UseQueryOptions<InstructorMessagesResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: instructorQueryKeys.messagesList(params),
    queryFn: () => getInstructorMessages(params),
    staleTime: 1 * 60 * 1000, // 1 minute for real-time messages
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403)
        return false;
      return failureCount < 3;
    },
    ...options,
  });
};

export const useMessageStats = (
  options?: Omit<
    UseQueryOptions<MessageStatsResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: instructorQueryKeys.messageStats(),
    queryFn: getMessageStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403)
        return false;
      return failureCount < 3;
    },
    ...options,
  });
};

// Communication Mutations
export const useReplyToMessage = (
  options?: UseMutationOptions<
    { success: boolean; message: string; data?: any },
    Error,
    { messageId: string; data: ReplyToMessageData }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, data }) => replyToMessage(messageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.messages(),
      });
      queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.messageStats(),
      });
    },
    ...options,
  });
};

export const useMarkMessageAsRead = (
  options?: UseMutationOptions<
    { success: boolean; message: string; data?: any },
    Error,
    string
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markMessageAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.messages(),
      });
      queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.messageStats(),
      });
    },
    ...options,
  });
};

export const useMarkMessageAsResolved = (
  options?: UseMutationOptions<
    { success: boolean; message: string; data?: any },
    Error,
    string
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markMessageAsResolved,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.messages(),
      });
      queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.messageStats(),
      });
    },
    ...options,
  });
};

// Earnings Hooks
export const useInstructorEarnings = (
  options?: Omit<
    UseQueryOptions<InstructorEarningsResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: instructorQueryKeys.earnings(),
    queryFn: getInstructorEarnings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403)
        return false;
      return failureCount < 3;
    },
    ...options,
  });
};

export const useInstructorEarningsByCourse = (
  courseId?: string,
  options?: Omit<
    UseQueryOptions<InstructorEarningsByCourseResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: instructorQueryKeys.earningsByCourse(courseId),
    queryFn: () => getInstructorEarningsByCourse(courseId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403)
        return false;
      return failureCount < 3;
    },
    ...options,
  });
};

export const useUpdatePayoutStatus = (
  options?: UseMutationOptions<
    { success: boolean; message: string; data?: any },
    Error,
    UpdatePayoutStatusData
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePayoutStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.earnings(),
      });
    },
    ...options,
  });
};

// Section Management Hooks
export const useSectionsByCourse = (
  courseId: string,
  options?: Omit<
    UseQueryOptions<{ success: boolean; data: any[] }, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: instructorQueryKeys.sectionsByCourse(courseId),
    queryFn: () => getSectionsByCourse(courseId),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!courseId,
    ...options,
  });
};

export const useSectionsWithCount = (
  courseId: string,
  options?: Omit<
    UseQueryOptions<{ success: boolean; data: any[] }, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: [...instructorQueryKeys.sectionsByCourse(courseId), "with-count"],
    queryFn: () => getSectionsWithCount(courseId),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!courseId,
    ...options,
  });
};

export const useCreateSection = (
  options?: UseMutationOptions<
    { success: boolean; message: string; data?: any },
    Error,
    CreateSectionData
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSection,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.sectionsByCourse(variables.course),
      });
      queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.coursesWithStats({}),
      });
    },
    ...options,
  });
};

export const useUpdateSection = (
  options?: UseMutationOptions<
    { success: boolean; message: string; data?: any },
    Error,
    { sectionId: string; updateData: UpdateSectionData }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sectionId, updateData }) =>
      updateSection(sectionId, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.sections(),
      });
    },
    ...options,
  });
};

export const useDeleteSection = (
  options?: UseMutationOptions<
    { success: boolean; message: string },
    Error,
    string
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSection,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.sections(),
      });
      queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.coursesWithStats({}),
      });
    },
    ...options,
  });
};

// Lesson Management Hooks
export const useLessonsBySection = (
  sectionId: string,
  options?: Omit<
    UseQueryOptions<{ success: boolean; data: any[] }, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: instructorQueryKeys.lessonsBySection(sectionId),
    queryFn: () => getLessonsBySection(sectionId),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!sectionId,
    ...options,
  });
};

export const useLesson = (
  lessonId: string,
  options?: Omit<
    UseQueryOptions<{ success: boolean; data: any }, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: instructorQueryKeys.lesson(lessonId),
    queryFn: () => getLessonById(lessonId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!lessonId,
    ...options,
  });
};

export const useCreateLesson = (
  options?: UseMutationOptions<
    { success: boolean; message: string; data?: any },
    Error,
    CreateLessonData
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLesson,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.lessonsBySection(variables.section),
      });
      queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.sectionsByCourse(variables.course),
      });
      queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.coursesWithStats({}),
      });
    },
    ...options,
  });
};

export const useUpdateLesson = (
  options?: UseMutationOptions<
    { success: boolean; message: string; data?: any },
    Error,
    { courseId: string; lessonId: string; updateData: UpdateLessonData }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, lessonId, updateData }) =>
      updateLesson(courseId, lessonId, updateData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.lesson(variables.lessonId),
      });
      queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.lessons(),
      });
    },
    ...options,
  });
};

export const useDeleteLesson = (
  options?: UseMutationOptions<
    { success: boolean; message: string },
    Error,
    { courseId: string; lessonId: string }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, lessonId }) => deleteLesson(courseId, lessonId),
    onSuccess: (_, variables) => {
      queryClient.removeQueries({
        queryKey: instructorQueryKeys.lesson(variables.lessonId),
      });
      queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.lessons(),
      });
      queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.sections(),
      });
    },
    ...options,
  });
};

export const useLessonNotes = (
  courseId: string,
  sectionId: string,
  lessonId: string,
  options?: Omit<
    UseQueryOptions<{ success: boolean; data: any[] }, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: instructorQueryKeys.lessonNotes(courseId, sectionId, lessonId),
    queryFn: () => getUserNotesForLesson(courseId, sectionId, lessonId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!(courseId && sectionId && lessonId),
    ...options,
  });
};

export const useAddNoteToLesson = (
  options?: UseMutationOptions<
    { success: boolean; message: string; data?: any },
    Error,
    {
      courseId: string;
      sectionId: string;
      lessonId: string;
      noteData: { content: string; timestamp?: number };
    }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, sectionId, lessonId, noteData }) =>
      addNoteToLesson(courseId, sectionId, lessonId, noteData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.lessonNotes(
          variables.courseId,
          variables.sectionId,
          variables.lessonId
        ),
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
    mutationFn: (courseId: string) => deleteCourse(courseId),
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
        queryKey: instructorQueryKeys.overview(),
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
    mutationFn: (courseId: string) => toggleCourseStatus(courseId),
    onSuccess: () => {
      // Remove all instructor course-related cache entries immediately
      queryClient.removeQueries({
        predicate: (query) => {
          return (
            query.queryKey[0] === "instructor" &&
            query.queryKey[1] === "courses"
          );
        },
      });

      // Force refetch all instructor course queries
      queryClient.refetchQueries({
        predicate: (query) => {
          return (
            query.queryKey[0] === "instructor" &&
            query.queryKey[1] === "courses"
          );
        },
      });

      queryClient.invalidateQueries({
        queryKey: instructorQueryKeys.overview(),
      });
    },
    ...options,
  });
};

// Infinite Query for Messages (for real-time updates)
export const useInfiniteInstructorMessages = (
  baseParams: Omit<InstructorMessagesQuery, "page"> = {},
  options?: any
) => {
  return useInfiniteQuery({
    queryKey: [...instructorQueryKeys.messages(), "infinite", baseParams],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getInstructorMessages({ ...baseParams, page: pageParam }),
    getNextPageParam: (lastPage: InstructorMessagesResponse) => {
      const { pagination } = lastPage.data;
      return pagination.hasNext ? pagination.currentPage + 1 : undefined;
    },
    getPreviousPageParam: (firstPage: InstructorMessagesResponse) => {
      const { pagination } = firstPage.data;
      return pagination.hasPrev ? pagination.currentPage - 1 : undefined;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    initialPageParam: 1,
    ...options,
  });
};

export const usePrefetchInstructor = () => {
  const queryClient = useQueryClient();

  const prefetchOverview = () => {
    queryClient.prefetchQuery({
      queryKey: instructorQueryKeys.overview(),
      queryFn: getInstructorOverview,
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchCourses = (params: InstructorCoursesQuery = {}) => {
    queryClient.prefetchQuery({
      queryKey: instructorQueryKeys.coursesWithStats(params),
      queryFn: () => getInstructorCoursesWithStats(params),
      staleTime: 3 * 60 * 1000,
    });
  };

  const prefetchMessages = (params: InstructorMessagesQuery = {}) => {
    queryClient.prefetchQuery({
      queryKey: instructorQueryKeys.messagesList(params),
      queryFn: () => getInstructorMessages(params),
      staleTime: 1 * 60 * 1000,
    });
  };

  const prefetchEarnings = () => {
    queryClient.prefetchQuery({
      queryKey: instructorQueryKeys.earnings(),
      queryFn: getInstructorEarnings,
      staleTime: 5 * 60 * 1000,
    });
  };

  return {
    prefetchOverview,
    prefetchCourses,
    prefetchMessages,
    prefetchEarnings,
  };
};

export const useInvalidateInstructor = () => {
  const queryClient = useQueryClient();

  const invalidateOverview = () => {
    queryClient.invalidateQueries({
      queryKey: instructorQueryKeys.overview(),
    });
  };

  const invalidateCourses = () => {
    queryClient.invalidateQueries({
      queryKey: instructorQueryKeys.courses(),
    });
  };

  const invalidateMessages = () => {
    queryClient.invalidateQueries({
      queryKey: instructorQueryKeys.messages(),
    });
  };

  const invalidateEarnings = () => {
    queryClient.invalidateQueries({
      queryKey: instructorQueryKeys.earnings(),
    });
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: instructorQueryKeys.all,
    });
  };

  return {
    invalidateOverview,
    invalidateCourses,
    invalidateMessages,
    invalidateEarnings,
    invalidateAll,
  };
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  InstructorCoursesQuery,
  InstructorMessagesQuery,
} from "../types/instructor.type";
import { useCallback, useState } from "react";
import { useSnackbar } from "notistack";

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

// // Dashboard & Overview Hooks
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

// // Course Management Hooks
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

// // Communication Hooks
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

// // Analytics Helper Hook
export const useInstructorAnalytics = () => {
  const [selectedDateRange, setSelectedDateRange] = useState<{
    start: Date;
    end: Date;
  }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
  });

  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }, []);

  const formatPercentage = useCallback((value: number) => {
    return `${value.toFixed(1)}%`;
  }, []);

  const calculateGrowthRate = useCallback(
    (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    },
    []
  );

  const formatDuration = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }, []);

  return {
    selectedDateRange,
    setSelectedDateRange,
    selectedCourse,
    setSelectedCourse,
    formatCurrency,
    formatPercentage,
    calculateGrowthRate,
    formatDuration,
  };
};

// Message Management Helper Hook
export const useInstructorMessaging = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [processingMessages, setProcessingMessages] = useState<Set<string>>(
    new Set()
  );

  const replyMutation = useReplyToMessage({
    onMutate: (variables) => {
      setProcessingMessages((prev) => new Set(prev).add(variables.messageId));
    },
    onSuccess: () => {
      enqueueSnackbar("Reply sent successfully!", { variant: "success" });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to send reply";
      enqueueSnackbar(message, { variant: "error" });
    },
    onSettled: (_, __, variables) => {
      setProcessingMessages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(variables.messageId);
        return newSet;
      });
    },
  });

  const markAsReadMutation = useMarkMessageAsRead({
    onSuccess: () => {
      enqueueSnackbar("Message marked as read", { variant: "success" });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to mark as read";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const markAsResolvedMutation = useMarkMessageAsResolved({
    onSuccess: () => {
      enqueueSnackbar("Message resolved successfully", { variant: "success" });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to resolve message";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const handleReply = useCallback(
    (messageId: string, data: ReplyToMessageData) => {
      replyMutation.mutate({ messageId, data });
    },
    [replyMutation]
  );

  const handleMarkAsRead = useCallback(
    (messageId: string) => {
      markAsReadMutation.mutate(messageId);
    },
    [markAsReadMutation]
  );

  const handleMarkAsResolved = useCallback(
    (messageId: string) => {
      markAsResolvedMutation.mutate(messageId);
    },
    [markAsResolvedMutation]
  );

  const isProcessing = useCallback(
    (messageId: string) => processingMessages.has(messageId),
    [processingMessages]
  );

  return {
    handleReply,
    handleMarkAsRead,
    handleMarkAsResolved,
    isProcessing,
    isReplying: replyMutation.isPending,
    isMarkingRead: markAsReadMutation.isPending,
    isMarkingResolved: markAsResolvedMutation.isPending,
  };
};

// // Communication Mutations
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

// // Earnings Hooks
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

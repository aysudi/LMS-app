import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { announcementService } from "../services/announcement.service";
import type {
  UpdateAnnouncementData,
  GetAnnouncementsQuery,
  UseAnnouncementsReturn,
  UseAnnouncementMutationsReturn,
} from "../types/announcement.type";

// Query keys for caching
export const announcementKeys = {
  all: ["announcements"] as const,
  lists: () => [...announcementKeys.all, "list"] as const,
  list: (params: GetAnnouncementsQuery) =>
    [...announcementKeys.lists(), params] as const,
  details: () => [...announcementKeys.all, "detail"] as const,
  detail: (id: string) => [...announcementKeys.details(), id] as const,
  instructor: () => [...announcementKeys.all, "instructor"] as const,
  instructorList: (params: GetAnnouncementsQuery) =>
    [...announcementKeys.instructor(), "list", params] as const,
  instructorStats: () => [...announcementKeys.instructor(), "stats"] as const,
  course: (courseId: string) =>
    [...announcementKeys.all, "course", courseId] as const,
  courseList: (courseId: string, params: GetAnnouncementsQuery) =>
    [...announcementKeys.course(courseId), "list", params] as const,
};

// Hook to get all announcements with filtering and pagination
export const useAnnouncements = (
  params?: GetAnnouncementsQuery
): UseAnnouncementsReturn => {
  const { data, isLoading, error } = useQuery({
    queryKey: announcementKeys.list(params || {}),
    queryFn: () => announcementService.getAllAnnouncements(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    announcements: data?.data?.announcements || [],
    isLoading,
    error,
    pagination: {
      page: data?.data?.pagination?.currentPage || 1,
      limit: 10,
      total: data?.data?.pagination?.totalAnnouncements || 0,
      pages: data?.data?.pagination?.totalPages || 0,
    },
    hasNextPage: data?.data?.pagination?.hasNextPage || false,
    hasPreviousPage: data?.data?.pagination?.hasPreviousPage || false,
  };
};

// Hook to get announcements for a specific course
export const useAnnouncementsByCourse = (
  courseId: string,
  params?: GetAnnouncementsQuery
): UseAnnouncementsReturn => {
  const { data, isLoading, error } = useQuery({
    queryKey: announcementKeys.courseList(courseId, params || {}),
    queryFn: () =>
      announcementService.getAnnouncementsByCourse(courseId, params),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    announcements: data?.data?.announcements || [],
    isLoading,
    error,
    pagination: {
      page: data?.data?.pagination?.currentPage || 1,
      limit: 10,
      total: data?.data?.pagination?.totalAnnouncements || 0,
      pages: data?.data?.pagination?.totalPages || 0,
    },
    hasNextPage: data?.data?.pagination?.hasNextPage || false,
    hasPreviousPage: data?.data?.pagination?.hasPreviousPage || false,
  };
};

// Hook to get instructor's announcements
export const useInstructorAnnouncements = (
  params?: GetAnnouncementsQuery
): UseAnnouncementsReturn => {
  const { data, isLoading, error } = useQuery({
    queryKey: announcementKeys.instructorList(params || {}),
    queryFn: () => announcementService.getAnnouncementsByInstructor(params),
    staleTime: 2 * 60 * 1000, // 2 minutes for instructor data
  });

  return {
    announcements: data?.data?.announcements || [],
    isLoading,
    error,
    pagination: {
      page: data?.data?.pagination?.currentPage || 1,
      limit: 10,
      total: data?.data?.pagination?.totalAnnouncements || 0,
      pages: data?.data?.pagination?.totalPages || 0,
    },
    hasNextPage: data?.data?.pagination?.hasNextPage || false,
    hasPreviousPage: data?.data?.pagination?.hasPreviousPage || false,
  };
};

// Hook to get single announcement
export const useAnnouncement = (id: string) => {
  return useQuery({
    queryKey: announcementKeys.detail(id),
    queryFn: () => announcementService.getAnnouncementById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to get announcement statistics
export const useAnnouncementStats = (courseId?: string) => {
  return useQuery({
    queryKey: courseId
      ? [...announcementKeys.instructorStats(), courseId]
      : announcementKeys.instructorStats(),
    queryFn: () => announcementService.getAnnouncementStats(courseId),
    staleTime: 10 * 60 * 1000, // 10 minutes for stats
  });
};

// Hook for announcement mutations
export const useAnnouncementMutations = (): UseAnnouncementMutationsReturn => {
  const queryClient = useQueryClient();

  const createAnnouncement = useMutation({
    mutationFn: announcementService.createAnnouncement,
    onSuccess: (data) => {
      toast.success("Announcement created successfully");

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: announcementKeys.instructor(),
      });
      queryClient.invalidateQueries({
        queryKey: announcementKeys.instructorStats(),
      });

      // If published, invalidate course announcements
      if (data.data.isPublished) {
        queryClient.invalidateQueries({
          queryKey: announcementKeys.course(data.data.course._id),
        });
      }
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create announcement"
      );
    },
  });

  const updateAnnouncement = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAnnouncementData }) =>
      announcementService.updateAnnouncement(id, data),
    onSuccess: (data) => {
      toast.success("Announcement updated successfully");

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: announcementKeys.detail(data.data._id),
      });
      queryClient.invalidateQueries({
        queryKey: announcementKeys.instructor(),
      });
      queryClient.invalidateQueries({
        queryKey: announcementKeys.instructorStats(),
      });
      queryClient.invalidateQueries({
        queryKey: announcementKeys.course(data.data.course._id),
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update announcement"
      );
    },
  });

  const deleteAnnouncement = useMutation({
    mutationFn: announcementService.deleteAnnouncement,
    onSuccess: () => {
      toast.success("Announcement deleted successfully");

      // Invalidate all announcement-related queries
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to delete announcement"
      );
    },
  });

  const markAsRead = useMutation({
    mutationFn: announcementService.markAnnouncementAsRead,
    onSuccess: () => {
      // Silently invalidate queries - no toast for read status
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
    },
    onError: (error: any) => {
      console.error("Failed to mark announcement as read:", error);
    },
  });

  return {
    createAnnouncement: {
      mutate: createAnnouncement.mutate,
      isLoading: createAnnouncement.isPending,
      error: createAnnouncement.error,
    },
    updateAnnouncement: {
      mutate: updateAnnouncement.mutate,
      isLoading: updateAnnouncement.isPending,
      error: updateAnnouncement.error,
    },
    deleteAnnouncement: {
      mutate: deleteAnnouncement.mutate,
      isLoading: deleteAnnouncement.isPending,
      error: deleteAnnouncement.error,
    },
    markAsRead: {
      mutate: markAsRead.mutate,
      isLoading: markAsRead.isPending,
      error: markAsRead.error,
    },
  };
};

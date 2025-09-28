import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import enrollmentService from "../services/enrollment.service";
import type {
  AddNoteRequest,
  AddReviewRequest,
  UpdateProgressRequest,
} from "../types/enrollment.type";

// Hook for getting user enrollments
export const useUserEnrollments = (
  params: {
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  } = {}
) => {
  return useQuery({
    queryKey: ["enrollments", params],
    queryFn: () => enrollmentService.getUserEnrollments(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for getting specific enrollment
export const useEnrollment = (enrollmentId: string) => {
  return useQuery({
    queryKey: ["enrollment", enrollmentId],
    queryFn: () => enrollmentService.getEnrollmentById(enrollmentId),
    enabled: !!enrollmentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for updating enrollment progress
export const useUpdateEnrollmentProgress = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({
      enrollmentId,
      progressData,
    }: {
      enrollmentId: string;
      progressData: UpdateProgressRequest;
    }) =>
      enrollmentService.updateEnrollmentProgress(enrollmentId, progressData),

    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({
        queryKey: ["enrollment", variables.enrollmentId],
      });
      queryClient.invalidateQueries({ queryKey: ["learning-stats"] });
      queryClient.invalidateQueries({ queryKey: ["user-progress"] });

      if (data.data?.isCompleted) {
        enqueueSnackbar("🎉 Congratulations! You completed the course!", {
          variant: "success",
          autoHideDuration: 5000,
        });
      } else if (variables.progressData.completed) {
        enqueueSnackbar("Lesson completed!", {
          variant: "success",
          autoHideDuration: 3000,
        });
      }
    },

    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to update progress";
      enqueueSnackbar(message, { variant: "error" });
    },
  });
};

// Hook for adding enrollment notes
export const useAddEnrollmentNote = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({
      enrollmentId,
      noteData,
    }: {
      enrollmentId: string;
      noteData: AddNoteRequest;
    }) => enrollmentService.addEnrollmentNote(enrollmentId, noteData),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["enrollment", variables.enrollmentId],
      });
      enqueueSnackbar("Note added successfully", { variant: "success" });
    },

    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to add note";
      enqueueSnackbar(message, { variant: "error" });
    },
  });
};

// Hook for toggling lesson bookmarks
export const useToggleLessonBookmark = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({
      enrollmentId,
      lessonId,
    }: {
      enrollmentId: string;
      lessonId: string;
    }) => enrollmentService.toggleLessonBookmark(enrollmentId, lessonId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["enrollment", variables.enrollmentId],
      });
      enqueueSnackbar("Bookmark toggled", { variant: "success" });
    },

    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to toggle bookmark";
      enqueueSnackbar(message, { variant: "error" });
    },
  });
};

// Hook for adding course reviews
export const useAddCourseReview = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({
      enrollmentId,
      reviewData,
    }: {
      enrollmentId: string;
      reviewData: AddReviewRequest;
    }) => enrollmentService.addCourseReview(enrollmentId, reviewData),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["enrollment", variables.enrollmentId],
      });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      enqueueSnackbar("Review added successfully!", { variant: "success" });
    },

    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to add review";
      enqueueSnackbar(message, { variant: "error" });
    },
  });
};

// Hook for getting learning statistics
export const useLearningStats = () => {
  return useQuery({
    queryKey: ["learning-stats"],
    queryFn: () => enrollmentService.getLearningStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

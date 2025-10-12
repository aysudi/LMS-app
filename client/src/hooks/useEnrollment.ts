import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import enrollmentService from "../services/enrollment.service";
import type {
  AddNoteRequest,
  AddReviewRequest,
  UpdateProgressRequest,
} from "../types/enrollment.type";
import { useToast } from "../components/UI/ToastProvider";
import { courseToasts, generalToasts, lessonToasts } from "../utils/toastUtils";

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
    queryFn: () => {
      return enrollmentService.getUserEnrollments(params);
    },
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
  const { showToast } = useToast();

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
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({
        queryKey: ["enrollment", variables.enrollmentId],
      });
      queryClient.invalidateQueries({ queryKey: ["learning-stats"] });
      queryClient.invalidateQueries({ queryKey: ["user-progress"] });

      if (data.data?.isCompleted) {
        showToast(courseToasts.completed());
      } else if (variables.progressData.completed) {
        showToast(lessonToasts.completed());
      }
    },

    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to update progress";
      showToast(generalToasts.error("Failed to update progress", message));
    },
  });
};

// Hook for adding enrollment notes
export const useAddEnrollmentNote = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

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
      queryClient.invalidateQueries({
        queryKey: ["enrollment-notes", variables.enrollmentId],
      });
      showToast(
        generalToasts.success("Congratulations!", "Note added successfully")
      );
    },

    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to add note";
      showToast(generalToasts.error("Failed to add note", message));
    },
  });
};

// Hook for toggling lesson bookmarks
export const useToggleLessonBookmark = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

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
      showToast(generalToasts.success("Congratulations!", "Bookmark toggled"));
    },

    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to toggle bookmark";
      showToast(generalToasts.error("Failed to toggle bookmark", message));
    },
  });
};

// Hook for adding course reviews
export const useAddCourseReview = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({
      enrollmentId,
      reviewData,
    }: {
      enrollmentId: string;
      reviewData: AddReviewRequest;
    }) => enrollmentService.addCourseReview(enrollmentId, reviewData),

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["enrollment", variables.enrollmentId],
      });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });

      if (data?.data?.course) {
        const courseId =
          typeof data.data.course === "string"
            ? data.data.course
            : data.data.course._id;
        queryClient.invalidateQueries({
          queryKey: ["courses", "detail", courseId],
        });
        queryClient.invalidateQueries({
          queryKey: ["courses"],
        });
      }

      showToast(
        generalToasts.success("Congratulations!", "Review added successfully!")
      );
    },

    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to add review";
      showToast(generalToasts.error("Failed to add review", message));
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

// Hook for getting enrollment notes
export const useEnrollmentNotes = (enrollmentId: string, lessonId?: string) => {
  return useQuery({
    queryKey: ["enrollment-notes", enrollmentId, lessonId],
    queryFn: () => enrollmentService.getEnrollmentNotes(enrollmentId, lessonId),
    enabled: !!enrollmentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for getting enrollment reviews
export const useEnrollmentReviews = (enrollmentId: string) => {
  return useQuery({
    queryKey: ["enrollment-reviews", enrollmentId],
    queryFn: () => enrollmentService.getEnrollmentReviews(enrollmentId),
    enabled: !!enrollmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for enrolling in a free course
export const useEnrollInFreeCourse = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (courseId: string) =>
      enrollmentService.enrollInFreeCourse(courseId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({
        queryKey: ["courses", "user", "enrolled"],
      });
      queryClient.invalidateQueries({ queryKey: ["learning-stats"] });

      showToast(
        generalToasts.success(
          "Congratulations!",
          "Enrolled in course successfully"
        )
      );
    },

    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to enroll in course";
      showToast(generalToasts.error("Failed to enroll in course", message));
    },
  });
};

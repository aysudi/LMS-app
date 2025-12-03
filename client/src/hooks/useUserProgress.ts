import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import userProgressService from "../services/userProgress.service";
import type { UpdateUserProgressRequest } from "../types/user-progress.type";
import { useToast } from "../components/UI/ToastProvider";
import { generalToasts } from "../utils/toastUtils";

// Hook for getting user progress
export const useUserProgress = (courseId?: string) => {
  return useQuery({
    queryKey: ["user-progress", courseId],
    queryFn: () => userProgressService.getUserProgress(courseId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for getting course progress
export const useCourseProgress = (courseId: string) => {
  return useQuery({
    queryKey: ["course-progress", courseId],
    queryFn: () => userProgressService.getCourseProgress(courseId),
    enabled: !!courseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for updating lesson progress
export const useUpdateLessonProgress = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({
      courseId,
      progressData,
    }: {
      courseId: string;
      progressData: UpdateUserProgressRequest;
    }) => userProgressService.updateLessonProgress(courseId, progressData),

    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["user-progress"] });
      queryClient.invalidateQueries({
        queryKey: ["course-progress", variables.courseId],
      });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["learning-stats"] });
      queryClient.invalidateQueries({ queryKey: ["learning-analytics"] });

      if (data.data?.enrollmentProgress.isCompleted) {
        showToast(
          generalToasts.success(
            "🎉 Course completed!",
            "Certificate available!"
          )
        );
      } else if (variables.progressData.completed) {
        showToast(generalToasts.success("Lesson completed!", ""));
      }
    },

    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to update progress";

      showToast(generalToasts.error("Fail", message));
    },
  });
};

// Hook for getting learning analytics
export const useLearningAnalytics = () => {
  return useQuery({
    queryKey: ["learning-analytics"],
    queryFn: () => userProgressService.getLearningAnalytics(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Hook for completing lesson progress (POST, only once)
export const useCompleteLessonProgress = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({
      courseId,
      progressData,
    }: {
      courseId: string;
      progressData: UpdateUserProgressRequest;
    }) => userProgressService.completeLessonProgress(courseId, progressData),

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-progress"] });
      queryClient.invalidateQueries({
        queryKey: ["course-progress", variables.courseId],
      });
      if (data.success) {
        showToast(generalToasts.success("Lesson completed!", ""));
      }
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to complete lesson";
      showToast(generalToasts.error("Fail", message));
    },
  });
};

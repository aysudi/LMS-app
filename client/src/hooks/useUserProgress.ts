import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import userProgressService from "../services/userProgress.service";
import type { UpdateUserProgressRequest } from "../services/userProgress.service";

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
  const { enqueueSnackbar } = useSnackbar();

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
        enqueueSnackbar("🎉 Course completed! Certificate available!", {
          variant: "success",
          autoHideDuration: 5000,
        });
      } else if (variables.progressData.completed) {
        enqueueSnackbar("Lesson completed!", { variant: "success" });
      }
    },

    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to update progress";
      enqueueSnackbar(message, { variant: "error" });
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

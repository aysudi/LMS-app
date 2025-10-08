import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationOptions } from "@tanstack/react-query";
import type { Lesson } from "../types/course.type";
import * as lessonService from "../services/lesson.service";
import { courseQueryKeys } from "./useCourseQueries";

// Lesson mutation response types
interface LessonResponse {
  success: boolean;
  data: Lesson;
  message?: string;
}

// Lesson create mutation hook
export const useCreateLesson = (
  courseId: string,
  sectionId: string,
  options?: UseMutationOptions<LessonResponse, Error, Lesson>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonData: Lesson) =>
      lessonService.createLesson(courseId, sectionId, lessonData),
    onSuccess: () => {
      // Invalidate course details to include new lesson
      queryClient.invalidateQueries({
        queryKey: courseQueryKeys.detail(courseId),
      });

      // Invalidate lessons query
      queryClient.invalidateQueries({
        queryKey: ["lessons", sectionId],
      });
    },
    ...options,
  });
};

// Lesson update mutation hook
export const useUpdateLesson = (
  courseId: string,
  sectionId: string,
  options?: UseMutationOptions<
    LessonResponse,
    Error,
    { lessonId: string; updateData: Partial<Lesson> }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, updateData }) =>
      lessonService.updateLesson(courseId, sectionId, lessonId, updateData),
    onSuccess: (data, { lessonId }) => {
      // Update course details to reflect lesson changes immediately
      queryClient.setQueryData(
        courseQueryKeys.detail(courseId),
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              sections: oldData.data.sections.map((section: any) =>
                section._id === sectionId
                  ? {
                      ...section,
                      lessons: section.lessons.map((lesson: any) =>
                        lesson._id === lessonId || lesson.id === lessonId
                          ? { ...lesson, ...data.data }
                          : lesson
                      ),
                    }
                  : section
              ),
            },
          };
        }
      );

      // Force invalidation for immediate UI updates
      queryClient.invalidateQueries({
        queryKey: courseQueryKeys.detail(courseId),
      });

      // Invalidate lessons query
      queryClient.invalidateQueries({
        queryKey: ["lessons", sectionId],
      });
    },
    ...options,
  });
};

// Lesson delete mutation hook
export const useDeleteLesson = (
  courseId: string,
  sectionId: string,
  options?: UseMutationOptions<
    { success: boolean; message: string },
    Error,
    string
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string) =>
      lessonService.deleteLesson(courseId, sectionId, lessonId),
    onSuccess: () => {
      // Invalidate course details to remove deleted lesson
      queryClient.invalidateQueries({
        queryKey: courseQueryKeys.detail(courseId),
      });

      // Invalidate lessons query
      queryClient.invalidateQueries({
        queryKey: ["lessons", sectionId],
      });

      // Also invalidate all sections for this course
      queryClient.invalidateQueries({
        queryKey: ["sections", courseId],
      });
    },
    ...options,
  });
};

// Combined hook for lesson operations
export const useLessonOperations = (courseId: string, sectionId: string) => {
  const createMutation = useCreateLesson(courseId, sectionId);
  const updateMutation = useUpdateLesson(courseId, sectionId);
  const deleteMutation = useDeleteLesson(courseId, sectionId);

  return {
    createLesson: createMutation.mutate,
    updateLesson: updateMutation.mutate,
    deleteLesson: deleteMutation.mutate,
    isLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
    error: createMutation.error || updateMutation.error || deleteMutation.error,
    isSuccess:
      createMutation.isSuccess ||
      updateMutation.isSuccess ||
      deleteMutation.isSuccess,
  };
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationOptions } from "@tanstack/react-query";
import type { Lesson } from "../types/course.type";
import * as lessonService from "../services/lesson.service";
import { courseQueryKeys } from "./useCourseQueries";

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
      queryClient.invalidateQueries({
        queryKey: courseQueryKeys.detail(courseId),
      });

      queryClient.invalidateQueries({
        queryKey: ["lessons", sectionId],
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

      queryClient.invalidateQueries({
        queryKey: courseQueryKeys.detail(courseId),
      });

      queryClient.invalidateQueries({
        queryKey: ["lessons", sectionId],
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
      queryClient.invalidateQueries({
        queryKey: courseQueryKeys.detail(courseId),
      });

      queryClient.invalidateQueries({
        queryKey: ["lessons", sectionId],
      });

      queryClient.invalidateQueries({
        queryKey: ["sections", courseId],
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

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationOptions } from "@tanstack/react-query";
import type { Section } from "../types/course.type";
import * as sectionService from "../services/section.service";
import { courseQueryKeys } from "./useCourseHooks";

interface SectionResponse {
  success: boolean;
  data: Section;
  message?: string;
}

// Section create mutation hook
export const useCreateSection = (
  courseId: string,
  options?: UseMutationOptions<
    SectionResponse,
    Error,
    FormData | Partial<Section>
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sectionData: Partial<Section>) =>
      sectionService.createSection(courseId, sectionData),
    onSuccess: (data) => {
      queryClient.setQueryData(
        courseQueryKeys.detail(courseId),
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              sections: [...(oldData.data.sections || []), data.data],
            },
          };
        }
      );

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

// Section update mutation hook
export const useUpdateSection = (
  courseId: string,
  options?: UseMutationOptions<
    SectionResponse,
    Error,
    { sectionId: string; updateData: Partial<Section> }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sectionId, updateData }) =>
      sectionService.updateSection(courseId, sectionId, updateData),
    onSuccess: (data, { sectionId }) => {
      queryClient.setQueryData(
        courseQueryKeys.detail(courseId),
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              sections: oldData.data.sections.map((section: Section) =>
                section._id === sectionId || section.id === sectionId
                  ? { ...section, ...data.data }
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

// Section delete mutation hook
export const useDeleteSection = (
  courseId: string,
  options?: UseMutationOptions<
    { success: boolean; message: string },
    Error,
    string
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sectionId) =>
      sectionService.deleteSection(courseId, sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: courseQueryKeys.detail(courseId),
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

// Combined hook for section operations
export const useSectionOperations = (courseId: string) => {
  const createMutation = useCreateSection(courseId);
  const updateMutation = useUpdateSection(courseId);
  const deleteMutation = useDeleteSection(courseId);

  return {
    createSection: createMutation.mutate,
    updateSection: updateMutation.mutate,
    deleteSection: deleteMutation.mutate,
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

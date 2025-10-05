import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import * as sectionService from "../services/section.service";
import type { Section } from "../types/course.type";

// Query keys
export const sectionKeys = {
  all: ["sections"] as const,
  lists: () => [...sectionKeys.all, "list"] as const,
  list: (filters: string) => [...sectionKeys.lists(), { filters }] as const,
  details: () => [...sectionKeys.all, "detail"] as const,
  detail: (id: string) => [...sectionKeys.details(), id] as const,
};

// Get sections by course
export const useSectionsByCourse = (courseId: string) => {
  return useQuery({
    queryKey: sectionKeys.list(courseId),
    queryFn: () => sectionService.getSectionsByCourse(courseId),
  });
};

// Get section by ID
export const useSection = (sectionId: string) => {
  return useQuery({
    queryKey: sectionKeys.detail(sectionId),
    queryFn: () => sectionService.getSectionById(sectionId),
  });
};

// Create section
export const useCreateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      sectionData,
    }: {
      courseId: string;
      sectionData: Partial<Section>;
    }) => sectionService.createSection(courseId, sectionData),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.list(courseId) });
      toast.success("Section created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create section: " + error.message);
    },
  });
};

// Update section
export const useUpdateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      sectionId,
      updateData,
    }: {
      courseId: string;
      sectionId: string;
      updateData: Partial<Section>;
    }) => sectionService.updateSection(courseId, sectionId, updateData),
    onSuccess: (_, { courseId, sectionId }) => {
      queryClient.invalidateQueries({
        queryKey: sectionKeys.detail(sectionId),
      });
      queryClient.invalidateQueries({ queryKey: sectionKeys.list(courseId) });
      toast.success("Section updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update section: " + error.message);
    },
  });
};

// Delete section
export const useDeleteSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      sectionId,
    }: {
      courseId: string;
      sectionId: string;
    }) => sectionService.deleteSection(courseId, sectionId),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sectionKeys.list(courseId) });
      toast.success("Section deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete section: " + error.message);
    },
  });
};

// Get sections with count
export const useSectionsWithCount = (courseId: string) => {
  return useQuery({
    queryKey: [...sectionKeys.list(courseId), "count"],
    queryFn: () => sectionService.getSectionsWithCount(courseId),
  });
};

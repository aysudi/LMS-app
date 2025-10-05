import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as lessonService from "../services/lesson.service";
import { toast } from "react-toastify";
import type { Lesson } from "../types/course.type";
// import type { Lesson } from "../types/course.type";

// Query keys
export const lessonKeys = {
  all: ["lessons"] as const,
  lists: () => [...lessonKeys.all, "list"] as const,
  list: (filters: string) => [...lessonKeys.lists(), { filters }] as const,
  details: () => [...lessonKeys.all, "detail"] as const,
  detail: (id: string) => [...lessonKeys.details(), id] as const,
  notes: (lessonId: string) =>
    [...lessonKeys.detail(lessonId), "notes"] as const,
};

// Get lessons by section
export const useLessonsBySection = (sectionId: string) => {
  return useQuery({
    queryKey: lessonKeys.list(sectionId),
    queryFn: () => lessonService.getLessonsBySection(sectionId),
  });
};

// Get lesson by ID
export const useLesson = (lessonId: string) => {
  return useQuery({
    queryKey: lessonKeys.detail(lessonId),
    queryFn: () => lessonService.getLessonById(lessonId),
  });
};

// Create lesson
export const useCreateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      sectionId,
      lessonData,
    }: {
      courseId: string;
      sectionId: string;
      lessonData: Lesson;
    }) => lessonService.createLesson(courseId, sectionId, lessonData),
    onSuccess: (_, { sectionId }) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.list(sectionId) });
      toast.success("Lesson created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create lesson: " + error.message);
    },
  });
};

// Update lesson
export const useUpdateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      sectionId,
      lessonId,
      updateData,
    }: {
      courseId: string;
      sectionId: string;
      lessonId: string;
      updateData: Lesson;
    }) => lessonService.updateLesson(courseId, sectionId, lessonId, updateData),
    onSuccess: (_, { sectionId, lessonId }) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.detail(lessonId) });
      queryClient.invalidateQueries({ queryKey: lessonKeys.list(sectionId) });
      toast.success("Lesson updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update lesson: " + error.message);
    },
  });
};

// Delete lesson
export const useDeleteLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      sectionId,
      lessonId,
    }: {
      courseId: string;
      sectionId: string;
      lessonId: string;
    }) => lessonService.deleteLesson(courseId, sectionId, lessonId),
    onSuccess: (_, { sectionId }) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.lists() });
      queryClient.invalidateQueries({ queryKey: lessonKeys.list(sectionId) });
      toast.success("Lesson deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete lesson: " + error.message);
    },
  });
};

// Add note to lesson
export const useAddNoteToLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      sectionId,
      lessonId,
      noteData,
    }: {
      courseId: string;
      sectionId: string;
      lessonId: string;
      noteData: { content: string; timestamp: number };
    }) =>
      lessonService.addNoteToLesson(courseId, sectionId, lessonId, noteData),
    onSuccess: (_, { lessonId }) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.notes(lessonId) });
      toast.success("Note added successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to add note: " + error.message);
    },
  });
};

// Get lesson notes
export const useLessonNotes = (
  courseId: string,
  sectionId: string,
  lessonId: string
) => {
  return useQuery({
    queryKey: lessonKeys.notes(lessonId),
    queryFn: () =>
      lessonService.getUserNotesForLesson(courseId, sectionId, lessonId),
  });
};

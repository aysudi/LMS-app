import type { Lesson } from "../types/course.type";
import { api } from "./api";

interface LessonResponse {
  success: boolean;
  data: Lesson;
  message?: string;
}

interface LessonListResponse {
  success: boolean;
  data: Lesson[];
}

interface NoteResponse {
  success: boolean;
  data: {
    id: string;
    content: string;
    timestamp: number;
    userId: string;
    createdAt: string;
  };
}

// Get all lessons in a section
export const getLessonsBySection = async (
  sectionId: string
): Promise<LessonListResponse> => {
  const response = await api.get(`/api/sections/${sectionId}/lessons`);
  return response.data;
};

// Get lesson by ID
export const getLessonById = async (
  lessonId: string
): Promise<LessonResponse> => {
  const response = await api.get(`/api/lessons/${lessonId}`);
  return response.data;
};

// Create new lesson
export const createLesson = async (
  courseId: string,
  sectionId: string,
  lessonData: Lesson
): Promise<LessonResponse> => {
  let config = {};
  const formData = new FormData();

  // Handle video file if present
  if (lessonData.video?.file instanceof File) {
    formData.append("video", lessonData.video.file);
    delete lessonData.video.file;
  }

  // Handle resource files if present
  if (lessonData.resources?.length) {
    lessonData.resources.forEach((resource: any) => {
      if (resource.file instanceof File) {
        formData.append("resources", resource.file);
        delete resource.file;
      }
    });
  }

  // Add remaining lesson data
  formData.append("data", JSON.stringify(lessonData));

  config = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };

  const response = await api.post(
    `/api/courses/${courseId}/sections/${sectionId}/lessons`,
    formData,
    config
  );
  return response.data;
};

// Update lesson
export const updateLesson = async (
  courseId: string,
  sectionId: string,
  lessonId: string,
  updateData: Partial<Lesson>
): Promise<LessonResponse> => {
  let config = {};

  // If there are files to upload, use FormData
  if (updateData.video?.file || updateData.resources?.some((r) => r.file)) {
    const formData = new FormData();

    if (updateData.video?.file instanceof File) {
      formData.append("video", updateData.video.file);
      delete updateData.video.file;
    }

    if (updateData.resources?.length) {
      updateData.resources.forEach((resource: any) => {
        if (resource.file instanceof File) {
          formData.append("resources", resource.file);
          delete resource.file;
        }
      });
    }

    formData.append("data", JSON.stringify(updateData));

    config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    const response = await api.put(
      `/api/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
      formData,
      config
    );
    return response.data;
  }

  // Regular JSON update if no files
  const response = await api.put(
    `/api/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
    updateData
  );
  return response.data;
};

// Delete lesson
export const deleteLesson = async (
  courseId: string,
  sectionId: string,
  lessonId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(
    `/api/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`
  );
  return response.data;
};

// Add note to lesson
export const addNoteToLesson = async (
  courseId: string,
  sectionId: string,
  lessonId: string,
  noteData: { content: string; timestamp: number }
): Promise<NoteResponse> => {
  const response = await api.post(
    `/api/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/notes`,
    noteData
  );
  return response.data;
};

// Get user's notes for a lesson
export const getUserNotesForLesson = async (
  courseId: string,
  sectionId: string,
  lessonId: string
): Promise<{
  success: boolean;
  data: {
    id: string;
    content: string;
    timestamp: number;
    userId: string;
    createdAt: string;
  }[];
}> => {
  const response = await api.get(
    `/api/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/notes`
  );
  return response.data;
};

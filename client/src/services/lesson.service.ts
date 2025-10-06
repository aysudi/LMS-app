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
  lessonData: any
): Promise<LessonResponse> => {
  const formData = new FormData();

  // Add lesson basic data
  formData.append("title", lessonData.title);
  formData.append("description", lessonData.description);
  formData.append("duration", lessonData.duration.toString());
  formData.append("isPreview", lessonData.isPreview.toString());
  formData.append("course", courseId);
  formData.append("section", sectionId);

  // Add video file if present
  if (lessonData.video instanceof File) {
    formData.append("video", lessonData.video);
  }

  // Add resource files if present
  if (lessonData.resources?.length) {
    lessonData.resources.forEach((resource: any, index: number) => {
      if (resource.file instanceof File) {
        formData.append("resources", resource.file);
        formData.append(`resourceNames[${index}]`, resource.name);
        formData.append(`resourceTypes[${index}]`, resource.type);
      }
    });
  }

  // Add quiz data if present - only add if there are actual questions with valid structure
  if (
    lessonData.quiz &&
    Array.isArray(lessonData.quiz) &&
    lessonData.quiz.length > 0
  ) {
    // Filter out incomplete quiz questions
    const validQuiz = lessonData.quiz.filter(
      (q: any) =>
        q.question &&
        q.question.trim() &&
        Array.isArray(q.options) &&
        q.options.length >= 2 &&
        q.options.every((opt: string) => opt && opt.trim()) &&
        typeof q.correctAnswer === "number" &&
        q.correctAnswer >= 0 &&
        q.correctAnswer < q.options.length
    );

    if (validQuiz.length > 0) {
      formData.append("quiz", JSON.stringify(validQuiz));
    }
  }

  const response = await api.post(`/api/lessons`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Update lesson
export const updateLesson = async (
  courseId: string,
  _sectionId: string,
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
      `/api/lessons/${courseId}/lesson/${lessonId}`,
      formData,
      config
    );
    return response.data;
  }

  // Regular JSON update if no files
  const response = await api.put(
    `/api/lessons/${courseId}/lesson/${lessonId}`,
    updateData
  );
  return response.data;
};

// Delete lesson
export const deleteLesson = async (
  courseId: string,
  _sectionId: string,
  lessonId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(
    `/api/lessons/${courseId}/lesson/${lessonId}`
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

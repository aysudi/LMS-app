import { api } from "./api";
import type {
  InstructorOverviewResponse,
  InstructorCoursesResponse,
  CourseStudentsResponse,
  InstructorMessagesResponse,
  MessageStatsResponse,
  InstructorEarningsResponse,
  InstructorEarningsByCourseResponse,
  ReplyToMessageData,
  UpdatePayoutStatusData,
  InstructorCoursesQuery,
  InstructorMessagesQuery,
} from "../types/instructor.type.js";

// Dashboard & Overview
export const getInstructorOverview =
  async (): Promise<InstructorOverviewResponse> => {
    const response = await api.get("/api/instructor/overview");
    return response.data;
  };

// Course Management
export const getInstructorCoursesWithStats = async (
  params: InstructorCoursesQuery = {}
): Promise<InstructorCoursesResponse> => {
  const response = await api.get("/api/instructor/courses", { params });
  return response.data;
};

export const getCourseStudents = async (
  courseId: string,
  params: { page?: number; limit?: number } = {}
): Promise<CourseStudentsResponse> => {
  const response = await api.get(
    `/api/instructor/courses/${courseId}/students`,
    {
      params,
    }
  );
  return response.data;
};

// Communication
export const getInstructorMessages = async (
  params: InstructorMessagesQuery = {}
): Promise<InstructorMessagesResponse> => {
  const response = await api.get("/api/instructor/messages", { params });
  return response.data;
};

export const replyToMessage = async (
  messageId: string,
  data: ReplyToMessageData
): Promise<{ success: boolean; message: string; data?: any }> => {
  const response = await api.post(
    `/api/instructor/messages/${messageId}/reply`,
    data
  );
  return response.data;
};

export const markMessageAsRead = async (
  messageId: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  const response = await api.patch(
    `/api/instructor/messages/${messageId}/read`
  );
  return response.data;
};

export const markMessageAsResolved = async (
  messageId: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  const response = await api.patch(
    `/api/instructor/messages/${messageId}/resolve`
  );
  return response.data;
};

export const getMessageStats = async (): Promise<MessageStatsResponse> => {
  const response = await api.get("/api/instructor/messages/stats");
  return response.data;
};

// Earnings & Revenue
export const getInstructorEarnings =
  async (): Promise<InstructorEarningsResponse> => {
    const response = await api.get("/api/instructor/earnings");
    return response.data;
  };

export const getInstructorEarningsByCourse = async (
  courseId?: string
): Promise<InstructorEarningsByCourseResponse> => {
  const params = courseId ? { courseId } : {};
  const response = await api.get("/api/instructor/earnings/by-course", {
    params,
  });
  return response.data;
};

export const updatePayoutStatus = async (
  data: UpdatePayoutStatusData
): Promise<{ success: boolean; message: string; data?: any }> => {
  const response = await api.patch(
    "/api/instructor/earnings/payout-status",
    data
  );
  return response.data;
};

// Sections Management (from existing routes)
export const createSection = async (sectionData: {
  title: string;
  description?: string;
  course: string;
  order?: number;
}): Promise<{ success: boolean; message: string; data?: any }> => {
  const response = await api.post("/api/sections", sectionData);
  return response.data;
};

export const updateSection = async (
  sectionId: string,
  updateData: {
    title?: string;
    description?: string;
    order?: number;
  }
): Promise<{ success: boolean; message: string; data?: any }> => {
  const response = await api.put(`/api/sections/${sectionId}`, updateData);
  return response.data;
};

export const deleteSection = async (
  sectionId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/api/sections/${sectionId}`);
  return response.data;
};

export const getSectionsByCourse = async (
  courseId: string
): Promise<{ success: boolean; data: any[] }> => {
  const response = await api.get(`/api/sections/course/${courseId}`);
  return response.data;
};

export const getSectionsWithCount = async (
  courseId: string
): Promise<{ success: boolean; data: any[] }> => {
  const response = await api.get(`/api/sections/${courseId}/with-count`);
  return response.data;
};

// Lessons Management (from existing routes)
export const createLesson = async (lessonData: {
  title: string;
  description?: string;
  videoUrl: string;
  duration: number;
  order?: number;
  isPreview?: boolean;
  course: string;
  section: string;
  resources?: Array<{
    name: string;
    url: string;
    type?: "pdf" | "zip" | "doc" | "other";
  }>;
  quiz?: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
}): Promise<{ success: boolean; message: string; data?: any }> => {
  const response = await api.post("/api/lessons", lessonData);
  return response.data;
};

export const updateLesson = async (
  courseId: string,
  lessonId: string,
  updateData: {
    title?: string;
    description?: string;
    videoUrl?: string;
    duration?: number;
    order?: number;
    isPreview?: boolean;
    resources?: Array<{
      name: string;
      url: string;
      type?: "pdf" | "zip" | "doc" | "other";
    }>;
    quiz?: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
    }>;
  }
): Promise<{ success: boolean; message: string; data?: any }> => {
  const response = await api.put(
    `/api/lessons/${courseId}/lesson/${lessonId}`,
    updateData
  );
  return response.data;
};

export const deleteLesson = async (
  courseId: string,
  lessonId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(
    `/api/lessons/${courseId}/lesson/${lessonId}`
  );
  return response.data;
};

export const getLessonsBySection = async (
  sectionId: string
): Promise<{ success: boolean; data: any[] }> => {
  const response = await api.get(`/api/lessons/section/${sectionId}`);
  return response.data;
};

export const getLessonById = async (
  lessonId: string
): Promise<{ success: boolean; data: any }> => {
  const response = await api.get(`/api/lessons/${lessonId}`);
  return response.data;
};

export const addNoteToLesson = async (
  courseId: string,
  sectionId: string,
  lessonId: string,
  noteData: {
    content: string;
    timestamp?: number;
  }
): Promise<{ success: boolean; message: string; data?: any }> => {
  const response = await api.post(
    `/api/lessons/${courseId}/sections/${sectionId}/lessons/${lessonId}/notes`,
    noteData
  );
  return response.data;
};

export const getUserNotesForLesson = async (
  courseId: string,
  sectionId: string,
  lessonId: string
): Promise<{ success: boolean; data: any[] }> => {
  const response = await api.get(
    `/api/lessons/${courseId}/sections/${sectionId}/lessons/${lessonId}/notes`
  );
  return response.data;
};

export const deleteCourse = async (
  courseId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/api/courses/${courseId}`);
  return response.data;
};

export const toggleCourseStatus = async (
  courseId: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  const response = await api.patch(`/api/courses/${courseId}/toggle-status`);
  return response.data;
};

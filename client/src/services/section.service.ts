import type { Section } from "../types/course.type";
import { api } from "./api";

interface SectionResponse {
  success: boolean;
  data: Section;
  message?: string;
}

interface SectionListResponse {
  success: boolean;
  data: Section[];
}

// Get all sections for a course
export const getSectionsByCourse = async (
  courseId: string
): Promise<SectionListResponse> => {
  const response = await api.get(`/api/courses/${courseId}/sections`);
  return response.data;
};

// Get section by ID
export const getSectionById = async (
  sectionId: string
): Promise<SectionResponse> => {
  const response = await api.get(`/api/sections/${sectionId}`);
  return response.data;
};

// Create new section
export const createSection = async (
  courseId: string,
  sectionData: Partial<Section>
): Promise<SectionResponse> => {
  const response = await api.post(
    `/api/courses/${courseId}/sections`,
    sectionData
  );
  return response.data;
};

// Update section
export const updateSection = async (
  courseId: string,
  sectionId: string,
  updateData: Partial<Section>
): Promise<SectionResponse> => {
  const response = await api.put(
    `/api/courses/${courseId}/sections/${sectionId}`,
    updateData
  );
  return response.data;
};

// Delete section
export const deleteSection = async (
  courseId: string,
  sectionId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(
    `/api/courses/${courseId}/sections/${sectionId}`
  );
  return response.data;
};

// Get sections with lesson count
export const getSectionsWithCount = async (
  courseId: string
): Promise<SectionListResponse> => {
  const response = await api.get(`/api/courses/${courseId}/sections/count`);
  return response.data;
};

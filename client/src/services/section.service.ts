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
  const response = await api.get(`/api/sections/course/${courseId}`);
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
  const formData =
    sectionData instanceof FormData ? sectionData : new FormData();

  if (!(sectionData instanceof FormData)) {
    // Append basic section data only if not already a FormData
    formData.append("title", sectionData.title || "");
    formData.append("course", courseId);
    if (sectionData.description)
      formData.append("description", sectionData.description);
    if (sectionData.order)
      formData.append("order", sectionData.order.toString());
    if (sectionData.thumbnail?.file) {
      formData.append("thumbnail", sectionData.thumbnail.file);
    }
  }

  const response = await api.post(`/api/sections`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Update section
export const updateSection = async (
  courseId: string,
  sectionId: string,
  updateData: Partial<Section> | FormData
): Promise<SectionResponse> => {
  const formData = updateData instanceof FormData ? updateData : new FormData();

  if (!(updateData instanceof FormData)) {
    // Append basic section data only if not already a FormData
    if (updateData.title) formData.append("title", updateData.title);
    if (updateData.description)
      formData.append("description", updateData.description);
    if (updateData.order !== undefined)
      formData.append("order", updateData.order.toString());
    formData.append("course", courseId);
    if (updateData.thumbnail?.file) {
      formData.append("thumbnail", updateData.thumbnail.file);
    }
  }

  const response = await api.put(`/api/sections/${sectionId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Delete section
export const deleteSection = async (
  courseId: string,
  sectionId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(
    `/api/sections/${sectionId}?courseId=${courseId}`
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

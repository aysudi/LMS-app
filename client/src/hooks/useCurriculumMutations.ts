import { useQueryClient } from "@tanstack/react-query";
import type { Section } from "../types/course.type";
import { useSectionOperations } from "./useSectionMutations";
import { courseQueryKeys } from "./useCourseQueries";

export const useCurriculumOperations = (courseId: string) => {
  const queryClient = useQueryClient();
  const {
    createSection,
    updateSection,
    deleteSection,
    isLoading,
    error,
    isSuccess,
  } = useSectionOperations(courseId);

  // Handle section operations
  const handleAddSection = async (
    sectionData: Partial<Section> & { title: string }
  ) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Add section data
      formData.append("title", sectionData.title);
      if (sectionData.description) {
        formData.append("description", sectionData.description);
      }
      if (sectionData.order) {
        formData.append("order", sectionData.order.toString());
      }

      // Add thumbnail if present
      if (sectionData.thumbnail?.file) {
        formData.append("thumbnail", sectionData.thumbnail.file);
      }

      await createSection(sectionData);

      // Invalidate course queries to reflect new section
      queryClient.invalidateQueries({
        queryKey: courseQueryKeys.detail(courseId),
      });
    } catch (error) {
      console.error("Error adding section:", error);
      throw error;
    }
  };

  const handleUpdateSection = async (
    sectionId: string,
    updateData: Partial<Section>
  ) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Add section data
      if (updateData.title) {
        formData.append("title", updateData.title);
      }
      if (updateData.description) {
        formData.append("description", updateData.description);
      }
      if (updateData.order !== undefined) {
        formData.append("order", updateData.order.toString());
      }

      // Add thumbnail if present
      if (updateData.thumbnail?.file) {
        formData.append("thumbnail", updateData.thumbnail.file);
      }

      await updateSection({ sectionId, updateData });

      // Invalidate course queries to reflect updated section
      queryClient.invalidateQueries({
        queryKey: courseQueryKeys.detail(courseId),
      });
    } catch (error) {
      console.error("Error updating section:", error);
      throw error;
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    try {
      await deleteSection(sectionId);

      // Invalidate course queries to reflect deleted section
      queryClient.invalidateQueries({
        queryKey: courseQueryKeys.detail(courseId),
      });
    } catch (error) {
      console.error("Error deleting section:", error);
      throw error;
    }
  };

  // Handle section reordering
  const handleReorderSections = async (sections: Section[]) => {
    try {
      const updatePromises = sections.map((section, index) =>
        handleUpdateSection(section.id, { ...section, order: index })
      );
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error reordering sections:", error);
      throw error;
    }
  };

  return {
    handleAddSection,
    handleUpdateSection,
    handleDeleteSection,
    handleReorderSections,
    isLoading,
    error,
    isSuccess,
  };
};

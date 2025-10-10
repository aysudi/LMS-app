import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useCurriculumOperations } from "../../../hooks/useCurriculumMutations";
import { useDeleteSection } from "../../../hooks/useSectionMutations";
import { useDeleteLesson } from "../../../hooks/useLessonMutations";
import SectionEditorModal from "./SectionEditorModal";
import {
  FaGripVertical,
  FaPlus,
  FaTrash,
  FaEdit,
  FaChevronDown,
  FaChevronRight,
  FaVideo,
  FaFile,
  FaQuestionCircle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import type { Section, Lesson, Course } from "../../../types/course.type";
import { enqueueSnackbar } from "notistack";

interface CurriculumPanelProps {
  course: Course;
  onUpdate: (changes: Partial<Course>) => void;
}

const CurriculumPanel = ({ course, onUpdate }: CurriculumPanelProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [editModal, setEditModal] = useState<{
    type: "section" | "lesson";
    data?: Section | Lesson;
    sectionId?: string;
  } | null>(null);

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: "section" | "lesson";
    sectionId: string;
    lessonId?: string;
  } | null>(null);

  const deleteSectionMutation = useDeleteSection(course.id);
  const deleteLessonMutation = useDeleteLesson(course.id, "");

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const isExpanded = prev.includes(sectionId);
      if (isExpanded) {
        return prev.filter((id) => id !== sectionId);
      } else {
        return [...prev, sectionId];
      }
    });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const currentSections = Array.isArray(course.sections)
      ? [...course.sections]
      : [];

    if (result.type === "lesson") {
      const [sourceSection] = currentSections.filter(
        (s) => `section-${s.id}` === result.source.droppableId
      );
      const [destSection] = currentSections.filter(
        (s) => `section-${s.id}` === result.destination.droppableId
      );

      if (
        !sourceSection ||
        !destSection ||
        !Array.isArray(sourceSection.lessons)
      )
        return;

      const updatedSections = [...currentSections];
      const sourceSectionIndex = currentSections.findIndex(
        (s) => s.id === sourceSection.id
      );
      const destSectionIndex = currentSections.findIndex(
        (s) => s.id === destSection.id
      );

      const [movedLesson] = sourceSection.lessons.splice(
        result.source.index,
        1
      );
      if (!Array.isArray(destSection.lessons)) {
        destSection.lessons = [];
      }
      destSection.lessons.splice(result.destination.index, 0, {
        ...movedLesson,
        section: destSection.id,
        order: result.destination.index,
      });

      sourceSection.lessons = sourceSection.lessons.map((lesson, idx) => ({
        ...lesson,
        order: idx,
      }));
      if (sourceSection.id !== destSection.id) {
        destSection.lessons = destSection.lessons.map((lesson, idx) => ({
          ...lesson,
          order: idx,
        }));
      }

      updatedSections[sourceSectionIndex] = sourceSection;
      if (sourceSectionIndex !== destSectionIndex) {
        updatedSections[destSectionIndex] = destSection;
      }

      onUpdate({ sections: updatedSections });
    } else {
      const [reorderedSection] = currentSections.splice(result.source.index, 1);
      currentSections.splice(result.destination.index, 0, reorderedSection);

      onUpdate({
        sections: currentSections.map((section, index) => ({
          ...section,
          order: index,
        })),
      });
    }
  };

  const openAddSectionModal = () => {
    setEditModal({ type: "section" });
  };

  const navigate = useNavigate();

  const handleAddLesson = (sectionId: string) => {
    navigate(
      `/instructor/courses/${course.id}/lessons/create?sectionId=${sectionId}`
    );
  };

  const handleEditLesson = (sectionId: string, lessonId: string) => {
    navigate(
      `/instructor/courses/${course.id}/lessons/${lessonId}/edit?sectionId=${sectionId}`
    );
  };

  const handleShowDeleteConfirmation = (
    type: "section" | "lesson",
    sectionId: string,
    lessonId?: string
  ) => {
    setDeleteConfirmation({ type, sectionId, lessonId });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation) return;
    try {
      if (deleteConfirmation.type === "section") {
        await deleteSectionMutation.mutateAsync(deleteConfirmation.sectionId);

        enqueueSnackbar("🗑️ Section deleted successfully", {
          autoHideDuration: 3000,
          style: {
            background: "#10B981",
            color: "#ffffff",
            fontWeight: "500",
            borderRadius: "12px",
            padding: "16px 24px",
            fontSize: "14px",
          },
        });
      } else if (
        deleteConfirmation.type === "lesson" &&
        deleteConfirmation.lessonId
      ) {
        await deleteLessonMutation.mutateAsync(deleteConfirmation.lessonId);

        enqueueSnackbar("🗑️ Lesson deleted successfully", {
          autoHideDuration: 3000,
          style: {
            background: "#10B981",
            color: "#ffffff",
            fontWeight: "500",
            borderRadius: "12px",
            padding: "16px 24px",
            fontSize: "14px",
          },
        });
      }
    } catch (error) {
      console.error("Error deleting:", error);
      enqueueSnackbar(`Failed to delete ${deleteConfirmation.type}`, {
        variant: "error",
      });
    } finally {
      setDeleteConfirmation(null);
    }
  };

  const { handleAddSection, handleUpdateSection } = useCurriculumOperations(
    course.id
  );

  const handleSave = async (formData: {
    title: string;
    description?: string;
    duration?: number;
    isPreview?: boolean;
  }) => {
    try {
      if (!formData.title.trim()) {
        enqueueSnackbar("Title is required", {
          variant: "error",
        });
        return;
      }

      if (editModal?.type === "section") {
        const sectionData = {
          title: formData.title.trim(),
          description: formData.description?.trim(),
          order: editModal.data
            ? (editModal.data as Section).order
            : (course.sections?.length || 0) + 1,
          course: course.id,
        };

        if (editModal.data) {
          await handleUpdateSection(
            (editModal.data as Section)._id,
            sectionData
          );
        } else {
          await handleAddSection(sectionData);
        }
      } else if (editModal?.type === "lesson" && editModal.sectionId) {
        const currentSections = [...(course.sections || [])];
        const sectionIndex = currentSections.findIndex(
          (section: Section) =>
            section._id === editModal.sectionId ||
            section.id === editModal.sectionId
        );

        if (sectionIndex === -1) {
          enqueueSnackbar("Section not found", {
            variant: "error",
          });
          return;
        }

        const section = currentSections[sectionIndex];

        if (editModal.data && "_id" in editModal.data) {
          const updatedLesson = {
            ...(editModal.data as Lesson),
            title: formData.title.trim(),
            description: formData.description?.trim(),
            duration: formData.duration || 0,
            isPreview: formData.isPreview || false,
          };
          await handleUpdateSection(section._id || section.id, {
            ...section,
            lessons: section.lessons.map((l) =>
              l._id === updatedLesson._id || l.id === updatedLesson.id
                ? updatedLesson
                : l
            ),
          });
        } else {
          const timestamp = Date.now();
          const newLesson: Lesson = {
            id: `lesson_${timestamp}`,
            _id: `lesson_${timestamp}`,
            title: formData.title.trim(),
            description: formData.description?.trim() || "",
            video: { url: "", publicId: "" },
            duration: formData.duration || 0,
            order: section.lessons?.length || 0,
            isPreview: formData.isPreview || false,
            course: course.id,
            section: editModal.sectionId,
            resources: [],
            quiz: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          await handleUpdateSection(section._id || section.id, {
            ...section,
            lessons: [...(section.lessons || []), newLesson],
          });
        }
      }

      setEditModal(null);
      const isUpdate = editModal?.data;
      const isSection = editModal?.type === "section";

      enqueueSnackbar(
        isUpdate
          ? `✨ ${isSection ? "Section" : "Lesson"} updated successfully!`
          : `🎉 ${isSection ? "Section" : "Lesson"} created successfully!`,
        {
          variant: "success",
          autoHideDuration: 4000,
          style: {
            background: "#10B981",
            color: "#ffffff",
            fontWeight: "500",
            borderRadius: "12px",
            padding: "16px 24px",
            fontSize: "14px",
          },
        }
      );
    } catch (error) {
      console.error("Error in handleSave:", error);
      enqueueSnackbar("❌ Something went wrong. Please try again.", {
        variant: "error",
        autoHideDuration: 6000,
        style: {
          background: "#EF4444",
          color: "#ffffff",
          fontWeight: "500",
          borderRadius: "12px",
          padding: "16px 24px",
          fontSize: "14px",
        },
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Course Curriculum
        </h2>
        <button
          onClick={openAddSectionModal}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
        >
          <FaPlus className="mr-2" />
          Add Section
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(providedSections) => (
            <div
              {...providedSections.droppableProps}
              ref={providedSections.innerRef}
            >
              {(Array.isArray(course.sections) ? course.sections : []).map(
                (section: Section, sectionIndex: number) => (
                  <Draggable
                    key={sectionIndex}
                    draggableId={String(section.id)}
                    index={sectionIndex}
                  >
                    {(providedSection) => (
                      <div
                        ref={providedSection.innerRef}
                        {...providedSection.draggableProps}
                        className="mb-4"
                      >
                        <div className="border rounded-lg bg-gray-50">
                          {/* Section Header */}
                          <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center flex-1">
                              <span {...providedSection.dragHandleProps}>
                                <FaGripVertical className="text-gray-400 mr-3" />
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  section._id && toggleSection(section._id);
                                }}
                                className="flex items-center text-left flex-1"
                              >
                                {section._id &&
                                expandedSections.includes(section._id) ? (
                                  <FaChevronDown className="text-gray-500 mr-2 cursor-pointer" />
                                ) : (
                                  <FaChevronRight className="text-gray-500 mr-2 cursor-pointer" />
                                )}
                                <div>
                                  <h3 className="font-medium text-gray-900">
                                    Section {sectionIndex + 1}: {section.title}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {section.lessons?.length || 0} lessons
                                  </p>
                                </div>
                              </button>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  setEditModal({
                                    type: "section",
                                    data: section,
                                  })
                                }
                                className="p-2 text-gray-400 hover:text-gray-500 cursor-pointer"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() =>
                                  handleShowDeleteConfirmation(
                                    "section",
                                    section._id
                                  )
                                }
                                className="p-2 text-gray-400 hover:text-red-500 cursor-pointer"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>

                          {/* Lessons */}
                          <AnimatePresence>
                            {section._id &&
                              expandedSections.includes(section._id) && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Droppable
                                    droppableId={`section-${section.id}`}
                                    type="lesson"
                                  >
                                    {(providedLessons) => (
                                      <div
                                        ref={providedLessons.innerRef}
                                        {...providedLessons.droppableProps}
                                        className="border-t"
                                      >
                                        {section.lessons?.map(
                                          (
                                            lesson: any,
                                            lessonIndex: number
                                          ) => (
                                            <Draggable
                                              key={lessonIndex}
                                              draggableId={String(lesson.id)}
                                              index={lessonIndex}
                                            >
                                              {(providedLesson) => (
                                                <div
                                                  ref={providedLesson.innerRef}
                                                  {...providedLesson.draggableProps}
                                                  className="border-b last:border-b-0"
                                                >
                                                  <div className="p-4 flex items-center bg-white">
                                                    <span
                                                      {...providedLesson.dragHandleProps}
                                                    >
                                                      <FaGripVertical className="text-gray-400 mr-3" />
                                                    </span>
                                                    <div className="flex-1">
                                                      <div className="flex items-center">
                                                        <FaVideo className="text-gray-400 mr-2" />
                                                        <h4 className="font-medium text-gray-900">
                                                          {lesson.title}
                                                        </h4>
                                                        {lesson.isPreview && (
                                                          <span className="ml-2 px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                                                            Preview
                                                          </span>
                                                        )}
                                                      </div>
                                                      <div className="mt-1 flex items-center text-sm text-gray-500">
                                                        <span className="flex items-center">
                                                          {Math.floor(
                                                            lesson.duration / 60
                                                          )}{" "}
                                                          min
                                                        </span>
                                                        {lesson.resources
                                                          ?.length > 0 && (
                                                          <span className="flex items-center ml-4">
                                                            <FaFile className="mr-1" />
                                                            {
                                                              lesson.resources
                                                                .length
                                                            }{" "}
                                                            resources
                                                          </span>
                                                        )}
                                                        {lesson.quiz?.length >
                                                          0 && (
                                                          <span className="flex items-center ml-4">
                                                            <FaQuestionCircle className="mr-1" />
                                                            Quiz
                                                          </span>
                                                        )}
                                                      </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                      <button
                                                        onClick={() =>
                                                          handleEditLesson(
                                                            section._id,
                                                            lesson._id
                                                          )
                                                        }
                                                        className="p-2 text-gray-400 hover:text-gray-500 cursor-pointer"
                                                      >
                                                        <FaEdit />
                                                      </button>
                                                      <button
                                                        onClick={() => {
                                                          handleShowDeleteConfirmation(
                                                            "lesson",
                                                            section._id,
                                                            lesson._id
                                                          );
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-red-500 cursor-pointer"
                                                      >
                                                        <FaTrash />
                                                      </button>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                            </Draggable>
                                          )
                                        )}
                                        {providedLessons.placeholder}
                                        <div className="p-4 flex justify-center">
                                          <button
                                            onClick={() =>
                                              section._id &&
                                              handleAddLesson(section._id)
                                            }
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                                          >
                                            <FaPlus className="mr-2" />
                                            Add Lesson
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </Droppable>
                                </motion.div>
                              )}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}
                  </Draggable>
                )
              )}
              {providedSections.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {editModal && (
        <SectionEditorModal
          isOpen={!!editModal}
          section={editModal.data as Section}
          onSave={handleSave}
          onClose={() => setEditModal(null)}
        />
      )}

      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black/65 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete{" "}
              {deleteConfirmation.type === "section" ? "Section" : "Lesson"}
            </h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete this {deleteConfirmation.type}?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumPanel;

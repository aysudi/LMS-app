import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
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
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import type { Section, Lesson, Course } from "../../../types/course.type";
import { FormInput, FormTextArea } from "../../UI/FormControls";

interface CurriculumPanelProps {
  course: Course;
  onUpdate: (changes: Partial<Course>) => void;
}

interface EditModalProps {
  type: "section" | "lesson";
  data?: Section | Lesson;
  sectionId?: string;
  onSave: (data: {
    title: string;
    description?: string;
    duration?: number;
    isPreview?: boolean;
  }) => void;
  onClose: () => void;
}

const EditModal = ({ type, data, onSave, onClose }: EditModalProps) => {
  const [formData, setFormData] = useState({
    title: data?.title || "",
    description: data?.description || "",
    ...(type === "lesson" && {
      duration: (data as Lesson)?.duration || 0,
      isPreview: (data as Lesson)?.isPreview || false,
    }),
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">
          {type === "section" ? "Edit Section" : "Edit Lesson"}
        </h2>
        {type === "section" && (
          <div className="space-y-4">
            <FormInput
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              label="Title"
              placeholder="Enter section title"
            />
            <FormTextArea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              label="Description"
              placeholder="Describe what students will learn in this section"
              rows={3}
            />
          </div>
        )}
        {type === "lesson" && (
          <div className="space-y-4">
            <FormInput
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              label="Title"
              placeholder="Enter lesson title"
            />
            <FormTextArea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              label="Description"
              placeholder="Describe what students will learn in this lesson"
              rows={3}
            />
            <FormInput
              type="number"
              value={formData.duration ? Math.floor(formData.duration / 60) : 0}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  duration: parseInt(e.target.value) * 60,
                }))
              }
              min="0"
              label="Duration (minutes)"
              helperText="Estimated time to complete this lesson"
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPreview"
                checked={formData.isPreview || false}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isPreview: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition duration-150 ease-in-out"
              />
              <label htmlFor="isPreview" className="text-sm text-gray-900">
                Preview Lesson (Free)
              </label>
            </div>
          </div>
        )}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!formData.title) return;
              onSave(formData);
            }}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

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

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
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

      // Update order
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

  const handleAddSection = () => {
    setEditModal({ type: "section" });
  };

  const handleAddLesson = (sectionId: string) => {
    setEditModal({ type: "lesson", sectionId });
  };

  const handleShowDeleteConfirmation = (
    type: "section" | "lesson",
    sectionId: string,
    lessonId?: string
  ) => {
    setDeleteConfirmation({ type, sectionId, lessonId });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmation) return;

    try {
      if (deleteConfirmation.type === "section") {
        const updatedSections = course.sections.filter(
          (section) => section.id !== deleteConfirmation.sectionId
        );
        onUpdate({ sections: updatedSections });
        toast.success("Section deleted successfully");
      } else if (
        deleteConfirmation.type === "lesson" &&
        deleteConfirmation.lessonId
      ) {
        const updatedSections = course.sections.map((section) => {
          if (section.id === deleteConfirmation.sectionId) {
            return {
              ...section,
              lessons: section.lessons.filter(
                (lesson) => lesson.id !== deleteConfirmation.lessonId
              ),
            };
          }
          return section;
        });
        onUpdate({ sections: updatedSections });
        toast.success("Lesson deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error(`Failed to delete ${deleteConfirmation.type}`);
    } finally {
      setDeleteConfirmation(null);
    }
  };

  const handleSave = (formData: {
    title: string;
    description?: string;
    duration?: number;
    isPreview?: boolean;
  }) => {
    try {
      if (!formData.title.trim()) {
        toast.error("Title is required");
        return;
      }

      const currentSections = Array.isArray(course.sections)
        ? course.sections
        : [];

      if (editModal?.type === "section") {
        const updatedSections = currentSections.map((section) =>
          section.id === (editModal.data as Section).id
            ? {
                ...section,
                title: formData.title.trim(),
                description:
                  formData.description?.trim() || section.description,
              }
            : section
        );
        onUpdate({ sections: updatedSections });

        const newSection: Section = {
          title: formData.title.trim(),
          description: formData.description?.trim() || "",
          order: currentSections.length + 1,
          course: course.id || "",
          lessons: [],
          lessonCount: 0,
          //   updatedAt: new Date().toISOString(),
        };
        onUpdate({ sections: [...currentSections, newSection] });
        setExpandedSections((prev) => [...prev, newSection.id]);
      } else if (editModal?.type === "lesson" && editModal.sectionId) {
        const currentSections = [
          ...(Array.isArray(course.sections) ? course.sections : []),
        ];
        const sectionIndex = currentSections.findIndex(
          (section: Section) => section.id === editModal.sectionId
        );

        if (sectionIndex === -1) {
          toast.error("Section not found");
          return;
        }

        const updatedSections = [...currentSections];
        const section = { ...updatedSections[sectionIndex] };

        if (editModal.data && "_id" in editModal.data) {
          // Edit existing lesson
          section.lessons = section.lessons.map((lesson: Lesson) =>
            lesson.id === (editModal.data as Lesson).id
              ? {
                  ...lesson,
                  title: formData.title.trim(),
                  description:
                    formData.description?.trim() || lesson.description,
                  duration: formData.duration || lesson.duration,
                  isPreview: formData.isPreview || false,
                }
              : lesson
          );
        } else {
          // Add new lesson
          const timestamp = Date.now();
          const newLesson: Lesson = {
            id: `lesson_${timestamp}`,
            _id: `lesson_${timestamp}`,
            title: formData.title.trim(),
            description: formData.description?.trim() || "",
            videoUrl: "",
            duration: formData.duration || 0,
            order: Array.isArray(section.lessons) ? section.lessons.length : 0,
            isPreview: formData.isPreview || false,
            course: course.id || "",
            section: editModal.sectionId,
            resources: [],
            quiz: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          section.lessons = Array.isArray(section.lessons)
            ? [...section.lessons, newLesson]
            : [newLesson];
        }

        updatedSections[sectionIndex] = section;
        onUpdate({ sections: updatedSections });
      }

      setEditModal(null);
      toast.success(
        editModal?.data ? "Updated successfully" : "Added successfully"
      );
    } catch (error) {
      console.error("Error in handleSave:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Course Curriculum
        </h2>
        <button
          onClick={handleAddSection}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                    key={section.id}
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
                                onClick={() => toggleSection(section.id)}
                                className="flex items-center text-left flex-1"
                              >
                                {expandedSections.includes(section.id) ? (
                                  <FaChevronDown className="text-gray-500 mr-2" />
                                ) : (
                                  <FaChevronRight className="text-gray-500 mr-2" />
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
                                className="p-2 text-gray-400 hover:text-gray-500"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() =>
                                  handleShowDeleteConfirmation(
                                    "section",
                                    section.id
                                  )
                                }
                                className="p-2 text-gray-400 hover:text-red-500"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>

                          {/* Lessons */}
                          <AnimatePresence>
                            {expandedSections.includes(section.id) && (
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
                                        (lesson: any, lessonIndex: number) => (
                                          <Draggable
                                            key={lesson.id}
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
                                                        setEditModal({
                                                          type: "lesson",
                                                          data: lesson,
                                                          sectionId: section.id,
                                                        })
                                                      }
                                                      className="p-2 text-gray-400 hover:text-gray-500"
                                                    >
                                                      <FaEdit />
                                                    </button>
                                                    <button
                                                      onClick={() =>
                                                        handleShowDeleteConfirmation(
                                                          "lesson",
                                                          section.id,
                                                          lesson.id
                                                        )
                                                      }
                                                      className="p-2 text-gray-400 hover:text-red-500"
                                                    >
                                                      <FaTrash />
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </Draggable>
                                          /* Previously had a bad `//` comment here */
                                        )
                                      )}
                                      {providedLessons.placeholder}
                                      <div className="p-4 flex justify-center">
                                        <button
                                          onClick={() =>
                                            handleAddLesson(section.id)
                                          }
                                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
        <EditModal
          type={editModal.type}
          data={editModal.data}
          sectionId={editModal.sectionId}
          onSave={handleSave}
          onClose={() => setEditModal(null)}
        />
      )}

      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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

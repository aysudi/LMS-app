import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaVideo,
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaEye,
  FaFile,
  FaQuestionCircle,
  FaGripVertical,
  FaTrash,
} from "react-icons/fa";
import type { Section, Lesson } from "../../../types/curriculum.type";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface CurriculumStepProps {
  formData: {
    sections: Section[];
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
}

const CurriculumStep: React.FC<CurriculumStepProps> = ({
  formData,
  setFormData,
  errors,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  const handleAddSection = () => {
    const newSection: Section = {
      title: "New Section",
      description: "",
      order: formData.sections.length + 1,
      course: "", // Will be set when course is created
      lessons: [],
    };

    setFormData((prev: any) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };

  const handleAddLesson = (sectionIndex: number) => {
    const newLesson: Lesson = {
      title: "New Lesson",
      description: "",
      videoUrl: "",
      duration: 0,
      order: formData.sections[sectionIndex].lessons.length + 1,
      isPreview: false,
      course: "", // Will be set when course is created
      section: "", // Will be set when section is created
      resources: [],
      quiz: [],
    };

    setFormData((prev: any) => ({
      ...prev,
      sections: prev.sections.map((section: Section, idx: number) =>
        idx === sectionIndex
          ? { ...section, lessons: [...section.lessons, newLesson] }
          : section
      ),
    }));
  };

  const handleRemoveSection = (sectionIndex: number) => {
    setFormData((prev: any) => ({
      ...prev,
      sections: prev.sections.filter(
        (_: any, idx: number) => idx !== sectionIndex
      ),
    }));
  };

  const handleRemoveLesson = (sectionIndex: number, lessonIndex: number) => {
    setFormData((prev: any) => ({
      ...prev,
      sections: prev.sections.map((section: Section, idx: number) =>
        idx === sectionIndex
          ? {
              ...section,
              lessons: section.lessons.filter((_, i) => i !== lessonIndex),
            }
          : section
      ),
    }));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === "section") {
      const sections = Array.from(formData.sections);
      const [removed] = sections.splice(source.index, 1);
      sections.splice(destination.index, 0, removed);

      // Update order
      const updatedSections = sections.map((section, index) => ({
        ...section,
        order: index + 1,
      }));

      setFormData((prev: any) => ({
        ...prev,
        sections: updatedSections,
      }));
    } else if (type === "lesson") {
      const sectionIndex = parseInt(result.type.split("-")[1]);
      const lessons = Array.from(formData.sections[sectionIndex].lessons);
      const [removed] = lessons.splice(source.index, 1);
      lessons.splice(destination.index, 0, removed);

      // Update order
      const updatedLessons = lessons.map((lesson, index) => ({
        ...lesson,
        order: index + 1,
      }));

      setFormData((prev: any) => ({
        ...prev,
        sections: prev.sections.map((section: Section, idx: number) =>
          idx === sectionIndex
            ? { ...section, lessons: updatedLessons }
            : section
        ),
      }));
    }
  };

  return (
    <motion.div
      key="curriculum"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-8"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Course Curriculum
          </h2>
          <p className="text-gray-600">
            Organize your course content into sections and lessons. Drag and
            drop to reorder them.
          </p>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sections" type="section">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-6"
              >
                <AnimatePresence>
                  {formData.sections.map((section, sectionIndex) => (
                    <Draggable
                      key={section._id || `section-${sectionIndex}`}
                      draggableId={section._id || `section-${sectionIndex}`}
                      index={sectionIndex}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                        >
                          {/* Section Header */}
                          <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center">
                              <div
                                {...provided.dragHandleProps}
                                className="mr-3 text-gray-400 hover:text-gray-600 cursor-grab"
                              >
                                <FaGripVertical />
                              </div>
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={section.title}
                                  onChange={(e) =>
                                    setFormData((prev: any) => ({
                                      ...prev,
                                      sections: prev.sections.map(
                                        (s: Section, i: number) =>
                                          i === sectionIndex
                                            ? { ...s, title: e.target.value }
                                            : s
                                      ),
                                    }))
                                  }
                                  className="w-full bg-transparent font-semibold text-gray-900 focus:outline-none"
                                  placeholder="Section Title"
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() =>
                                    setExpandedSection(
                                      expandedSection ===
                                        `section-${sectionIndex}`
                                        ? null
                                        : `section-${sectionIndex}`
                                    )
                                  }
                                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                  {expandedSection ===
                                  `section-${sectionIndex}` ? (
                                    <FaChevronUp />
                                  ) : (
                                    <FaChevronDown />
                                  )}
                                </button>
                                <button
                                  onClick={() =>
                                    handleRemoveSection(sectionIndex)
                                  }
                                  className="p-2 text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Section Content */}
                          <AnimatePresence>
                            {expandedSection === `section-${sectionIndex}` && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="p-4">
                                  <textarea
                                    value={section.description || ""}
                                    onChange={(e) =>
                                      setFormData((prev: any) => ({
                                        ...prev,
                                        sections: prev.sections.map(
                                          (s: Section, i: number) =>
                                            i === sectionIndex
                                              ? {
                                                  ...s,
                                                  description: e.target.value,
                                                }
                                              : s
                                        ),
                                      }))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Section Description (optional)"
                                    rows={2}
                                  />

                                  {/* Lessons List */}
                                  <Droppable
                                    droppableId={`lessons-${sectionIndex}`}
                                    type={`lesson-${sectionIndex}`}
                                  >
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="mt-4 space-y-3"
                                      >
                                        {section.lessons.map(
                                          (lesson, lessonIndex) => (
                                            <Draggable
                                              key={
                                                lesson._id ||
                                                `lesson-${sectionIndex}-${lessonIndex}`
                                              }
                                              draggableId={
                                                lesson._id ||
                                                `lesson-${sectionIndex}-${lessonIndex}`
                                              }
                                              index={lessonIndex}
                                            >
                                              {(provided) => (
                                                <div
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  className="bg-gray-50 rounded-lg p-3"
                                                >
                                                  <div className="flex items-center">
                                                    <div
                                                      {...provided.dragHandleProps}
                                                      className="mr-3 text-gray-400 hover:text-gray-600 cursor-grab"
                                                    >
                                                      <FaGripVertical />
                                                    </div>
                                                    <div className="flex-1">
                                                      <input
                                                        type="text"
                                                        value={lesson.title}
                                                        onChange={(e) =>
                                                          setFormData(
                                                            (prev: any) => ({
                                                              ...prev,
                                                              sections:
                                                                prev.sections.map(
                                                                  (
                                                                    s: Section,
                                                                    i: number
                                                                  ) =>
                                                                    i ===
                                                                    sectionIndex
                                                                      ? {
                                                                          ...s,
                                                                          lessons:
                                                                            s.lessons.map(
                                                                              (
                                                                                l: Lesson,
                                                                                j: number
                                                                              ) =>
                                                                                j ===
                                                                                lessonIndex
                                                                                  ? {
                                                                                      ...l,
                                                                                      title:
                                                                                        e
                                                                                          .target
                                                                                          .value,
                                                                                    }
                                                                                  : l
                                                                            ),
                                                                        }
                                                                      : s
                                                                ),
                                                            })
                                                          )
                                                        }
                                                        className="w-full bg-transparent text-gray-900 focus:outline-none"
                                                        placeholder="Lesson Title"
                                                      />
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                      {lesson.isPreview && (
                                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                          Preview
                                                        </span>
                                                      )}
                                                      <button
                                                        onClick={() =>
                                                          setExpandedLesson(
                                                            expandedLesson ===
                                                              `lesson-${sectionIndex}-${lessonIndex}`
                                                              ? null
                                                              : `lesson-${sectionIndex}-${lessonIndex}`
                                                          )
                                                        }
                                                        className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                                                      >
                                                        {expandedLesson ===
                                                        `lesson-${sectionIndex}-${lessonIndex}` ? (
                                                          <FaChevronUp />
                                                        ) : (
                                                          <FaChevronDown />
                                                        )}
                                                      </button>
                                                      <button
                                                        onClick={() =>
                                                          handleRemoveLesson(
                                                            sectionIndex,
                                                            lessonIndex
                                                          )
                                                        }
                                                        className="p-1.5 text-red-500 hover:text-red-700 transition-colors"
                                                      >
                                                        <FaTrash />
                                                      </button>
                                                    </div>
                                                  </div>

                                                  {/* Lesson Details */}
                                                  <AnimatePresence>
                                                    {expandedLesson ===
                                                      `lesson-${sectionIndex}-${lessonIndex}` && (
                                                      <motion.div
                                                        initial={{
                                                          height: 0,
                                                          opacity: 0,
                                                        }}
                                                        animate={{
                                                          height: "auto",
                                                          opacity: 1,
                                                        }}
                                                        exit={{
                                                          height: 0,
                                                          opacity: 0,
                                                        }}
                                                        transition={{
                                                          duration: 0.2,
                                                        }}
                                                        className="mt-3 space-y-3"
                                                      >
                                                        <textarea
                                                          value={
                                                            lesson.description ||
                                                            ""
                                                          }
                                                          onChange={(e) =>
                                                            setFormData(
                                                              (prev: any) => ({
                                                                ...prev,
                                                                sections:
                                                                  prev.sections.map(
                                                                    (
                                                                      s: Section,
                                                                      i: number
                                                                    ) =>
                                                                      i ===
                                                                      sectionIndex
                                                                        ? {
                                                                            ...s,
                                                                            lessons:
                                                                              s.lessons.map(
                                                                                (
                                                                                  l: Lesson,
                                                                                  j: number
                                                                                ) =>
                                                                                  j ===
                                                                                  lessonIndex
                                                                                    ? {
                                                                                        ...l,
                                                                                        description:
                                                                                          e
                                                                                            .target
                                                                                            .value,
                                                                                      }
                                                                                    : l
                                                                              ),
                                                                          }
                                                                        : s
                                                                  ),
                                                              })
                                                            )
                                                          }
                                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                                          placeholder="Lesson Description (optional)"
                                                          rows={2}
                                                        />

                                                        <div className="grid grid-cols-2 gap-4">
                                                          <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                              Video URL
                                                            </label>
                                                            <div className="flex items-center space-x-2">
                                                              <FaVideo className="text-gray-400" />
                                                              <input
                                                                type="text"
                                                                value={
                                                                  lesson.videoUrl
                                                                }
                                                                onChange={(e) =>
                                                                  setFormData(
                                                                    (
                                                                      prev: any
                                                                    ) => ({
                                                                      ...prev,
                                                                      sections:
                                                                        prev.sections.map(
                                                                          (
                                                                            s: Section,
                                                                            i: number
                                                                          ) =>
                                                                            i ===
                                                                            sectionIndex
                                                                              ? {
                                                                                  ...s,
                                                                                  lessons:
                                                                                    s.lessons.map(
                                                                                      (
                                                                                        l: Lesson,
                                                                                        j: number
                                                                                      ) =>
                                                                                        j ===
                                                                                        lessonIndex
                                                                                          ? {
                                                                                              ...l,
                                                                                              videoUrl:
                                                                                                e
                                                                                                  .target
                                                                                                  .value,
                                                                                            }
                                                                                          : l
                                                                                    ),
                                                                                }
                                                                              : s
                                                                        ),
                                                                    })
                                                                  )
                                                                }
                                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                                                placeholder="Enter video URL"
                                                              />
                                                            </div>
                                                          </div>

                                                          <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                              Duration (minutes)
                                                            </label>
                                                            <div className="flex items-center space-x-2">
                                                              <FaClock className="text-gray-400" />
                                                              <input
                                                                type="number"
                                                                value={
                                                                  lesson.duration /
                                                                  60
                                                                }
                                                                onChange={(e) =>
                                                                  setFormData(
                                                                    (
                                                                      prev: any
                                                                    ) => ({
                                                                      ...prev,
                                                                      sections:
                                                                        prev.sections.map(
                                                                          (
                                                                            s: Section,
                                                                            i: number
                                                                          ) =>
                                                                            i ===
                                                                            sectionIndex
                                                                              ? {
                                                                                  ...s,
                                                                                  lessons:
                                                                                    s.lessons.map(
                                                                                      (
                                                                                        l: Lesson,
                                                                                        j: number
                                                                                      ) =>
                                                                                        j ===
                                                                                        lessonIndex
                                                                                          ? {
                                                                                              ...l,
                                                                                              duration:
                                                                                                parseFloat(
                                                                                                  e
                                                                                                    .target
                                                                                                    .value
                                                                                                ) *
                                                                                                60,
                                                                                            }
                                                                                          : l
                                                                                    ),
                                                                                }
                                                                              : s
                                                                        ),
                                                                    })
                                                                  )
                                                                }
                                                                min="0"
                                                                step="0.5"
                                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                                              />
                                                            </div>
                                                          </div>
                                                        </div>

                                                        <div className="flex items-center space-x-4">
                                                          <label className="flex items-center space-x-2">
                                                            <input
                                                              type="checkbox"
                                                              checked={
                                                                lesson.isPreview
                                                              }
                                                              onChange={(e) =>
                                                                setFormData(
                                                                  (
                                                                    prev: any
                                                                  ) => ({
                                                                    ...prev,
                                                                    sections:
                                                                      prev.sections.map(
                                                                        (
                                                                          s: Section,
                                                                          i: number
                                                                        ) =>
                                                                          i ===
                                                                          sectionIndex
                                                                            ? {
                                                                                ...s,
                                                                                lessons:
                                                                                  s.lessons.map(
                                                                                    (
                                                                                      l: Lesson,
                                                                                      j: number
                                                                                    ) =>
                                                                                      j ===
                                                                                      lessonIndex
                                                                                        ? {
                                                                                            ...l,
                                                                                            isPreview:
                                                                                              e
                                                                                                .target
                                                                                                .checked,
                                                                                          }
                                                                                        : l
                                                                                  ),
                                                                              }
                                                                            : s
                                                                      ),
                                                                  })
                                                                )
                                                              }
                                                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                            />
                                                            <span className="text-sm text-gray-700">
                                                              Preview Lesson
                                                            </span>
                                                            <FaEye className="text-gray-400" />
                                                          </label>
                                                        </div>

                                                        {/* Resources and Quiz buttons */}
                                                        <div className="flex items-center space-x-4 pt-2">
                                                          <button
                                                            type="button"
                                                            onClick={() => {
                                                              // Handle resources
                                                            }}
                                                            className="flex items-center space-x-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
                                                          >
                                                            <FaFile />
                                                            <span>
                                                              Resources
                                                            </span>
                                                            <span className="bg-gray-200 px-2 rounded-full text-xs">
                                                              {
                                                                lesson.resources
                                                                  .length
                                                              }
                                                            </span>
                                                          </button>

                                                          <button
                                                            type="button"
                                                            onClick={() => {
                                                              // Handle quiz
                                                            }}
                                                            className="flex items-center space-x-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
                                                          >
                                                            <FaQuestionCircle />
                                                            <span>Quiz</span>
                                                            <span className="bg-gray-200 px-2 rounded-full text-xs">
                                                              {
                                                                lesson.quiz
                                                                  .length
                                                              }
                                                            </span>
                                                          </button>
                                                        </div>
                                                      </motion.div>
                                                    )}
                                                  </AnimatePresence>
                                                </div>
                                              )}
                                            </Draggable>
                                          )
                                        )}
                                        {provided.placeholder}
                                      </div>
                                    )}
                                  </Droppable>

                                  {/* Add Lesson Button */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleAddLesson(sectionIndex)
                                    }
                                    className="mt-4 w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                                  >
                                    <FaPlus className="text-sm" />
                                    <span>Add Lesson</span>
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </AnimatePresence>
              </div>
            )}
          </Droppable>

          {/* Add Section Button */}
          <button
            type="button"
            onClick={handleAddSection}
            className="mt-6 w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <FaPlus className="text-sm" />
            <span>Add New Section</span>
          </button>
        </DragDropContext>

        {errors.sections && (
          <p className="mt-4 text-sm text-red-600">{errors.sections}</p>
        )}
      </div>
    </motion.div>
  );
};

export default CurriculumStep;

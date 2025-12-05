import { useTranslation } from "react-i18next";
import type { Course, Lesson } from "../../types/course.type";
import {
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaDownload,
  FaQuestionCircle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const LessonItem: React.FC<{
  lesson: Lesson;
  lessonIndex: number;
  formatDuration: (seconds: number) => string;
}> = ({ lesson, lessonIndex, formatDuration }) => {
  return (
    <div className="flex items-center gap-4 py-3 hover:bg-white rounded-lg px-4 transition-colors group cursor-pointer">
      {/* Lesson Icon */}

      {/* Lesson Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
            {lessonIndex + 1}. {lesson.title}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <FaClock />
            <span>{formatDuration(lesson.duration)}</span>
          </div>

          {lesson.resources.length > 0 && (
            <div className="flex items-center gap-1">
              <FaDownload />
              <span>{lesson.resources.length} resources</span>
            </div>
          )}

          {lesson.quiz.length > 0 && (
            <div className="flex items-center gap-1">
              <FaQuestionCircle />
              <span>{lesson.quiz.length} quiz</span>
            </div>
          )}
        </div>
      </div>

      {/* Duration */}
      <div className="text-sm text-gray-500 font-medium">
        {formatDuration(lesson.duration)}
      </div>
    </div>
  );
};

const CourseCurriculum: React.FC<{
  course: Course;
  expandedSections: string[];
  toggleSection: (sectionId: string) => void;
  formatDuration: (seconds: number) => string;
}> = ({ course, expandedSections, toggleSection, formatDuration }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header with Course Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h3 className="text-2xl font-bold text-gray-900">
          {t("courseDetails.courseContent")}
        </h3>
        <div className="text-sm text-gray-600 flex flex-wrap gap-4">
          <span>
            {course.sections.length} {t("courseDetails.sections")}
          </span>
          <span>•</span>
          <span>
            {course.totalLessons} {t("courseDetails.lectures")}
          </span>
          <span>•</span>
          <span>
            {formatDuration(course.totalDuration)}{" "}
            {t("courseDetails.totalLength")}
          </span>
        </div>
      </div>

      {/* Sections */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {course.sections.map((section, sectionIndex) => {
          const sectionKey = section.id || `section-${sectionIndex}`;

          return (
            <div
              key={sectionKey}
              className="border-b border-gray-200 last:border-b-0 "
            >
              {/* Section Header */}
              <button
                onClick={() => {
                  toggleSection(sectionKey);
                }}
                className="w-full px-6 py-5 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
              >
                <div className="flex-1 min-w-0 cursor-pointer">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-medium text-gray-500">
                      Section {sectionIndex + 1}:
                    </span>
                    <span className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {section.title}
                    </span>
                  </div>
                  {section.description && (
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      {section.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <div className="text-right text-sm text-gray-500">
                    <div>{section.lessons.length} lectures</div>
                    <div className="font-medium">
                      {formatDuration(
                        section.lessons.reduce(
                          (acc, lesson) => acc + lesson.duration,
                          0
                        )
                      )}
                    </div>
                  </div>
                  <div className="transition-transform duration-200 group-hover:scale-110">
                    {expandedSections.includes(sectionKey) ? (
                      <FaChevronUp className="text-gray-400" />
                    ) : (
                      <FaChevronDown className="text-gray-400" />
                    )}
                  </div>
                </div>
              </button>

              {/* Section Content */}
              <AnimatePresence initial={false}>
                {expandedSections.includes(sectionKey) && (
                  <motion.div
                    key={`content-${sectionKey}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gray-50 px-6 py-4">
                      <div className="space-y-2">
                        {section.lessons.map((lesson, lessonIndex) => (
                          <LessonItem
                            key={
                              lesson.id ||
                              `lesson-${sectionIndex}-${lessonIndex}`
                            }
                            lesson={lesson}
                            lessonIndex={lessonIndex}
                            formatDuration={formatDuration}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseCurriculum;

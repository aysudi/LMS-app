import { useState } from "react";
import {
  FaBook,
  FaChevronDown,
  FaChevronUp,
  FaLock,
  FaPlayCircle,
} from "react-icons/fa";

const CurriculumTab = ({ course }: { course: any }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-4">
      {course.sections && course.sections.length > 0 ? (
        course.sections.map((section: any, sectionIndex: number) => (
          <div
            key={section._id}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleSection(section._id)}
              className="w-full px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-900">
                  Section {sectionIndex + 1}: {section.title}
                </span>
                <span className="text-xs text-gray-500">
                  {section.lessons?.length || 0} lessons
                </span>
              </div>
              {expandedSections.has(section._id) ? (
                <FaChevronUp className="text-gray-400" />
              ) : (
                <FaChevronDown className="text-gray-400" />
              )}
            </button>
            {expandedSections.has(section._id) && (
              <div className="divide-y divide-gray-100">
                {section.lessons?.map((lesson: any, lessonIndex: number) => (
                  <div
                    key={lesson._id}
                    className="px-4 py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        {lesson.isPreview ? (
                          <FaPlayCircle className="text-indigo-600 text-sm" />
                        ) : (
                          <FaLock className="text-gray-400 text-sm" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {lessonIndex + 1}. {lesson.title}
                        </p>
                        {lesson.isPreview && (
                          <p className="text-xs text-indigo-600">
                            Preview available
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDuration(lesson.duration || 0)}
                    </span>
                  </div>
                )) || (
                  <div className="px-4 py-8 text-center text-gray-500">
                    No lessons in this section yet
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <FaBook className="text-4xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No curriculum sections added yet</p>
        </div>
      )}
    </div>
  );
};

export default CurriculumTab;

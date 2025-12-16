import React from "react";
import { useNavigate } from "react-router-dom";
import { FaList } from "react-icons/fa";

interface CourseWatchHeaderProps {
  course: any;
  currentSection: number;
  currentLesson: number;
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  isMobile: boolean;
}

const CourseWatchHeader: React.FC<CourseWatchHeaderProps> = ({
  course,
  currentSection,
  currentLesson,
  showSidebar,
  setShowSidebar,
  isMobile,
}) => {
  const navigate = useNavigate();

  return (
    <div className="absolute top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl z-30 border-b border-slate-800/50 shadow-lg">
      <div className="flex items-center justify-between p-3 sm:p-4">
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
          <button
            onClick={() => navigate("/my-learning")}
            className="group flex items-center space-x-1 sm:space-x-2 text-slate-400 hover:text-slate-200 transition-all duration-200 cursor-pointer hover:bg-slate-800/50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg flex-shrink-0"
          >
            <span className="text-lg group-hover:translate-x-[-2px] transition-transform duration-200">
              ←
            </span>
            <span className="hidden sm:inline text-sm sm:text-base">
              Back to My Learning
            </span>
            <span className="sm:hidden text-xs">Back</span>
          </button>

          {!isMobile && (
            <>
              <div className="h-4 w-px bg-slate-700 flex-shrink-0"></div>
              <h1 className="text-sm sm:text-lg font-semibold truncate text-slate-100 min-w-0">
                {course.title}
              </h1>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          {/* Progress Indicator */}
          <div className="hidden sm:flex px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/50 text-xs sm:text-sm text-slate-300 font-medium">
            <span className="font-mono">
              {currentSection + 1}.{currentLesson + 1}
            </span>
            <span className="mx-1">/</span>
            <span className="font-mono">
              {course.sections.reduce(
                (total: number, section: any) => total + section.lessons.length,
                0
              )}
            </span>
          </div>

          {/* Mobile Progress */}
          <div className="sm:hidden px-2 py-1 bg-slate-800/80 rounded text-xs text-slate-300 font-mono">
            {currentSection + 1}.{currentLesson + 1}
          </div>

          {/* Sidebar Toggle */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 sm:p-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-all duration-200 cursor-pointer relative"
            title={showSidebar ? "Hide sidebar" : "Show sidebar"}
          >
            <FaList className="text-sm" />
            {!showSidebar && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Course Title */}
      {isMobile && (
        <div className="px-4 pb-3">
          <h1 className="text-sm font-medium text-slate-200 truncate">
            {course.title}
          </h1>
        </div>
      )}
    </div>
  );
};

export default CourseWatchHeader;

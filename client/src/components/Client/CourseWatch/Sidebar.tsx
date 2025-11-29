import { FaCheck, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import formatTime from "../../../utils/formatTime";
import { HTMLRenderer } from "../../../utils/htmlRenderer";
import type { Course } from "../../../types/course.type";
import type { Dispatch, SetStateAction } from "react";
import { useState, useEffect } from "react";

type Props = {
  course: Course;
  setShowSidebar: Dispatch<SetStateAction<boolean>>;
  getLessonProgress: (lessonId: string) => any;
  loadLesson: (sectionIndex: number, lessonIndex: number) => void;
  currentSection: number;
  currentLesson: number;
  lessonQuizStates: { [key: string]: { completed: boolean; passed: boolean } };
  courseId: string | undefined;
};

const Sidebar = ({
  course,
  setShowSidebar,
  getLessonProgress,
  loadLesson,
  lessonQuizStates,
  currentSection,
  courseId,
  currentLesson,
}: Props) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="bg-slate-900/98 backdrop-blur-xl h-screen overflow-y-auto border-l border-slate-800/50 z-40 shadow-2xl">
      <div className={`${isMobile ? "px-4 py-3" : "px-6 py-4"}`}>
        {/* Header with course info - Enhanced */}
        <div
          className={`bg-gradient-to-br from-slate-800/60 to-slate-700/40 -m-${
            isMobile ? "4" : "6"
          } ${
            isMobile ? "p-4 mb-4" : "p-6 mb-6"
          } border-b border-slate-700/30 backdrop-blur-sm shadow-lg`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">📚</span>
              </div>
              <h2
                className={`${
                  isMobile ? "text-lg" : "text-xl"
                } font-bold text-slate-100`}
              >
                Course Content
              </h2>
            </div>

            <button
              onClick={() => setShowSidebar(false)}
              className="group p-2 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-110 active:scale-95"
              title="Close sidebar"
            >
              <FaTimes className="text-slate-400 group-hover:text-slate-200 transition-colors duration-200" />
            </button>
          </div>

          {/* Course Title */}
          <h3
            className={`${
              isMobile ? "text-sm" : "text-base"
            } font-semibold text-slate-200 truncate mb-3`}
          >
            {course.title}
          </h3>

          {/* Course Stats */}
          <div
            className={`grid ${
              isMobile ? "grid-cols-1 gap-2" : "grid-cols-2 gap-4"
            } text-xs ${isMobile ? "" : "text-sm"} text-slate-400`}
          >
            <div className="flex items-center space-x-2 bg-slate-800/40 rounded-lg p-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>
                {course.sections.reduce(
                  (total: any, section: any) => total + section.lessons.length,
                  0
                )}{" "}
                lessons
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-800/40 rounded-lg p-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span>{course.sections.length} sections</span>
            </div>
          </div>
        </div>

        {/* Course Sections - Enhanced */}
        <div className="space-y-3">
          {course.sections.map((section: any, sectionIndex: number) => {
            const sectionProgress = section.lessons.filter((lesson: any) => {
              const progress = getLessonProgress(lesson._id || lesson.id);
              return progress?.completed;
            }).length;

            const sectionPercentage =
              (sectionProgress / section.lessons.length) * 100;

            return (
              <div
                key={sectionIndex}
                className="border border-slate-700/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:border-slate-600/50 bg-slate-800/30"
              >
                {/* Section Header */}
                <div className="p-3 lg:p-4 bg-gradient-to-r from-slate-800/60 to-slate-700/40 border-b border-slate-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <h3
                      className={`font-semibold ${
                        isMobile ? "text-sm" : "text-sm lg:text-base"
                      } text-slate-100 flex items-center space-x-2`}
                    >
                      <span className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-xs text-white font-bold">
                        {sectionIndex + 1}
                      </span>
                      <span className="truncate">{section.title}</span>
                    </h3>

                    {/* Section Progress Indicator */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400 font-mono">
                        {sectionProgress}/{section.lessons.length}
                      </span>
                      <div className="w-8 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500 ease-out"
                          style={{ width: `${sectionPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-slate-400">
                    <span>{section.lessons.length} lessons</span>
                    {sectionPercentage === 100 && (
                      <span className="flex items-center space-x-1 text-emerald-400">
                        <FaCheck className="w-3 h-3" />
                        <span>Complete</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Section Lessons */}
                <div className="divide-y divide-slate-700/30">
                  {section.lessons.map((lesson: any, lessonIndex: number) => {
                    const progress = getLessonProgress(lesson._id || lesson.id);
                    const isCurrentLesson =
                      currentSection === sectionIndex &&
                      currentLesson === lessonIndex;
                    const lessonQuizState =
                      lessonQuizStates[lesson._id || lesson.id];

                    return (
                      <button
                        key={lessonIndex}
                        onClick={() => loadLesson(sectionIndex, lessonIndex)}
                        className={`w-full text-left p-3 lg:p-4 transition-all duration-200 group ${
                          isCurrentLesson
                            ? "bg-gradient-to-r from-blue-600/80 to-purple-600/60 shadow-lg"
                            : "hover:bg-slate-700/40"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {/* Lesson Status Indicator */}
                          <div
                            className={`w-6 h-6 lg:w-7 lg:h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                              progress?.completed
                                ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg"
                                : isCurrentLesson
                                ? "bg-white/20 text-white border-2 border-white/30"
                                : "bg-slate-700/50 text-slate-300 border border-slate-600/50 group-hover:bg-slate-600/50"
                            }`}
                          >
                            {progress?.completed ? (
                              <FaCheck className="w-3 h-3" />
                            ) : isCurrentLesson ? (
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            ) : (
                              <span className="font-mono text-xs">
                                {lessonIndex + 1}
                              </span>
                            )}
                          </div>

                          {/* Lesson Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4
                                className={`${
                                  isMobile ? "text-sm" : "text-sm lg:text-base"
                                } font-medium ${
                                  isCurrentLesson
                                    ? "text-white"
                                    : "text-slate-200"
                                } truncate pr-2 group-hover:text-white transition-colors`}
                              >
                                {lesson.title}
                              </h4>

                              {/* Lesson Duration */}
                              {lesson.duration && (
                                <span
                                  className={`text-xs ${
                                    isCurrentLesson
                                      ? "text-blue-200"
                                      : "text-slate-400"
                                  } font-mono flex-shrink-0`}
                                >
                                  {formatTime(lesson.duration)}
                                </span>
                              )}
                            </div>

                            {/* Lesson Description */}
                            {lesson.description && (
                              <div
                                className={`text-xs ${
                                  isCurrentLesson
                                    ? "text-blue-100"
                                    : "text-slate-400"
                                } mt-1 line-clamp-2 group-hover:text-slate-300 transition-colors`}
                              >
                                <HTMLRenderer
                                  content={lesson.description}
                                  className="text-inherit"
                                />
                              </div>
                            )}

                            {/* Lesson Progress Bar */}
                            {progress && progress.watchTime > 0 && (
                              <div className="mt-2">
                                <div className="w-full h-1 bg-slate-600/50 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full transition-all duration-500 ${
                                      progress.completed
                                        ? "bg-gradient-to-r from-emerald-500 to-green-400"
                                        : "bg-gradient-to-r from-blue-500 to-purple-500"
                                    }`}
                                    style={{
                                      width: `${Math.min(
                                        (progress.watchTime / lesson.duration) *
                                          100,
                                        100
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )}

                            {/* Lesson Features */}
                            <div className="flex items-center space-x-2 mt-2">
                              {lesson.quiz && lesson.quiz.length > 0 && (
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${
                                    lessonQuizState?.passed
                                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                      : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                  }`}
                                >
                                  📝 Quiz
                                </span>
                              )}

                              {lesson.resources &&
                                lesson.resources.length > 0 && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                    📁 Resources
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer-like section with course info */}
        <div
          className={`sticky bottom-0 bg-slate-900/95 border-t border-slate-700/50 mt-6 ${
            isMobile ? "-mx-4 px-4 py-3" : "-mx-6 px-6 py-4"
          }`}
        >
          <div className="space-y-3">
            {/* Instructor Info */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">👨‍🏫</span>
              </div>
              <div>
                <p
                  className={`${
                    isMobile ? "text-xs" : "text-sm"
                  } font-medium text-slate-200`}
                >
                  {course.instructor?.firstName} {course.instructor?.lastName}
                </p>
                <p className="text-xs text-slate-400">Instructor</p>
              </div>
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-1 gap-2 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span>Total Duration:</span>
                <span className="font-mono text-slate-300">
                  {Math.floor(course.totalDuration / 3600)}h{" "}
                  {Math.floor((course.totalDuration % 3600) / 60)}m
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Difficulty:</span>
                <span className="capitalize text-slate-300">
                  {course.level || "Beginner"}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-3 pt-2 border-t border-slate-800/50">
              <button
                onClick={() => navigate("/my-learning")}
                className="flex-1 text-center py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-xs text-blue-400 hover:text-blue-300 transition-all duration-200 cursor-pointer transform hover:scale-105"
              >
                📚 My Learning
              </button>
              <button
                onClick={() => navigate(`/course/${courseId}`)}
                className="flex-1 text-center py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-xs text-purple-400 hover:text-purple-300 transition-all duration-200 cursor-pointer transform hover:scale-105"
              >
                📖 Course Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

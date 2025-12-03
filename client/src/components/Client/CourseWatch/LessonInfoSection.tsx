import React, { useState, useEffect } from "react";
import { FaCheck, FaQuestionCircle } from "react-icons/fa";
import formatTime from "../../../utils/formatTime";

type Props = {
  course: any;
  currentSection: number;
  currentLesson: number;
  isLessonCompleted: any;
  markLessonComplete: () => void;
  canCompleteLesson: any;
  canTakeQuiz: () => boolean;
  showNotes: boolean;
  setShowNotes: (show: boolean) => void;
  currentLessonObj: any;
  quizPassed: boolean;
  quizCompleted: boolean;
  setActiveTab: any;
  getLessonProgress: (lessonId: string) => any;
  setShowQuiz: (show: boolean) => void;
  showQuiz: boolean;
};

const LessonInfoSection: React.FC<Props> = ({
  course,
  currentSection,
  currentLesson,
  isLessonCompleted,
  markLessonComplete,
  canCompleteLesson,
  canTakeQuiz,
  currentLessonObj,
  quizPassed,
  quizCompleted,
  setActiveTab,
  getLessonProgress,
  setShowQuiz,
  showQuiz,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(
    window.innerWidth >= 768 && window.innerWidth < 1024
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const progress = currentLessonObj
    ? getLessonProgress(currentLessonObj._id || currentLessonObj.id)
    : null;
  const isCompleted = progress?.completed || false;

  return (
    <div className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-t border-slate-800/50 shadow-xl">
      <div className={`${isMobile ? "p-4" : isTablet ? "p-5" : "p-6"}`}>
        {/* Mobile Layout */}
        {isMobile && (
          <div className="space-y-4">
            {/* Lesson Badges */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              <div className="px-2 py-1 bg-slate-800/60 text-slate-300 text-xs font-medium rounded-lg border border-slate-700/50 whitespace-nowrap flex items-center space-x-1">
                <span>📚</span>
                <span>Section {currentSection + 1}</span>
              </div>
              <div className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-lg border border-blue-400/30 whitespace-nowrap flex items-center space-x-1">
                <span>📖</span>
                <span>
                  Lesson {currentLesson + 1}/
                  {course.sections[currentSection]?.lessons?.length || 0}
                </span>
              </div>
              {isCompleted && (
                <div className="flex items-center px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded-lg border border-emerald-400/30 whitespace-nowrap">
                  <FaCheck className="mr-1 text-xs" />
                  <span>Done</span>
                </div>
              )}
            </div>
            {currentLessonObj &&
              getLessonProgress(currentLessonObj._id || currentLessonObj.id)
                ?.completed && (
                <div className="flex items-center px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded-md border border-emerald-400/30">
                  <FaCheck className="mr-1.5 text-xs" />
                  Completed
                </div>
              )}
          </div>
        )}

        <h1 className="text-2xl font-bold text-slate-100 mb-2 leading-tight">
          {currentLessonObj?.title}
        </h1>

        <p className="text-slate-400 text-base font-medium mb-3">
          {course.sections[currentSection]?.title}
        </p>

        <div className="flex items-center space-x-6 text-sm text-slate-400">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Duration: {formatTime(currentLessonObj?.duration || 0)}</span>
          </div>

          {currentLessonObj?.quiz && currentLessonObj.quiz.length > 0 && (
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  quizPassed
                    ? "bg-emerald-400"
                    : quizCompleted
                    ? "bg-rose-400"
                    : "bg-amber-400"
                }`}
              ></div>
              <span
                className={
                  quizPassed
                    ? "text-emerald-300"
                    : quizCompleted
                    ? "text-rose-300"
                    : "text-amber-300"
                }
              >
                Quiz:{" "}
                {quizPassed ? "Passed" : quizCompleted ? "Failed" : "Available"}
              </span>
            </div>
          )}

          {currentLessonObj?.resources &&
            currentLessonObj.resources.length > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                <span className="text-violet-300">
                  {currentLessonObj.resources.length} Resource
                  {currentLessonObj.resources.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}

          <div className="flex items-center space-x-3">
            <button
              onClick={markLessonComplete}
              disabled={!canCompleteLesson() && !isLessonCompleted()}
              className={`group px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 font-medium ${
                isLessonCompleted()
                  ? "bg-green-700/90 text-white border border-green-600/50 cursor-default"
                  : canCompleteLesson()
                  ? "bg-blue-600/90 hover:bg-blue-600 text-white border border-blue-500/30 hover:border-blue-400/50 hover:scale-105 cursor-pointer"
                  : "bg-slate-700/50 text-slate-400 cursor-not-allowed border border-slate-600/30"
              }`}
              title={
                isLessonCompleted()
                  ? "Lesson Completed"
                  : canCompleteLesson()
                  ? "Mark as Complete"
                  : currentLessonObj?.quiz && currentLessonObj.quiz.length > 0
                  ? quizCompleted && !quizPassed
                    ? "Pass the quiz to complete this lesson"
                    : !quizCompleted
                    ? "Complete the video and pass the quiz to mark as complete"
                    : "Complete the video to the last minute to mark as complete"
                  : "Complete the video to the last minute to mark as complete"
              }
            >
              <FaCheck
                className={`transition-transform duration-300 ${
                  !isLessonCompleted() && canCompleteLesson()
                    ? "group-hover:scale-110"
                    : ""
                }`}
              />
              <span>{isLessonCompleted() ? "Completed" : "Complete"}</span>
            </button>

            {currentLessonObj?.resources &&
              currentLessonObj.resources.length > 0 && (
                <button
                  onClick={() => setActiveTab("resources")}
                  className="group p-3 bg-blue-600/80 hover:bg-blue-600 rounded-xl transition-all duration-300 border border-blue-500/30 hover:border-blue-400/50 hover:scale-105"
                  title="Lesson Resources"
                >
                  <svg
                    className="w-5 h-5 group-hover:scale-110 transition-transform duration-300"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </button>
              )}

            {currentLessonObj?.quiz && currentLessonObj.quiz.length > 0 && (
              <button
                onClick={() => canTakeQuiz() && setShowQuiz(!showQuiz)}
                disabled={!canTakeQuiz()}
                className={`group p-3 rounded-xl transition-all duration-300 border ${
                  !canTakeQuiz()
                    ? "bg-slate-700/50 text-slate-400 cursor-not-allowed border border-slate-600/30"
                    : quizPassed
                    ? "bg-emerald-600/80 hover:bg-emerald-600 border-emerald-500/30 hover:border-emerald-400/50 hover:scale-105"
                    : quizCompleted && !quizPassed
                    ? "bg-rose-600/80 hover:bg-rose-600 border-rose-500/30 hover:border-rose-400/50 hover:scale-105"
                    : "bg-amber-600/80 hover:bg-amber-600 border-amber-500/30 hover:border-amber-400/50 hover:scale-105"
                }`}
                title={
                  !canTakeQuiz()
                    ? isLessonCompleted()
                      ? "Take Quiz"
                      : "Watch the video first to take the quiz"
                    : quizPassed
                    ? "Quiz Passed ✓"
                    : quizCompleted && !quizPassed
                    ? "Quiz Failed - Try Again"
                    : "Take Quiz"
                }
              >
                <FaQuestionCircle
                  className={`transition-transform duration-300 ${
                    canTakeQuiz() ? "group-hover:scale-110" : ""
                  }`}
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    // </div>
  );
};

export default LessonInfoSection;

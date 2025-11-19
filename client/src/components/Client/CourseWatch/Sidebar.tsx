import { File } from "lucide-react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import formatTime from "../../../utils/formatTime";
import type { Course } from "../../../types/course.type";
import type { Dispatch, SetStateAction } from "react";

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
  return (
    <div className="w-89 bg-slate-900/98 backdrop-blur-xl h-screen overflow-y-auto fixed right-0 top-0 border-l border-slate-800/50 z-40">
      <div className="px-6 py-4">
        {/* Header with course info */}
        <div className="bg-slate-800/50 -m-6 p-6 mb-6 border-b border-slate-700/30 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100">Course Content</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="group p-2 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200"
            >
              <FaTimes className="text-slate-400 group-hover:text-slate-200 transition-colors duration-200" />
            </button>
          </div>
          <h3 className="text-base font-semibold text-slate-200 truncate mb-1">
            {course.title}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-slate-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>
                {course.sections.reduce(
                  (total: any, section: any) => total + section.lessons.length,
                  0
                )}{" "}
                lessons
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span>{course.sections.length} sections</span>
            </div>
          </div>
        </div>

        {/* Course Sections */}
        <div className="space-y-2">
          {course.sections.map((section: any, sectionIndex: number) => (
            <div
              key={sectionIndex}
              className="border border-slate-700/50 rounded-lg overflow-hidden"
            >
              <div className="p-3 bg-slate-800/50">
                <h3 className="font-semibold text-sm text-slate-200">
                  {section.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {section.lessons.length} lessons
                </p>
              </div>

              <div className="divide-y divide-slate-700/50">
                {section.lessons.map((lesson: any, lessonIndex: number) => {
                  const progress = getLessonProgress(lesson._id || lesson.id);
                  const isCurrentLesson =
                    currentSection === sectionIndex &&
                    currentLesson === lessonIndex;

                  return (
                    <button
                      key={lessonIndex}
                      onClick={() => loadLesson(sectionIndex, lessonIndex)}
                      className={`w-full text-left p-3 hover:bg-slate-700/50 transition-colors ${
                        isCurrentLesson ? "bg-blue-600/90" : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                            progress?.completed
                              ? "bg-emerald-500"
                              : "bg-slate-600"
                          }`}
                        >
                          {progress?.completed ? <FaCheck /> : lessonIndex + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-200">
                            {lesson.title}
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatTime(lesson.duration)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {lesson.resources && lesson.resources.length > 0 && (
                            <span
                              className="bg-blue-600/80 px-1 py-1 rounded"
                              title="Has Resources"
                            >
                              <File size={16} />
                            </span>
                          )}
                          {lesson.quiz && lesson.quiz.length > 0 && (
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                progress?.completed
                                  ? "bg-emerald-600 text-white"
                                  : "bg-amber-500 text-white"
                              }`}
                              title={
                                lessonQuizStates[lesson._id || lesson.id]
                                  ?.passed
                                  ? "Quiz Passed"
                                  : lessonQuizStates[lesson._id || lesson.id]
                                      ?.completed
                                  ? "Quiz Failed"
                                  : "Has Quiz"
                              }
                            >
                              {progress?.completed ? "✓ Quiz" : "❓ Quiz"}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer-like section with course info */}
        <div className="sticky bottom-0 bg-slate-900/95 -mx-4 px-4 py-3 border-t border-slate-700/50 mt-4">
          <div className="text-xs text-slate-400 space-y-1">
            <div>
              Instructor: {course.instructor.firstName}{" "}
              {course.instructor.lastName}
            </div>
            <div>
              Total Duration: {Math.floor(course.totalDuration / 3600)}h{" "}
              {Math.floor((course.totalDuration % 3600) / 60)}m
            </div>
            <div className="flex items-center space-x-4 pt-2">
              <button
                onClick={() => navigate("/my-learning")}
                className="text-blue-400 hover:text-blue-300 text-xs cursor-pointer"
              >
                My Learning
              </button>
              <button
                onClick={() => navigate(`/course/${courseId}`)}
                className="text-blue-400 hover:text-blue-300 text-xs cursor-pointer"
              >
                Course Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

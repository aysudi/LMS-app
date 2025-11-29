import { useState, useEffect } from "react";
import HTMLRenderer from "../../../utils/htmlRenderer";

const OverviewTab = ({ course }: { course: any }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">📋</span>
        </div>
        <h3
          className={`${
            isMobile ? "text-lg" : "text-xl lg:text-2xl"
          } font-bold text-slate-100`}
        >
          Course Overview
        </h3>
      </div>

      <div className="space-y-6">
        {/* Course Description */}
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-xl border border-slate-700/50 backdrop-blur-sm shadow-xl overflow-hidden">
          <div className={`${isMobile ? "p-4" : "p-6"}`}>
            <h4
              className={`font-semibold ${
                isMobile ? "mb-2" : "mb-3"
              } text-slate-200 flex items-center space-x-2`}
            >
              <span className={`${isMobile ? "text-base" : "text-lg"}`}>
                About This Course
              </span>
            </h4>
            <div
              className={`text-slate-300 leading-relaxed ${
                isMobile ? "text-sm" : ""
              }`}
            >
              <HTMLRenderer
                content={course.description}
                className="text-slate-300 prose-invert prose-sm lg:prose-base"
              />
            </div>
          </div>
        </div>

        {/* Learning Outcomes */}
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-xl border border-slate-700/50 backdrop-blur-sm shadow-xl overflow-hidden">
          <div className={`${isMobile ? "p-4" : "p-6"}`}>
            <h4
              className={`font-semibold ${
                isMobile ? "mb-2" : "mb-3"
              } text-slate-200 flex items-center space-x-2`}
            >
              <span className={`${isMobile ? "text-base" : "text-lg"}`}>
                What You'll Learn
              </span>
            </h4>
            <ul
              className={`space-y-3 text-slate-300 ${
                isMobile ? "text-sm" : ""
              }`}
            >
              {course.learningOutcomes && course.learningOutcomes.length > 0 ? (
                course.learningOutcomes.map(
                  (outcome: string, index: number) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="leading-relaxed">{outcome}</span>
                    </li>
                  )
                )
              ) : (
                <>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="leading-relaxed">
                      Comprehensive understanding of the subject matter
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="leading-relaxed">
                      Practical skills and knowledge application
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="leading-relaxed">
                      Step-by-step learning progression
                    </span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
        {/* Course Information Grid */}
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-xl border border-slate-700/50 backdrop-blur-sm shadow-xl overflow-hidden">
          <div className={`${isMobile ? "p-4" : "p-6"}`}>
            <h4
              className={`font-semibold ${
                isMobile ? "mb-3" : "mb-4"
              } text-slate-200 flex items-center space-x-2`}
            >
              <span className={`${isMobile ? "text-base" : "text-lg"}`}>
                Course Information
              </span>
            </h4>

            <div
              className={`grid ${
                isMobile
                  ? "grid-cols-1 gap-3"
                  : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              }`}
            >
              {/* Instructor Info */}
              <div className="bg-slate-700/40 rounded-xl border border-slate-600/30 overflow-hidden group hover:bg-slate-700/50 transition-all duration-300">
                <div className={`${isMobile ? "p-3" : "p-4"}`}>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="text-2xl">👨‍🏫</div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-xs text-slate-400 uppercase tracking-wider font-medium`}
                      >
                        Instructor
                      </div>
                      <div
                        className={`font-semibold text-slate-200 ${
                          isMobile ? "text-sm" : ""
                        } truncate group-hover:text-white transition-colors`}
                      >
                        {course.instructor.firstName}{" "}
                        {course.instructor.lastName}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Duration */}
              <div className="bg-slate-700/40 rounded-xl border border-slate-600/30 overflow-hidden group hover:bg-slate-700/50 transition-all duration-300">
                <div className={`${isMobile ? "p-3" : "p-4"}`}>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">⏱️</div>
                    <div className="flex-1">
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                        Duration
                      </div>
                      <div
                        className={`font-semibold text-slate-200 ${
                          isMobile ? "text-sm" : ""
                        } group-hover:text-white transition-colors`}
                      >
                        {Math.floor(course.totalDuration / 3600)}h{" "}
                        {Math.floor((course.totalDuration % 3600) / 60)}m
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Level */}
              <div className="bg-slate-700/40 rounded-xl border border-slate-600/30 overflow-hidden group hover:bg-slate-700/50 transition-all duration-300">
                <div className={`${isMobile ? "p-3" : "p-4"}`}>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🎯</div>
                    <div className="flex-1">
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                        Level
                      </div>
                      <div
                        className={`font-semibold text-slate-200 ${
                          isMobile ? "text-sm" : ""
                        } capitalize group-hover:text-white transition-colors`}
                      >
                        {course.level || "Beginner"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Lessons */}
              <div className="bg-slate-700/40 rounded-xl border border-slate-600/30 overflow-hidden group hover:bg-slate-700/50 transition-all duration-300">
                <div className={`${isMobile ? "p-3" : "p-4"}`}>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">📚</div>
                    <div className="flex-1">
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                        Lessons
                      </div>
                      <div
                        className={`font-semibold text-slate-200 ${
                          isMobile ? "text-sm" : ""
                        } group-hover:text-white transition-colors`}
                      >
                        {course.sections.reduce(
                          (total: number, section: any) =>
                            total + section.lessons.length,
                          0
                        )}{" "}
                        Lessons
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Category */}
              <div className="bg-slate-700/40 rounded-xl border border-slate-600/30 overflow-hidden group hover:bg-slate-700/50 transition-all duration-300">
                <div className={`${isMobile ? "p-3" : "p-4"}`}>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🏷️</div>
                    <div className="flex-1">
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                        Category
                      </div>
                      <div
                        className={`font-semibold text-slate-200 ${
                          isMobile ? "text-sm" : ""
                        } capitalize group-hover:text-white transition-colors`}
                      >
                        {course.category?.name || "General"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Language */}
              <div className="bg-slate-700/40 rounded-xl border border-slate-600/30 overflow-hidden group hover:bg-slate-700/50 transition-all duration-300">
                <div className={`${isMobile ? "p-3" : "p-4"}`}>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🌐</div>
                    <div className="flex-1">
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                        Language
                      </div>
                      <div
                        className={`font-semibold text-slate-200 ${
                          isMobile ? "text-sm" : ""
                        } group-hover:text-white transition-colors`}
                      >
                        {course.language || "English"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;

import React from "react";
import { FaTrophy } from "react-icons/fa";
import AnnouncementsSection from "../Client/CourseWatch/AnnouncementsSection";
import NotesTab from "../Client/CourseWatch/NotesTab";
import QaTab from "../Client/CourseWatch/QaTab";
import CertificateNotIssued from "../Client/CourseWatch/CertificateNotIssued";
import CertificateIssued from "../Client/CourseWatch/CertificateIssued";
import ResourceTab from "../Client/CourseWatch/ResourceTab";
import OverviewTab from "../Client/CourseWatch/OverviewTab";
import ReviewTab from "../Client/CourseWatch/ReviewTab";

interface TabsSectionProps {
  isMobile: boolean;
  isTablet: boolean;
  activeTab:
    | "overview"
    | "notes"
    | "reviews"
    | "resources"
    | "announcements"
    | "qa"
    | "certificate";
  setActiveTab: (
    tab:
      | "overview"
      | "notes"
      | "reviews"
      | "resources"
      | "announcements"
      | "qa"
      | "certificate"
  ) => void;
  isCourseCompleted: () => boolean;
  course: any;
  courseId: string | undefined;
  currentLessonObj: any;
  newNote: string;
  setNewNote: (note: string) => void;
  setCurrentTime: (time: number) => void;
  loadLesson: (sectionIndex: number, lessonIndex: number) => void;
  videoRef: any;
  currentSection: number;
  allCourseNotes: any[];
  currentTime: number;
  addNote: () => void;
  currentLesson: number;
  enrollment: any;
  questionsData: any;
  questionsLoading: boolean;
  certificateStatus: any;
  user: any;
}

const TabsSection: React.FC<TabsSectionProps> = ({
  isMobile,
  isTablet,
  activeTab,
  setActiveTab,
  isCourseCompleted,
  course,
  courseId,
  currentLessonObj,
  newNote,
  setNewNote,
  setCurrentTime,
  loadLesson,
  videoRef,
  currentSection,
  allCourseNotes,
  currentTime,
  addNote,
  currentLesson,
  enrollment,
  questionsData,
  questionsLoading,
  certificateStatus,
  user,
}) => {
  const tabs = [
    "overview",
    "notes",
    "reviews",
    "qa",
    "resources",
    "announcements",
    ...(isCourseCompleted() && course?.certificateProvided
      ? ["certificate" as const]
      : []),
  ];

  return (
    <div
      className={`bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/30 shadow-xl ${
        isMobile ? "flex-1 flex flex-col" : ""
      }`}
    >
      {/* Tab Headers - Mobile Optimized */}
      <div className="flex border-b border-slate-800/30 overflow-x-auto scrollbar-hide scroll-smooth">
        {tabs.map((tab, index) => {
          return (
            <button
              key={index}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`group relative ${
                isMobile ? "px-4 py-3" : "px-6 lg:px-8 py-4 lg:py-5"
              } text-sm font-medium capitalize transition-all duration-300 cursor-pointer min-w-fit whitespace-nowrap overflow-hidden border-b-2 ${
                activeTab === tab
                  ? "text-slate-100 bg-slate-800/60 border-blue-400 shadow-lg"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-transparent hover:border-slate-600"
              }`}
            >
              <div className="flex items-center space-x-2 lg:space-x-3">
                {/* Icons for better UX */}
                <span
                  className={`${
                    activeTab === tab ? "font-semibold" : "font-medium"
                  } ${isMobile ? "text-xs" : "text-sm"}`}
                >
                  {tab === "qa" ? "Q&A" : tab}
                </span>
              </div>

              {/* Enhanced active indicator */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 transform origin-center transition-all duration-300 ${
                  activeTab === tab
                    ? "scale-x-100 opacity-100"
                    : "scale-x-0 opacity-0 group-hover:scale-x-75 group-hover:opacity-50"
                }`}
              ></div>

              {/* Subtle hover effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 transition-opacity duration-300 ${
                  activeTab === tab
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-50"
                }`}
              ></div>
            </button>
          );
        })}
      </div>

      {/* Tab Content - Responsive Padding */}
      <div
        className={`${
          isMobile ? "p-4 pb-8 flex-1" : isTablet ? "p-6 pb-8" : "p-8"
        } ${
          isMobile ? "min-h-0" : "min-h-80 lg:min-h-96"
        } bg-gradient-to-br from-slate-900/30 to-slate-800/20`}
      >
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="animate-fadeIn">
            <OverviewTab course={course} />
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === "notes" && (
          <div className="animate-fadeIn">
            <NotesTab
              newNote={newNote}
              setNewNote={setNewNote}
              setCurrentTime={setCurrentTime}
              loadLesson={loadLesson}
              videoRef={videoRef}
              course={course}
              currentSection={currentSection}
              allCourseNotes={allCourseNotes}
              currentTime={currentTime}
              addNote={addNote}
              currentLesson={currentLesson}
            />
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="animate-fadeIn">
            <ReviewTab
              course={course}
              enrollment={enrollment}
              courseId={courseId}
            />
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === "resources" && (
          <div className="animate-fadeIn">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">📁</span>
                </div>
                <h3
                  className={`${
                    isMobile ? "text-lg" : "text-xl"
                  } font-bold text-slate-100`}
                >
                  Lesson Resources
                </h3>
              </div>

              {currentLessonObj?.resources &&
              currentLessonObj.resources.length > 0 ? (
                <div className="grid gap-4 sm:gap-6">
                  {currentLessonObj.resources.map(
                    (resource: any, index: number) => (
                      <div
                        key={index}
                        className="transform transition-all duration-200 hover:scale-102"
                      >
                        <ResourceTab resource={resource} index={index} />
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-12 lg:py-16">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📁</span>
                  </div>
                  <p className="text-slate-400 text-sm lg:text-base">
                    No resources available for this lesson.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === "announcements" && (
          <div className="animate-fadeIn">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">📢</span>
                </div>
                <h3
                  className={`${
                    isMobile ? "text-lg" : "text-xl lg:text-2xl"
                  } font-bold text-slate-100`}
                >
                  Course Announcements
                </h3>
              </div>
              <AnnouncementsSection courseId={courseId!} />
            </div>
          </div>
        )}

        {/* Certificate Tab */}
        {activeTab === "certificate" && (
          <div className="animate-fadeIn">
            <div className="text-center space-y-8">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🏆</span>
                </div>
                <h3
                  className={`${
                    isMobile ? "text-lg" : "text-xl lg:text-2xl"
                  } font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent`}
                >
                  Course Certificate
                </h3>
              </div>

              <div className="mb-8">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <FaTrophy className="text-2xl lg:text-3xl text-white" />
                </div>
                <h4
                  className={`${
                    isMobile ? "text-xl" : "text-2xl"
                  } font-bold text-white mb-2`}
                >
                  Congratulations!
                </h4>
                <p className="text-slate-300 text-sm lg:text-base mb-6">
                  You've successfully completed this course.
                </p>
              </div>

              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-xl p-4 lg:p-6 border border-slate-600/30 backdrop-blur-sm shadow-2xl">
                {certificateStatus?.hasCertificate ? (
                  <CertificateIssued
                    certificateStatus={certificateStatus}
                    course={course}
                    user={user}
                  />
                ) : (
                  <CertificateNotIssued
                    user={user}
                    courseId={courseId}
                    isCourseCompleted={isCourseCompleted}
                    course={course}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Q&A Tab */}
        {activeTab === "qa" && (
          <div className="animate-fadeIn">
            <QaTab
              questionsData={questionsData}
              courseId={courseId}
              currentLessonObj={currentLessonObj}
              questionsLoading={questionsLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TabsSection;

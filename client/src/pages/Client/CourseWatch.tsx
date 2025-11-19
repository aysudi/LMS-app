import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useUserEnrollments,
  useEnrollmentNotes,
  useAddEnrollmentNote,
} from "../../hooks/useEnrollment";
import { FaList, FaTimes, FaTrophy } from "react-icons/fa";
import { useCourse } from "../../hooks/useCourseHooks";
import {
  useCompleteLessonProgress,
  useCourseProgress,
} from "../../hooks/useUserProgress";
import { useQuestionsByCourse } from "../../hooks/useQA";
import { useQAFilters } from "../../hooks/useQAHelpers";
import { CourseCompletionModal } from "../../components/Common/CourseCompletionModal";
import { useAuthContext } from "../../context/AuthContext";
import { useCertificateStatus } from "../../hooks/useCertificate";
import QuizComponent from "../../components/CourseDetails/QuizComponent";
import AnnouncementsSection from "../../components/Client/AnnouncementsSection";
import { Sidebar } from "lucide-react";
import formatTime from "../../utils/formatTime";
import LessonInfoSection from "../../components/Client/CourseWatch/LessonInfoSection";
import NotesTab from "../../components/Client/CourseWatch/NotesTab";
import QaTab from "../../components/Client/CourseWatch/QaTab";
import CertificateNotIssued from "../../components/Client/CourseWatch/CertificateNotIssued";
import CertificateIssued from "../../components/Client/CourseWatch/CertificateIssued";
import ResourceTab from "../../components/Client/CourseWatch/ResourceTab";
import OverviewTab from "../../components/Client/CourseWatch/OverviewTab";
import ReviewTab from "../../components/Client/CourseWatch/ReviewTab";
import Controls from "../../components/Client/CourseWatch/Controls";

const CourseWatch: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const { data: courseResponse, isLoading: courseLoading } = useCourse(
    courseId!
  );
  const course = courseResponse?.data;

  const { data: courseProgress, refetch: _ } = useCourseProgress(courseId!);

  const { data: enrollmentsResponse } = useUserEnrollments();
  const enrollment = enrollmentsResponse?.data?.enrollments?.find(
    (e: any) => e.course._id === courseId
  );

  const completeLessonMutation = useCompleteLessonProgress();
  const addNoteMutation = useAddEnrollmentNote();

  const [currentSection, setCurrentSection] = useState(0);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "notes"
    | "reviews"
    | "resources"
    | "announcements"
    | "qa"
    | "certificate"
  >("overview");

  const [newNote, setNewNote] = useState("");

  const { filters: qaFilters } = useQAFilters();

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [hasShownCompletionModal, setHasShownCompletionModal] = useState(false);

  const [lessonQuizStates, setLessonQuizStates] = useState<{
    [key: string]: { completed: boolean; passed: boolean };
  }>({});

  const currentLessonObj =
    course?.sections[currentSection]?.lessons[currentLesson];

  const { data: allNotesResponse } = useEnrollmentNotes(enrollment?.id || "");
  const allCourseNotes = allNotesResponse?.data || [];

  const { data: questionsData, isLoading: questionsLoading } =
    useQuestionsByCourse(courseId!, qaFilters, { enabled: !!courseId });

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (course && course.sections.length > 0) {
      loadLesson(0, 0);
    }
  }, [course]);

  useEffect(() => {
    if (courseId && user?.id) {
      const modalKey = `completion-modal-shown-${courseId}-${user.id}`;
      const hasShown = localStorage.getItem(modalKey) === "true";
      setHasShownCompletionModal(hasShown);
    }
  }, [courseId, user?.id]);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlayPause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          seek(currentTime - 10);
          break;
        case "ArrowRight":
          e.preventDefault();
          seek(currentTime + 10);
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "KeyM":
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("keydown", handleKeyPress);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, currentTime]);

  useEffect(() => {
    if (
      courseProgress?.data?.progressPercentage === 100 &&
      course &&
      user &&
      !hasShownCompletionModal &&
      !showCompletionModal
    ) {
      const timer = setTimeout(() => {
        setShowCompletionModal(true);
        const modalKey = `completion-modal-shown-${courseId}-${user.id}`;
        localStorage.setItem(modalKey, "true");
        setHasShownCompletionModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [
    courseProgress?.data?.progressPercentage,
    course,
    user,
    hasShownCompletionModal,
    showCompletionModal,
    courseId,
  ]);

  const loadLesson = (sectionIndex: number, lessonIndex: number) => {
    if (!course || !course.sections[sectionIndex]?.lessons[lessonIndex]) return;

    setCurrentSection(sectionIndex);
    setCurrentLesson(lessonIndex);

    const lesson = course.sections[sectionIndex].lessons[lessonIndex];
    const lessonId = lesson._id || lesson.id;

    setShowQuiz(false);
    const quizState = lessonQuizStates[lessonId];
    if (quizState) {
      setQuizCompleted(quizState.completed);
      setQuizPassed(quizState.passed);
    } else {
      setQuizCompleted(false);
      setQuizPassed(false);
    }

    const video = videoRef.current;

    if (video) {
      video.src = lesson.video.url;
      video.load();
      setCurrentTime(0);
      setIsPlaying(false);

      const progress = getLessonProgress(lessonId);
      if (progress && progress.watchTime > 0) {
        video.currentTime = Math.min(progress.watchTime, lesson.duration);
      }
    }

    window.history.replaceState(
      null,
      "",
      `/course/${courseId}/learn?section=${sectionIndex}&lesson=${lessonIndex}`
    );
  };

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const seek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(time, duration));
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!document.fullscreenElement) {
      video.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const markLessonComplete = () => {
    if (!isLessonCompleted() && canCompleteLesson()) {
      if (!course) return;
      const lesson = course.sections[currentSection]?.lessons[currentLesson];
      if (!lesson) return;
      completeLessonMutation.mutate({
        courseId: course.id,
        progressData: {
          lesson: lesson._id,
          watchTime: Math.floor(currentTime),
        },
      });
    }
  };

  const canCompleteLesson = () => {
    if (!currentLessonObj || !duration || duration === 0) return false;
    const remainingTime = duration - currentTime;
    const videoWatched = remainingTime <= 60; // 60 seconds = 1 minute

    if (currentLessonObj.quiz && currentLessonObj.quiz.length > 0) {
      return videoWatched && quizPassed;
    }

    return videoWatched;
  };

  const isLessonCompleted = () => {
    if (!currentLessonObj) return false;
    const lessonId = currentLessonObj._id;
    const progress = getLessonProgress(lessonId);
    return progress?.completed || false;
  };

  const goToNextLesson = () => {
    if (!course) return;

    const currentSectionObj = course.sections[currentSection];
    if (currentLesson < currentSectionObj.lessons.length - 1) {
      loadLesson(currentSection, currentLesson + 1);
    } else if (currentSection < course.sections.length - 1) {
      loadLesson(currentSection + 1, 0);
    } else {
      setShowCompletionModal(true);
    }
  };

  const addNote = () => {
    if (!newNote.trim() || !course || !enrollment) return;

    const lesson = course.sections[currentSection]?.lessons[currentLesson];
    if (!lesson) return;

    addNoteMutation.mutate(
      {
        enrollmentId: enrollment.id,
        noteData: {
          lesson: lesson._id,
          content: newNote.trim(),
          timestamp: Math.floor(currentTime),
        },
      },
      {
        onSuccess: () => {
          setNewNote("");
        },
      }
    );
  };

  const isCourseCompleted = () => {
    if (!course || !courseProgress) return false;

    return true ? courseProgress?.data?.progressPercentage == 100 : false;
  };

  const { data: certificateStatus } = useCertificateStatus(
    courseId || "",
    user?.id || "",
    !!courseId && !!user?.id && isCourseCompleted()
  );

  const getLessonProgress = (lessonId: string) => {
    return courseProgress?.data?.lessons?.find(
      (p: any) => p.lessonId === lessonId
    );
  };

  if (courseLoading || !course) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading course...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Video Player */}
      <div className={`flex-1 relative ${showSidebar ? "mr-87" : ""}`}>
        {/* Top Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl z-30 border-b border-slate-800/50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/my-learning")}
                className="group flex items-center space-x-2 text-slate-400 hover:text-slate-200 transition-all duration-200 cursor-pointer hover:bg-slate-800/50 px-3 py-2 rounded-lg"
              >
                <span className="text-lg group-hover:translate-x-[-2px] transition-transform duration-200">
                  ←
                </span>
                <span className="hidden sm:inline">Back to My Learning</span>
              </button>
              <div className="h-4 w-px bg-slate-700"></div>
              <h1 className="text-lg font-semibold truncate max-w-96 text-slate-100">
                {course.title}
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              <div className="px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/50 text-sm text-slate-300 font-medium">
                {currentSection + 1}.{currentLesson + 1} /{" "}
                {course.sections.reduce(
                  (total, section) => total + section.lessons.length,
                  0
                )}
              </div>
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-all duration-200 cursor-pointer"
              >
                <FaList className="text-sm" />
              </button>
            </div>
          </div>
        </div>

        <div className="relative h-screen pt-16">
          {showQuiz && currentLessonObj?.quiz ? (
            <div className="w-full h-full">
              <QuizComponent
                questions={currentLessonObj.quiz.map(
                  (q: any, index: number) => ({
                    id: `${currentLessonObj._id}-${index}`,
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                  })
                )}
                onQuizComplete={(_: number, passed: boolean) => {
                  setQuizCompleted(true);
                  setQuizPassed(passed);

                  if (currentLessonObj) {
                    const lessonId =
                      currentLessonObj._id || currentLessonObj.id;
                    setLessonQuizStates((prev) => ({
                      ...prev,
                      [lessonId]: { completed: true, passed },
                    }));
                  }
                }}
                onClose={() => {
                  setShowQuiz(false);
                  const video = videoRef.current;
                  if (video && currentLessonObj) {
                    const currentSrc = video.src;
                    video.src = "";
                    video.src = currentSrc;
                    video.load();
                  }
                }}
                timeLimit={300} // 5 minutes
                title={`${currentLessonObj.title} - Quiz`}
              />
            </div>
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full object-contain bg-black cursor-pointer"
              onClick={togglePlayPause}
              onTimeUpdate={(e) => {
                const video = e.target as HTMLVideoElement;
                setCurrentTime(video.currentTime);
              }}
              onLoadedMetadata={(e) => {
                const video = e.target as HTMLVideoElement;
                setDuration(video.duration);
              }}
              onEnded={() => {
                setIsPlaying(false);
                if (
                  currentLessonObj?.quiz &&
                  currentLessonObj.quiz.length > 0 &&
                  !quizCompleted
                ) {
                  setShowQuiz(true);
                } else {
                  goToNextLesson();
                }
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          )}

          {/* Video Controls */}
          <Controls
            showControls={showControls}
            course={course}
            currentLesson={currentLesson}
            videoRef={videoRef}
            setIsMuted={setIsMuted}
            duration={duration}
            currentTime={currentTime}
            seek={seek}
            goToNextLesson={goToNextLesson}
            togglePlayPause={togglePlayPause}
            toggleMute={toggleMute}
            isMuted={isMuted}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
            loadLesson={loadLesson}
            currentSection={currentSection}
            setCurrentTime={setCurrentTime}
            isPlaying={isPlaying}
          />
        </div>

        {/* Lesson Info Section Below Video */}
        <LessonInfoSection
          course={course}
          currentSection={currentSection}
          currentLesson={currentLesson}
          isLessonCompleted={isLessonCompleted()}
          markLessonComplete={markLessonComplete}
          canCompleteLesson={canCompleteLesson()}
          showNotes={showNotes}
          setShowNotes={setShowNotes}
          currentLessonObj={currentLessonObj}
          quizPassed={quizPassed}
          quizCompleted={quizCompleted}
          setActiveTab={setActiveTab}
          getLessonProgress={getLessonProgress}
          setShowQuiz={setShowQuiz}
          showQuiz={showQuiz}
        />

        {/* Tabs Section Below Video */}
        <div className="bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/30">
          {/* Tab Headers */}
          <div className="flex border-b border-slate-800/30 overflow-x-auto scrollbar-hide">
            {[
              "overview",
              "notes",
              "reviews",
              "qa",
              "resources",
              "announcements",
              ...(isCourseCompleted() ? ["certificate" as const] : []),
            ].map((tab, index) => {
              return (
                <button
                  key={index}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`group relative px-8 py-5 text-sm font-medium capitalize transition-all duration-300 cursor-pointer min-w-fit whitespace-nowrap overflow-hidden ${
                    activeTab === tab
                      ? "text-slate-100 bg-slate-800/50 border-b-2 border-blue-400"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 transition-all duration-300"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`${
                        activeTab === tab ? "font-semibold" : "font-medium"
                      }`}
                    >
                      {tab === "qa" ? "Q&A" : tab}
                    </span>
                  </div>
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 transform origin-left transition-transform duration-300 ${
                      activeTab === tab
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  ></div>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-8 min-h-96 bg-slate-900/20">
            {activeTab === "overview" && <OverviewTab course={course} />}

            {activeTab === "notes" && (
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
            )}

            {activeTab === "reviews" && (
              <ReviewTab
                course={course}
                enrollment={enrollment}
                courseId={courseId}
              />
            )}

            {activeTab === "resources" && (
              <div>
                <h3 className="text-xl font-bold mb-4">Lesson Resources</h3>
                {currentLessonObj?.resources &&
                currentLessonObj.resources.length > 0 ? (
                  <div className="space-y-3">
                    {currentLessonObj.resources.map(
                      (resource: any, index: number) => (
                        <ResourceTab resource={resource} index={index} />
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">
                    No resources available for this lesson.
                  </p>
                )}
              </div>
            )}

            {activeTab === "announcements" && (
              <div>
                <h3 className="text-2xl font-bold mb-6 text-slate-100">
                  📢 Course Announcements
                </h3>
                <AnnouncementsSection courseId={courseId!} />
              </div>
            )}

            {activeTab === "certificate" && (
              <div>
                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  🎉 Course Certificate
                </h3>
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaTrophy className="text-3xl text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Congratulations!
                    </h3>
                    <p className="text-gray-300 mb-6">
                      You've successfully completed this course.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-xl p-6 border border-slate-600/30 backdrop-blur-sm">
                    {certificateStatus?.hasCertificate ? (
                      // Certificate already issued
                      <CertificateIssued
                        certificateStatus={certificateStatus}
                        course={course}
                        user={user}
                      />
                    ) : (
                      // Certificate not yet issued
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

            {activeTab === "qa" && (
              <QaTab
                questionsData={questionsData}
                courseId={courseId}
                currentLessonObj={currentLessonObj}
                questionsLoading={questionsLoading}
              />
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <Sidebar
          currentSection={currentSection}
          currentLesson={currentLesson}
          setShowSidebar={setShowSidebar}
          getLessonProgress={getLessonProgress}
          loadLesson={loadLesson}
          lessonQuizStates={lessonQuizStates}
          course={course}
          courseId={courseId}
        />
      )}

      {/* Notes Panel */}
      {showNotes && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Lesson Notes</h3>
              <button
                onClick={() => setShowNotes(false)}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note at current time..."
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg resize-none h-20"
              />
              <button
                onClick={addNote}
                className="mt-2 w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg cursor-pointer"
              >
                Add Note
              </button>
            </div>

            <div className="space-y-2">
              {allCourseNotes.map((note: any, index: number) => (
                <div key={index} className="p-3 bg-gray-700 rounded-lg">
                  <p className="text-sm mb-1">{note.content}</p>
                  <p className="text-xs text-gray-400">
                    {formatTime(note.timestamp)} •{" "}
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Course Completion Modal */}
      {course && user && (
        <CourseCompletionModal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          course={course}
          userId={user.id}
          userEmail={user.email}
          studentName={`${user.firstName} ${user.lastName}`}
        />
      )}
    </div>
  );
};

export default CourseWatch;

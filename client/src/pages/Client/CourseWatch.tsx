import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  useUserEnrollments,
  useEnrollmentNotes,
  useAddEnrollmentNote,
} from "../../hooks/useEnrollment";
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
import LessonInfoSection from "../../components/Client/CourseWatch/LessonInfoSection";
import { trackWatchTime } from "../../services/course.service";
import Sidebar from "../../components/Client/CourseWatch/Sidebar";
import CourseWatchHeader from "../../components/CourseWatch/CourseWatchHeader";
import VideoPlayer from "../../components/CourseWatch/VideoPlayer";
import TabsSection from "../../components/CourseWatch/TabsSection";
import NotesModal from "../../components/CourseWatch/NotesModal";
import "../../styles/courseWatch.css";

const CourseWatch: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuthContext();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(
    window.innerWidth >= 768 && window.innerWidth < 1024
  );

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
  const [showSidebar, setShowSidebar] = useState(!isMobile && !isTablet);
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
    [key: string]: { completed: boolean; passed: boolean; score: number };
  }>({});

  const [lastTimeUpdate, setLastTimeUpdate] = useState(0);
  const stuckCheckRef = useRef<NodeJS.Timeout | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [watchTimeTracker, setWatchTimeTracker] = useState(0);
  const lastWatchTimeUpdate = useRef(0);

  useEffect(() => {
    if (courseId && user?.id) {
      const savedQuizStates = localStorage.getItem(
        `quiz-states-${courseId}-${user.id}`
      );
      if (savedQuizStates) {
        try {
          setLessonQuizStates(JSON.parse(savedQuizStates));
        } catch (error) {
          console.error("Error loading quiz states:", error);
        }
      }
    }
  }, [courseId, user?.id]);

  const currentLessonObj =
    course?.sections[currentSection]?.lessons[currentLesson];

  const { data: allNotesResponse } = useEnrollmentNotes(enrollment?.id || "");
  const allCourseNotes = allNotesResponse?.data || [];

  const { data: questionsData, isLoading: questionsLoading } =
    useQuestionsByCourse(courseId!, qaFilters, { enabled: !!courseId });

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);

      if (width < 1024) {
        setShowSidebar(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (course && course.sections.length > 0) {
      loadLesson(0, 0);
    }
  }, [course]);

  useEffect(() => {
    const video = videoRef.current;
    if (video && currentLessonObj && !video.src) {
      video.src = currentLessonObj.video.url;
      video.load();
    }
  }, [currentLessonObj]);

  useEffect(() => {
    const video = videoRef.current;

    return () => {
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
      if (stuckCheckRef.current) {
        clearTimeout(stuckCheckRef.current);
        stuckCheckRef.current = null;
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [currentSection, currentLesson]);

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

  useEffect(() => {
    if (watchTimeTracker > 0 && courseId) {
      const interval = setInterval(async () => {
        if (watchTimeTracker >= 30) {
          await trackWatchTime(courseId, watchTimeTracker, user?.id);
          setWatchTimeTracker(0);
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [watchTimeTracker, courseId, user?.id]);

  const loadLesson = (sectionIndex: number, lessonIndex: number) => {
    if (!course || !course.sections[sectionIndex]?.lessons[lessonIndex]) return;

    setCurrentSection(sectionIndex);
    setCurrentLesson(lessonIndex);

    const lesson = course.sections[sectionIndex].lessons[lessonIndex];
    const lessonId = lesson._id || lesson.id;

    if (!lesson.video?.url) {
      console.error("No video URL found for lesson:", lesson.title);
      return;
    }

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
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setRetryCount(0);

      video.pause();

      setIsVideoLoading(true);
      video.src = lesson.video.url;
      video.load();

      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      loadingTimeoutRef.current = setTimeout(() => {
        if (isVideoLoading && !duration) {
          console.warn("Video loading timeout, trying refresh...");
          refreshVideo();
        }
      }, 10000); // 10 second timeout

      const handleLoadedMetadata = () => {
        const progress = getLessonProgress(lessonId);
        if (progress && progress.watchTime > 0) {
          video.currentTime = Math.min(
            progress.watchTime,
            lesson.duration || video.duration
          );
        }
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };

      video.addEventListener("loadedmetadata", handleLoadedMetadata);
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
      video.play().catch((error) => {
        console.error("Error playing video:", error);
        setIsPlaying(false);
      });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const seek = (time: number) => {
    const video = videoRef.current;
    if (!video || !duration || isNaN(time)) return;

    const seekTime = Math.max(0, Math.min(time, duration));

    try {
      video.currentTime = seekTime;
    } catch (error) {
      console.error("Error seeking video:", error);
    }
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

      const wasAlreadyCompleted = isLessonCompleted();

      completeLessonMutation.mutate(
        {
          courseId: course.id,
          progressData: {
            lesson: lesson._id,
            watchTime: Math.floor(currentTime),
          },
        },
        {
          onSuccess: () => {
            if (!wasAlreadyCompleted && lesson.quiz && lesson.quiz.length > 0) {
              const lessonId = lesson._id || lesson.id;
              const quizState = lessonQuizStates[lessonId];
              if (!quizState?.completed) {
                setShowQuiz(true);
              }
            }
          },
        }
      );
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

  const canTakeQuiz = () => {
    if (
      !currentLessonObj ||
      !currentLessonObj.quiz ||
      currentLessonObj.quiz.length === 0
    )
      return false;

    if (isLessonCompleted()) return true;

    if (!duration || duration === 0) return false;
    const remainingTime = duration - currentTime;
    const videoWatched = remainingTime <= 60; // 60 seconds = 1 minute

    return videoWatched;
  };

  const refreshVideo = () => {
    const video = videoRef.current;
    if (!video || !currentLessonObj) return;

    const currentVideoTime = video.currentTime || currentTime;
    const wasPlaying = !video.paused;

    setIsPlaying(false);
    setDuration(0);
    setCurrentTime(0);

    video.pause();

    const videoUrl = currentLessonObj.video.url;
    video.src = videoUrl;
    video.load();

    const handleCanPlay = () => {
      if (currentVideoTime > 0 && video.duration > currentVideoTime) {
        video.currentTime = currentVideoTime;
      }
      if (wasPlaying) {
        video.play().catch((error) => {
          console.error("Error playing video after refresh:", error);
        });
      }
      video.removeEventListener("canplay", handleCanPlay);
    };

    const handleError = () => {
      console.error("Video error after refresh");
      video.removeEventListener("error", handleError);
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);
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
    !!courseId &&
      !!user?.id &&
      isCourseCompleted() &&
      !!course?.certificateProvided
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Main Layout */}
      <div
        className={`flex  transition-all duration-300 ease-in-out ${
          showSidebar && !isMobile ? "lg:mr-80 xl:mr-96" : ""
        }`}
      >
        {/* Video Player Container */}
        <div className={`flex-1 relative`}>
          <CourseWatchHeader
            course={course}
            currentSection={currentSection}
            currentLesson={currentLesson}
            showSidebar={showSidebar}
            setShowSidebar={setShowSidebar}
            isMobile={isMobile}
          />

          <VideoPlayer
            lastTimeUpdate={lastTimeUpdate}
            isMobile={isMobile}
            isTablet={isTablet}
            showQuiz={showQuiz}
            currentLessonObj={currentLessonObj}
            lessonQuizStates={lessonQuizStates}
            courseId={courseId}
            user={user}
            setQuizCompleted={setQuizCompleted}
            setQuizPassed={setQuizPassed}
            setLessonQuizStates={setLessonQuizStates}
            setShowQuiz={setShowQuiz}
            videoRef={videoRef}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            isMuted={isMuted}
            isFullscreen={isFullscreen}
            showControls={showControls}
            retryCount={retryCount}
            setCurrentTime={setCurrentTime}
            setDuration={setDuration}
            setIsVideoLoading={setIsVideoLoading}
            setIsPlaying={setIsPlaying}
            setRetryCount={setRetryCount}
            setLastTimeUpdate={setLastTimeUpdate}
            setWatchTimeTracker={setWatchTimeTracker}
            lastWatchTimeUpdate={lastWatchTimeUpdate}
            loadingTimeoutRef={loadingTimeoutRef}
            stuckCheckRef={stuckCheckRef}
            refreshVideo={refreshVideo}
            isLessonCompleted={isLessonCompleted}
            canCompleteLesson={canCompleteLesson}
            markLessonComplete={markLessonComplete}
            goToNextLesson={goToNextLesson}
            getLessonProgress={getLessonProgress}
            togglePlayPause={togglePlayPause}
            seek={seek}
            toggleMute={toggleMute}
            toggleFullscreen={toggleFullscreen}
            loadLesson={loadLesson}
            course={course}
            currentSection={currentSection}
            currentLesson={currentLesson}
          />

          {/* Lesson Info Section Below Video - Responsive */}
          <LessonInfoSection
            course={course}
            currentSection={currentSection}
            currentLesson={currentLesson}
            isLessonCompleted={isLessonCompleted}
            markLessonComplete={markLessonComplete}
            canCompleteLesson={canCompleteLesson}
            canTakeQuiz={canTakeQuiz}
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

          {/* Tabs Section - Enhanced Responsive Design */}
          <TabsSection
            isMobile={isMobile}
            isTablet={isTablet}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isCourseCompleted={isCourseCompleted}
            course={course}
            courseId={courseId}
            currentLessonObj={currentLessonObj}
            newNote={newNote}
            setNewNote={setNewNote}
            setCurrentTime={setCurrentTime}
            loadLesson={loadLesson}
            videoRef={videoRef}
            currentSection={currentSection}
            allCourseNotes={allCourseNotes}
            currentTime={currentTime}
            addNote={addNote}
            currentLesson={currentLesson}
            enrollment={enrollment}
            questionsData={questionsData}
            questionsLoading={questionsLoading}
            certificateStatus={certificateStatus}
            user={user}
          />
        </div>

        {/* Enhanced Responsive Sidebar */}
        {showSidebar && (
          <div
            className={`fixed inset-y-0 right-0 z-50 transition-transform duration-300 ease-in-out transform ${
              showSidebar ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Backdrop for mobile */}
            {(isMobile || isTablet) && (
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowSidebar(false)}
              />
            )}

            {/* Sidebar Content */}
            <div
              className={`relative ${
                isMobile
                  ? "w-full max-w-sm"
                  : isTablet
                  ? "w-80"
                  : "w-80 xl:w-96"
              } h-full`}
            >
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
            </div>
          </div>
        )}

        {/* Enhanced Notes Panel - Mobile Optimized */}
        <NotesModal
          showNotes={showNotes}
          setShowNotes={setShowNotes}
          isMobile={isMobile}
          newNote={newNote}
          setNewNote={setNewNote}
          currentTime={currentTime}
          addNote={addNote}
          allCourseNotes={allCourseNotes}
        />

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
    </div>
  );
};

export default CourseWatch;

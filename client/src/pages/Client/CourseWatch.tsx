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
import QuizComponent from "../../components/Client/CourseWatch/QuizComponent";
import AnnouncementsSection from "../../components/Client/CourseWatch/AnnouncementsSection";
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
import { trackWatchTime } from "../../services/course.service";
import Sidebar from "../../components/Client/CourseWatch/Sidebar";
import "../../styles/courseWatch.css";

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

  // Load quiz states from localStorage on component mount
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

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);

      // Auto-hide sidebar on mobile/tablet
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

  // Cleanup effect for video element
  useEffect(() => {
    const video = videoRef.current;

    return () => {
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
      // Clear stuck check timeout
      if (stuckCheckRef.current) {
        clearTimeout(stuckCheckRef.current);
        stuckCheckRef.current = null;
      }
      // Clear loading timeout
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

  // Track watch time for analytics (send every 30 seconds)
  useEffect(() => {
    if (watchTimeTracker > 0 && courseId) {
      const interval = setInterval(async () => {
        if (watchTimeTracker >= 30) {
          await trackWatchTime(courseId, watchTimeTracker, user?.id);
          setWatchTimeTracker(0); // Reset after sending
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
      // Properly reset video state
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setRetryCount(0);

      // Pause video first to prevent any race conditions
      video.pause();

      // Simple and reliable video loading
      setIsVideoLoading(true);
      video.src = lesson.video.url;
      video.load();

      // Set a timeout to handle long loading times
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      loadingTimeoutRef.current = setTimeout(() => {
        if (isVideoLoading && !duration) {
          console.warn("Video loading timeout, trying refresh...");
          refreshVideo();
        }
      }, 10000); // 10 second timeout

      // Set initial time after metadata loads
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
            // Show quiz after first completion if lesson has quiz and wasn't previously completed
            if (!wasAlreadyCompleted && lesson.quiz && lesson.quiz.length > 0) {
              const lessonId = lesson._id || lesson.id;
              const quizState = lessonQuizStates[lessonId];
              // Only show quiz if it hasn't been completed yet
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

    // If lesson is completed, quiz is always accessible
    if (isLessonCompleted()) return true;

    // If lesson not completed, need to watch video first
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Main Layout */}
      <div
        className={`flex  transition-all duration-300 ease-in-out ${
          showSidebar && !isMobile ? "lg:mr-80 xl:mr-96" : ""
        }`}
      >
        {/* Video Player Container */}
        <div className={`flex-1 relative`}>
          {/* Top Navigation Bar - Responsive */}
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
                      (total, section) => total + section.lessons.length,
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

          {/* Video Player Section - Responsive */}
          <div
            className={`relative ${
              isMobile
                ? "h-56 pt-16"
                : isTablet
                ? "h-80 pt-16"
                : "h-screen pt-16"
            }`}
          >
            {showQuiz && currentLessonObj?.quiz ? (
              <div className="w-full h-full bg-slate-800 rounded-lg overflow-hidden">
                <QuizComponent
                  questions={currentLessonObj.quiz.map(
                    (q: any, index: number) => ({
                      id: `${currentLessonObj._id}-${index}`,
                      question: q.question,
                      options: q.options,
                      correctAnswer: q.correctAnswer,
                    })
                  )}
                  onQuizComplete={(score: number, passed: boolean) => {
                    setQuizCompleted(true);
                    setQuizPassed(passed);

                    if (currentLessonObj) {
                      const lessonId =
                        currentLessonObj._id || currentLessonObj.id;
                      // If quiz was previously passed, keep it as passed regardless of current score
                      const previousState = lessonQuizStates[lessonId];
                      const shouldKeepPassed =
                        previousState?.passed && previousState.completed;

                      const newQuizStates = {
                        ...lessonQuizStates,
                        [lessonId]: {
                          completed: true,
                          passed: shouldKeepPassed || passed,
                          score: Math.max(score, previousState?.score || 0), // Keep highest score
                        },
                      };

                      setLessonQuizStates(newQuizStates);

                      // Save to localStorage for persistence
                      if (courseId && user?.id) {
                        localStorage.setItem(
                          `quiz-states-${courseId}-${user.id}`,
                          JSON.stringify(newQuizStates)
                        );
                      }
                    }
                  }}
                  onClose={() => {
                    setShowQuiz(false);
                    // No need to manipulate video source - just hide quiz
                  }}
                  timeLimit={30}
                  title={`${currentLessonObj.title} - Quiz`}
                />
              </div>
            ) : !currentLessonObj?.video?.url ? (
              <div className="relative w-full h-full bg-black rounded-lg overflow-hidden shadow-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-red-400 text-xl mb-4">⚠️</div>
                  <p className="text-slate-300 mb-4">
                    No video available for this lesson
                  </p>
                  <p className="text-slate-500 text-sm">
                    Lesson: {currentLessonObj?.title || "Unknown"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full bg-black rounded-lg overflow-hidden shadow-2xl">
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={togglePlayPause}
                  preload="metadata"
                  playsInline
                  muted={false}
                  onTimeUpdate={(e) => {
                    const video = e.target as HTMLVideoElement;
                    if (video && !isNaN(video.currentTime)) {
                      setCurrentTime(video.currentTime);
                      setLastTimeUpdate(Date.now());

                      // Track watch time every 10 seconds
                      const now = Date.now();
                      if (
                        isPlaying &&
                        now - lastWatchTimeUpdate.current >= 10000
                      ) {
                        lastWatchTimeUpdate.current = now;
                        setWatchTimeTracker((prev) => prev + 10);
                      }

                      // Clear any existing stuck check
                      if (stuckCheckRef.current) {
                        clearTimeout(stuckCheckRef.current);
                      }
                    }
                  }}
                  onLoadedMetadata={(e) => {
                    const video = e.target as HTMLVideoElement;
                    if (video && !isNaN(video.duration) && video.duration > 0) {
                      setDuration(video.duration);
                      setIsVideoLoading(false);
                      if (loadingTimeoutRef.current) {
                        clearTimeout(loadingTimeoutRef.current);
                      }
                    }
                  }}
                  onCanPlay={() => {
                    // Video is ready to play - reset retry count on success
                    setRetryCount(0);
                    setIsVideoLoading(false);
                    if (loadingTimeoutRef.current) {
                      clearTimeout(loadingTimeoutRef.current);
                    }
                    const video = videoRef.current;
                    if (video && !isNaN(video.duration) && video.duration > 0) {
                      setDuration(video.duration);
                    }
                  }}
                  onError={(e) => {
                    const video = e.target as HTMLVideoElement;
                    console.error("Video error:", {
                      error: video.error,
                      networkState: video.networkState,
                      readyState: video.readyState,
                      src: video.src,
                    });
                    setIsPlaying(false);

                    // Auto-retry up to 3 times
                    if (retryCount < 3) {
                      setTimeout(() => {
                        setRetryCount((prev) => prev + 1);
                        refreshVideo();
                      }, 2000);
                    } else {
                      console.error("Video failed to load after 3 attempts");
                    }
                  }}
                  onLoadStart={() => {
                    setIsPlaying(false);
                    setIsVideoLoading(true);
                  }}
                  onEnded={() => {
                    setIsPlaying(false);

                    // Auto-complete lesson if not already completed
                    if (!isLessonCompleted() && canCompleteLesson()) {
                      markLessonComplete();
                    }

                    // Show quiz only if lesson has quiz and it's first time watching (not completed before)
                    if (
                      currentLessonObj?.quiz &&
                      currentLessonObj.quiz.length > 0
                    ) {
                      const lessonId =
                        currentLessonObj._id || currentLessonObj.id;
                      const quizState = lessonQuizStates[lessonId];
                      const lessonProgress = getLessonProgress(lessonId);

                      // Show quiz if it hasn't been completed OR if lesson wasn't previously completed
                      if (!quizState?.completed || !lessonProgress?.completed) {
                        setShowQuiz(true);
                        return; // Don't auto-advance to next lesson
                      }
                    }

                    // If no quiz or quiz already completed, go to next lesson after a short delay
                    setTimeout(() => {
                      goToNextLesson();
                    }, 1000);
                  }}
                  onPlay={() => {
                    setIsPlaying(true);
                    // Start monitoring for stuck video
                    stuckCheckRef.current = setTimeout(() => {
                      const now = Date.now();
                      const timeSinceUpdate = now - lastTimeUpdate;
                      const video = videoRef.current;

                      // If video should be playing but hasn't updated time in 5 seconds, it might be stuck
                      if (
                        timeSinceUpdate > 5000 &&
                        video &&
                        !video.paused &&
                        !video.ended
                      ) {
                        console.warn(
                          "Video appears to be stuck, attempting refresh..."
                        );
                        refreshVideo();
                      }
                    }, 6000);
                  }}
                  onPause={() => {
                    setIsPlaying(false);
                    // Clear stuck check when paused
                    if (stuckCheckRef.current) {
                      clearTimeout(stuckCheckRef.current);
                      stuckCheckRef.current = null;
                    }
                  }}
                />

                {/* Video Loading Overlay */}
                {!duration && currentLessonObj && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-slate-300">
                        Loading video...
                        {retryCount > 0 && ` (Retry ${retryCount}/3)`}
                      </p>
                      <p className="text-slate-500 text-sm mt-2 max-w-md">
                        {currentLessonObj?.title}
                      </p>
                      <button
                        onClick={() => {
                          refreshVideo();
                        }}
                        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                      >
                        Refresh Video
                      </button>
                      <button
                        onClick={() => {
                          const video = videoRef.current;
                          if (video && currentLessonObj) {
                            console.log("Video Debug Info:", {
                              src: video.src,
                              currentSrc: video.currentSrc,
                              networkState: video.networkState,
                              readyState: video.readyState,
                              error: video.error,
                              duration: video.duration,
                              currentTime: video.currentTime,
                              paused: video.paused,
                              lessonUrl: currentLessonObj.video?.url,
                            });
                          }
                        }}
                        className="mt-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 text-sm"
                      >
                        Debug Info
                      </button>
                      {retryCount >= 3 && (
                        <p className="text-red-400 text-sm mt-2">
                          Video failed to load after multiple attempts. Try
                          refreshing the page.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Video Error/Stuck Detection */}
                {duration > 0 && currentLessonObj && (
                  <div className="absolute top-4 right-4 opacity-50 hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={refreshVideo}
                      className="p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg text-xs"
                      title="Refresh video if it's not working"
                    >
                      🔄
                    </button>
                  </div>
                )}

                {/* Video Controls - Enhanced for Mobile */}
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
            )}
          </div>

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
          <div
            className={`bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/30 shadow-xl ${
              isMobile ? "flex-1 flex flex-col" : ""
            }`}
          >
            {/* Tab Headers - Mobile Optimized */}
            <div className="flex border-b border-slate-800/30 overflow-x-auto scrollbar-hide scroll-smooth">
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
        {showNotes && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
              className={`bg-slate-800/95 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-2xl ${
                isMobile ? "w-full max-w-sm max-h-[80vh]" : "w-96 max-h-96"
              } overflow-hidden`}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 lg:p-6 border-b border-slate-700/50 bg-slate-900/50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">📝</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100">
                    Lesson Notes
                  </h3>
                </div>
                <button
                  onClick={() => setShowNotes(false)}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <FaTimes className="text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 lg:p-6 overflow-y-auto max-h-80">
                {/* Add Note Form */}
                <div className="mb-6">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note at current time..."
                    className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg resize-none h-20 text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    onClick={addNote}
                    disabled={!newNote.trim()}
                    className="mt-3 w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg cursor-pointer font-medium transition-all duration-200 transform hover:scale-105 active:scale-95"
                  >
                    Add Note at {formatTime(currentTime)}
                  </button>
                </div>

                {/* Notes List */}
                <div className="space-y-3">
                  {allCourseNotes.length > 0 ? (
                    allCourseNotes.map((note: any, index: number) => (
                      <div
                        key={index}
                        className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:bg-slate-700/50 transition-colors"
                      >
                        <p className="text-sm text-slate-200 mb-2">
                          {note.content}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                          <span className="font-mono">
                            {formatTime(note.timestamp)}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 mx-auto mb-3 bg-slate-700/50 rounded-full flex items-center justify-center">
                        <span className="text-lg">📝</span>
                      </div>
                      <p className="text-slate-400 text-sm">
                        No notes yet. Add your first note!
                      </p>
                    </div>
                  )}
                </div>
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
    </div>
  );
};

export default CourseWatch;

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useUserEnrollments,
  useEnrollmentNotes,
  useEnrollmentReviews,
  useAddEnrollmentNote,
  useAddCourseReview,
} from "../../hooks/useEnrollment";
import {
  FaPlay,
  FaPause,
  FaExpand,
  FaCompress,
  FaVolumeUp,
  FaVolumeMute,
  FaQuestionCircle,
  FaNotesMedical,
  FaCheck,
  FaList,
  FaTimes,
  FaStepBackward,
  FaStepForward,
} from "react-icons/fa";
import { useCourse } from "../../hooks/useCourseHooks";
import {
  useCompleteLessonProgress,
  useCourseProgress,
} from "../../hooks/useUserProgress";
import {
  useQuestionsByCourse,
  useQuestionDetails,
  useCreateQuestion,
  useVoteOnQuestion,
  useVoteOnAnswer,
  useAcceptAnswer,
} from "../../hooks/useQA";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as qaService from "../../services/qa.service";
import { useQAFilters, useQAFormState } from "../../hooks/useQAHelpers";
import { HTMLRenderer } from "../../utils/htmlRenderer";
import { CourseCompletionModal } from "../../components/Common/CourseCompletionModal";
import { useAuthContext } from "../../context/AuthContext";
import QuizComponent from "../../components/CourseDetails/QuizComponent";

// Answers Section Component
const AnswersSection: React.FC<{
  question: any;
  onVoteAnswer: (answerId: string, voteType: "upvote" | "downvote") => void;
  onAcceptAnswer: (questionId: string, answerId: string) => void;
}> = ({ question, onVoteAnswer, onAcceptAnswer }) => {
  const { data: questionDetails, isLoading } = useQuestionDetails(question._id);

  if (isLoading) {
    return (
      <div className="mt-4 p-4 bg-gray-900/20 rounded-xl border border-gray-600/30">
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  const answers = questionDetails?.data?.answers || [];

  if (answers.length === 0) {
    return (
      <div className="mt-4 p-4 bg-gray-900/20 rounded-xl border border-gray-600/30">
        <div className="text-center py-6">
          <div className="text-4xl mb-2">💭</div>
          <p className="text-gray-400">No answers yet. Be the first to help!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-gray-900/20 rounded-xl border border-gray-600/30">
      <div className="flex items-center justify-between mb-4">
        <h5 className="font-semibold text-purple-300 flex items-center space-x-2">
          <span>💬</span>
          <span>
            {answers.length} Answer{answers.length !== 1 ? "s" : ""}
          </span>
        </h5>
      </div>

      <div className="space-y-4">
        {answers.map((answer: any) => (
          <div
            key={answer._id}
            className={`p-4 rounded-xl border transition-all ${
              answer.isAccepted
                ? "bg-green-900/20 border-green-500/30"
                : "bg-gray-800/30 border-gray-600/30 hover:border-purple-500/30"
            }`}
          >
            <div className="flex items-start space-x-4">
              {/* Vote Section */}
              <div className="flex flex-col items-center space-y-1 min-w-12">
                <button
                  onClick={() => onVoteAnswer(answer._id, "upvote")}
                  className={`p-1 rounded transition-all hover:scale-110 ${
                    answer.userVoteType === "upvote"
                      ? "bg-green-500/20 text-green-400"
                      : "text-gray-400 hover:bg-green-500/10 hover:text-green-400"
                  }`}
                >
                  ▲
                </button>
                <span
                  className={`font-bold text-sm ${
                    answer.voteScore > 0
                      ? "text-green-400"
                      : answer.voteScore < 0
                      ? "text-red-400"
                      : "text-gray-400"
                  }`}
                >
                  {answer.voteScore}
                </span>
                <button
                  onClick={() => onVoteAnswer(answer._id, "downvote")}
                  className={`p-1 rounded transition-all hover:scale-110 ${
                    answer.userVoteType === "downvote"
                      ? "bg-red-500/20 text-red-400"
                      : "text-gray-400 hover:bg-red-500/10 hover:text-red-400"
                  }`}
                >
                  ▼
                </button>
              </div>

              {/* Answer Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {answer.user.firstName?.[0] || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {answer.user.firstName} {answer.user.lastName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(answer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {answer.isAccepted && (
                    <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30 text-sm">
                      <span>✓</span>
                      <span>Accepted Answer</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-300 leading-relaxed mb-3">
                  {answer.content}
                </p>

                {/* Accept Answer Button (only show to question author) */}
                {!answer.isAccepted && question.user && (
                  <button
                    onClick={() => onAcceptAnswer(question._id, answer._id)}
                    className="text-sm px-3 py-1 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-all border border-green-500/30 hover:border-green-400/50"
                  >
                    ✓ Accept Answer
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CourseWatch: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);

  const {
    data: courseResponse,
    isLoading: courseLoading,
    refetch: refetchCourse,
  } = useCourse(courseId!);
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
  const [activeTab, setActiveTab] = useState<
    "overview" | "notes" | "reviews" | "resources" | "announcements" | "qa"
  >("overview");

  const [newNote, setNewNote] = useState("");

  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);

  const {
    filters: qaFilters,
    setSearch: setQASearch,
    setAnswered,
    setSortBy: setQASortBy,
  } = useQAFilters();
  const {
    isAsking,
    startAsking,
    stopAsking,
    replyingToQuestionId,
    startReplyingToQuestion,
    stopReplyingToQuestion,
  } = useQAFormState();
  const [newQuestion, setNewQuestion] = useState({ title: "", content: "" });
  const [newAnswer, setNewAnswer] = useState("");
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  );

  // Course completion modal state
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const currentLessonObj =
    course?.sections[currentSection]?.lessons[currentLesson];

  const { data: allNotesResponse } = useEnrollmentNotes(enrollment?.id || "");
  const allCourseNotes = allNotesResponse?.data || [];

  const { data: enrollmentReviewsResponse } = useEnrollmentReviews(
    enrollment?.id || ""
  );
  const enrollmentReviews = enrollmentReviewsResponse?.data?.reviews || [];

  const addReviewMutation = useAddCourseReview();
  const queryClient = useQueryClient();

  const { data: questionsData, isLoading: questionsLoading } =
    useQuestionsByCourse(courseId!, qaFilters, { enabled: !!courseId });

  const createQuestionMutation = useCreateQuestion(courseId!);
  const voteQuestionMutation = useVoteOnQuestion();
  const voteAnswerMutation = useVoteOnAnswer();
  const acceptAnswerMutation = useAcceptAnswer();

  const { mutate: createAnswerMutate } = useMutation({
    mutationFn: ({
      questionId,
      data,
    }: {
      questionId: string;
      data: { content: string };
    }) => qaService.createAnswer(questionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("qa"),
      });
      setNewAnswer("");
      stopReplyingToQuestion();
    },
    onError: (error: any) => {
      console.error("Error creating answer:", error);
    },
  });

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (course && course.sections.length > 0) {
      loadLesson(0, 0);
    }
  }, [course]);

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

  const loadLesson = (sectionIndex: number, lessonIndex: number) => {
    if (!course || !course.sections[sectionIndex]?.lessons[lessonIndex]) return;

    setCurrentSection(sectionIndex);
    setCurrentLesson(lessonIndex);

    const lesson = course.sections[sectionIndex].lessons[lessonIndex];
    const video = videoRef.current;

    if (video) {
      video.src = lesson.video.url;
      video.load();
      setCurrentTime(0);
      setIsPlaying(false);

      const lessonId = lesson._id || lesson.id;
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

  const changeVolume = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
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
    return remainingTime <= 60; // 60 seconds = 1 minute
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
      // Course completed - show completion modal
      setShowCompletionModal(true);
    }
  };

  const goToPreviousLesson = () => {
    if (!course) return;

    if (currentLesson > 0) {
      loadLesson(currentSection, currentLesson - 1);
    } else if (currentSection > 0) {
      const prevSection = course.sections[currentSection - 1];
      loadLesson(currentSection - 1, prevSection.lessons.length - 1);
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

  const addReview = () => {
    if (!newReview.trim() || !enrollment || newRating < 1 || newRating > 5)
      return;

    addReviewMutation.mutate(
      {
        enrollmentId: enrollment.id,
        reviewData: {
          rating: newRating,
          review: newReview.trim(),
        },
      },
      {
        onSuccess: () => {
          setNewReview("");
          setNewRating(5);
          refetchCourse();
        },
      }
    );
  };

  const handleCreateQuestion = () => {
    if (!newQuestion.title.trim() || !newQuestion.content.trim()) return;

    createQuestionMutation.mutate(
      {
        title: newQuestion.title.trim(),
        content: newQuestion.content.trim(),
        lessonId: currentLessonObj?._id,
      },
      {
        onSuccess: () => {
          setNewQuestion({ title: "", content: "" });
          stopAsking();
        },
      }
    );
  };

  const handleCreateAnswer = (questionId: string) => {
    if (!newAnswer.trim()) return;

    createAnswerMutate({
      questionId,
      data: { content: newAnswer.trim() },
    });
  };

  const handleVoteAnswer = (
    answerId: string,
    voteType: "upvote" | "downvote"
  ) => {
    voteAnswerMutation.mutate({
      answerId,
      voteData: { type: voteType },
    });
  };

  const handleAcceptAnswer = (questionId: string, answerId: string) => {
    acceptAnswerMutation.mutate({ questionId, answerId });
  };

  const toggleQuestionExpansion = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleVoteQuestion = (
    questionId: string,
    voteType: "upvote" | "downvote"
  ) => {
    voteQuestionMutation.mutate({
      questionId,
      voteData: { type: voteType },
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white flex">
      {/* Video Player */}
      <div className={`flex-1 relative ${showSidebar ? "mr-80" : ""}`}>
        {/* Top Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-slate-900/95 via-gray-900/95 to-slate-800/95 backdrop-blur-md z-30 border-b border-slate-700/50 shadow-lg shadow-black/10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/my-learning")}
                className="group flex items-center space-x-2 text-slate-300 hover:text-white transition-all duration-200 cursor-pointer hover:bg-slate-700/30 px-3 py-2 rounded-lg"
              >
                <span className="text-lg group-hover:translate-x-[-2px] transition-transform duration-200">
                  ←
                </span>
                <span className="hidden sm:inline">Back to My Learning</span>
              </button>
              <div className="h-4 w-px bg-gradient-to-b from-transparent via-slate-600 to-transparent"></div>
              <h1 className="text-lg font-semibold truncate max-w-96 bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                {course.title}
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              <div className="px-3 py-1.5 bg-slate-800/60 rounded-lg border border-slate-700/50 text-sm text-slate-300 font-medium">
                {currentSection + 1}.{currentLesson + 1} /{" "}
                {course.sections.reduce(
                  (total, section) => total + section.lessons.length,
                  0
                )}
              </div>
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 border border-transparent hover:border-slate-600/30 cursor-pointer"
              >
                <FaList className="text-sm" />
              </button>
            </div>
          </div>
        </div>

        <div className="relative h-screen pt-16">
          {showQuiz && currentLessonObj?.quiz ? (
            // Show Quiz Component in place of video player
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
                onQuizComplete={(score: number, passed: boolean) => {
                  console.log("Quiz completed:", { score, passed });
                  setShowQuiz(false);
                  // Here you could update the lesson progress with quiz completion
                }}
                onClose={() => setShowQuiz(false)}
                timeLimit={300} // 5 minutes
                title={`${currentLessonObj.title} - Quiz`}
              />
            </div>
          ) : (
            // Show Video Player
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
                goToNextLesson();
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          )}

          {/* Video Controls */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
              showControls || !isPlaying ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Progress Bar */}
            <div className="mb-4">
              <div
                className="w-full h-2 bg-gray-600 rounded cursor-pointer hover:h-3 transition-all duration-200 group relative"
                onClick={(e) => {
                  const video = videoRef.current;
                  if (!video || !duration) return;

                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const percentage = clickX / rect.width;
                  const newTime = percentage * duration;

                  video.currentTime = newTime;
                  setCurrentTime(newTime);
                }}
              >
                {/* Completion threshold indicator */}
                {duration > 60 && (
                  <div
                    className="absolute top-0 h-full w-0.5 bg-green-400 z-10"
                    style={{ left: `${((duration - 60) / duration) * 100}%` }}
                    title="Complete button becomes available here"
                  />
                )}

                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded relative"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                >
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={goToPreviousLesson}
                  className="p-2 hover:bg-white/20 rounded transition-colors cursor-pointer"
                  disabled={currentSection === 0 && currentLesson === 0}
                  title="Previous Lesson"
                >
                  <FaStepBackward />
                </button>

                <button
                  onClick={() => seek(currentTime - 10)}
                  className="p-2 hover:bg-white/20 rounded transition-colors cursor-pointer"
                  title="Rewind 10 seconds (←)"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                    <text
                      x="12"
                      y="15"
                      textAnchor="middle"
                      fontSize="8"
                      fill="currentColor"
                    >
                      10
                    </text>
                  </svg>
                </button>

                <button
                  onClick={togglePlayPause}
                  className="p-3 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                  title="Play/Pause (Spacebar)"
                >
                  {isPlaying ? (
                    <FaPause className="text-xl" />
                  ) : (
                    <FaPlay className="text-xl ml-1" />
                  )}
                </button>

                <button
                  onClick={() => seek(currentTime + 10)}
                  className="p-2 hover:bg-white/20 rounded transition-colors cursor-pointer"
                  title="Forward 10 seconds (→)"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
                    <text
                      x="12"
                      y="15"
                      textAnchor="middle"
                      fontSize="8"
                      fill="currentColor"
                    >
                      10
                    </text>
                  </svg>
                </button>

                <button
                  onClick={goToNextLesson}
                  className="p-2 hover:bg-white/20 rounded transition-colors cursor-pointer"
                  title="Next Lesson"
                >
                  <FaStepForward />
                </button>

                <div className="flex items-center space-x-2 cursor-pointer">
                  <button
                    onClick={toggleMute}
                    className="p-2 hover:bg-white/20 rounded cursor-pointer"
                  >
                    {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => changeVolume(parseFloat(e.target.value))}
                    className="w-20 accent-purple-500 bg-gray-600 h-1 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <span className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={playbackRate}
                  onChange={(e) =>
                    changePlaybackRate(parseFloat(e.target.value))
                  }
                  className="bg-black/50 border border-gray-600 rounded px-2 py-1 text-sm"
                  title="Playback Speed"
                >
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1">1x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-white/20 rounded cursor-pointer"
                  title="Fullscreen (F)"
                >
                  {isFullscreen ? <FaCompress /> : <FaExpand />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Info Section Below Video */}
        <div className="bg-gradient-to-r from-slate-900/95 via-gray-900/95 to-slate-800/95 backdrop-blur-md border-t border-slate-700/50 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs font-medium rounded-md border border-slate-600/30">
                  Section {currentSection + 1}
                </div>
                <div className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs font-medium rounded-md border border-blue-500/30">
                  Lesson {currentLesson + 1} of{" "}
                  {course.sections[currentSection]?.lessons?.length || 0}
                </div>
                {currentLessonObj &&
                  getLessonProgress(currentLessonObj._id || currentLessonObj.id)
                    ?.completed && (
                    <div className="flex items-center px-2 py-1 bg-green-600/20 text-green-300 text-xs font-medium rounded-md border border-green-500/30">
                      <FaCheck className="mr-1.5 text-xs" />
                      Completed
                    </div>
                  )}
              </div>

              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent mb-2 leading-tight">
                {currentLessonObj?.title}
              </h1>

              <p className="text-slate-400 text-base font-medium mb-3">
                {course.sections[currentSection]?.title}
              </p>

              <div className="flex items-center space-x-6 text-sm text-slate-400">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>
                    Duration: {formatTime(currentLessonObj?.duration || 0)}
                  </span>
                </div>

                {currentLessonObj?.resources &&
                  currentLessonObj.resources.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-purple-300">
                        {currentLessonObj.resources.length} Resource
                        {currentLessonObj.resources.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={markLessonComplete}
                disabled={!canCompleteLesson() && !isLessonCompleted()}
                className={`group px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 font-medium ${
                  isLessonCompleted()
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25 cursor-default"
                    : canCompleteLesson()
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105 cursor-pointer"
                    : "bg-slate-700/50 text-slate-400 cursor-not-allowed border border-slate-600/30"
                }`}
                title={
                  isLessonCompleted()
                    ? "Lesson Completed"
                    : canCompleteLesson()
                    ? "Mark as Complete"
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

              <button
                onClick={() => setShowNotes(!showNotes)}
                className="group p-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105"
                title="Notes"
              >
                <FaNotesMedical className="group-hover:scale-110 transition-transform duration-300" />
              </button>

              {currentLessonObj?.resources &&
                currentLessonObj.resources.length > 0 && (
                  <button
                    onClick={() => setActiveTab("resources")}
                    className="group p-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
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
                  onClick={() => setShowQuiz(!showQuiz)}
                  className="group p-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105"
                  title="Quiz"
                >
                  <FaQuestionCircle className="group-hover:scale-110 transition-transform duration-300" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Section Below Video */}
        <div className="bg-gradient-to-br from-slate-900/95 via-gray-900/95 to-slate-800/95 backdrop-blur-md border-t border-slate-700/30">
          {/* Tab Headers */}
          <div className="flex border-b border-slate-700/30 overflow-x-auto scrollbar-hide">
            {(
              [
                "overview",
                "notes",
                "reviews",
                "qa",
                "resources",
                "announcements",
              ] as const
            ).map((tab, index) => {
              return (
                <button
                  key={index}
                  onClick={() => setActiveTab(tab)}
                  className={`group relative px-8 py-5 text-sm font-medium capitalize transition-all duration-300 cursor-pointer min-w-fit whitespace-nowrap overflow-hidden ${
                    activeTab === tab
                      ? "text-white bg-gradient-to-br from-blue-600/20 via-purple-600/15 to-violet-600/10 border-b-2 border-blue-400 shadow-lg shadow-blue-500/10"
                      : "text-slate-300 hover:text-white hover:bg-gradient-to-br hover:from-slate-700/30 hover:to-slate-600/20 hover:shadow-md transition-all duration-300"
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
                  {activeTab === tab && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/5 to-purple-400/0 animate-pulse"></div>
                  )}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transform origin-left transition-transform duration-300 ${
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
          <div className="p-8 min-h-96 bg-gradient-to-br from-slate-900/20 via-gray-900/10 to-slate-800/20">
            {activeTab === "overview" && (
              <div>
                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Course Overview
                </h3>
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/30 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                    <h4 className="font-semibold mb-3 text-purple-300 flex items-center space-x-2">
                      <span>About This Course</span>
                    </h4>
                    <div className="text-gray-300 leading-relaxed">
                      <HTMLRenderer
                        content={course.description}
                        className="text-gray-300 prose-invert prose-sm"
                      />
                    </div>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/30 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                    <h4 className="font-semibold mb-3 text-blue-300 flex items-center space-x-2">
                      <span>What You'll Learn</span>
                    </h4>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center space-x-3">
                        <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                        <span>
                          Comprehensive understanding of the subject matter
                        </span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        <span>Practical skills and knowledge application</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                        <span>Step-by-step learning progression</span>
                      </li>
                    </ul>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/30 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                    <h4 className="font-semibold mb-4 text-green-300 flex items-center space-x-2">
                      <span>Course Info</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-purple-900/20 rounded-xl border border-purple-500/20">
                        <div className="text-2xl text-purple-400 mb-2">👨‍🏫</div>
                        <div className="text-sm text-gray-400">Instructor</div>
                        <div className="font-medium text-white">
                          {course.instructor.firstName}{" "}
                          {course.instructor.lastName}
                        </div>
                      </div>
                      <div className="p-4 bg-blue-900/20 rounded-xl border border-blue-500/20">
                        <div className="text-2xl text-blue-400 mb-2">📖</div>
                        <div className="text-sm text-gray-400">Sections</div>
                        <div className="font-medium text-white">
                          {course.sections.length}
                        </div>
                      </div>
                      <div className="p-4 bg-green-900/20 rounded-xl border border-green-500/20">
                        <div className="text-2xl text-green-400 mb-2">🎓</div>
                        <div className="text-sm text-gray-400">
                          Total Lessons
                        </div>
                        <div className="font-medium text-white">
                          {course.sections.reduce(
                            (total, section) => total + section.lessons.length,
                            0
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div>
                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  My Notes
                </h3>

                {/* Add Note */}
                <div className="bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-purple-900/20 p-6 rounded-2xl mb-6 border border-purple-500/20 backdrop-blur-sm">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1">
                      <label className="flex items-center space-x-2 text-sm font-medium text-purple-300 mb-2">
                        <span>Add a Note</span>
                      </label>
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Write your note here..."
                        className="w-full bg-gray-800/50 text-white p-4 rounded-xl border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none resize-none transition-all"
                        rows={3}
                      />
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center space-x-2 text-sm text-purple-300">
                          <span>🕐</span>
                          <span>
                            Note will be saved at {formatTime(currentTime)}
                          </span>
                        </div>
                        <button
                          onClick={addNote}
                          disabled={!newNote.trim()}
                          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all font-medium"
                        >
                          Add Note
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes List */}
                <div className="space-y-4">
                  {allCourseNotes.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📝</div>
                      <h3 className="text-xl font-semibold text-gray-300 mb-2">
                        No notes yet
                      </h3>
                      <p className="text-gray-400">
                        Start taking notes as you watch the lesson!
                      </p>
                    </div>
                  ) : (
                    allCourseNotes.map((note: any) => {
                      // Find the lesson info for this note
                      let lessonTitle = "Unknown Lesson";
                      let sectionTitle = "Unknown Section";
                      let sectionIndex = -1;
                      let lessonIndex = -1;

                      if (course && course.sections) {
                        for (
                          let sIdx = 0;
                          sIdx < course.sections.length;
                          sIdx++
                        ) {
                          const section = course.sections[sIdx];
                          if (section.lessons) {
                            for (
                              let lIdx = 0;
                              lIdx < section.lessons.length;
                              lIdx++
                            ) {
                              const lesson = section.lessons[lIdx];
                              // Try different ID formats for compatibility
                              const lessonId = lesson._id || lesson.id;
                              const noteLesson = note.lesson;

                              if (
                                lessonId &&
                                noteLesson &&
                                (lessonId.toString() ===
                                  noteLesson.toString() ||
                                  lessonId === noteLesson ||
                                  lesson._id === noteLesson ||
                                  lesson.id === noteLesson)
                              ) {
                                lessonTitle =
                                  lesson.title || `Lesson ${lIdx + 1}`;
                                sectionTitle =
                                  section.title || `Section ${sIdx + 1}`;
                                sectionIndex = sIdx;
                                lessonIndex = lIdx;
                                break;
                              }
                            }
                          }
                          if (sectionIndex !== -1) break;
                        }
                      }

                      return (
                        <div
                          key={note._id}
                          className="bg-gradient-to-br from-gray-800/50 to-gray-900/30 p-5 rounded-2xl border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 backdrop-blur-sm"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-col">
                              <button
                                onClick={() => {
                                  // Navigate to the lesson first if not current lesson
                                  if (
                                    sectionIndex !== -1 &&
                                    lessonIndex !== -1
                                  ) {
                                    // Always load the lesson first
                                    loadLesson(sectionIndex, lessonIndex);

                                    // Set up a delayed function to seek to timestamp
                                    const seekToTime = () => {
                                      const video = videoRef.current;
                                      if (video && video.readyState >= 2) {
                                        // Check if video is ready
                                        video.currentTime = note.timestamp;
                                        setCurrentTime(note.timestamp);
                                      } else if (video) {
                                        // Wait for video to be ready
                                        const handleCanPlay = () => {
                                          video.currentTime = note.timestamp;
                                          setCurrentTime(note.timestamp);
                                          video.removeEventListener(
                                            "canplay",
                                            handleCanPlay
                                          );
                                        };
                                        video.addEventListener(
                                          "canplay",
                                          handleCanPlay
                                        );
                                      }
                                    };

                                    // Delay based on whether it's the same lesson or different
                                    if (
                                      sectionIndex === currentSection &&
                                      lessonIndex === currentLesson
                                    ) {
                                      // Same lesson, seek immediately
                                      setTimeout(seekToTime, 100);
                                    } else {
                                      // Different lesson, wait for load
                                      setTimeout(seekToTime, 1500);
                                    }
                                  }
                                }}
                                className="text-purple-400 hover:text-purple-300 font-medium text-sm text-left"
                              >
                                {formatTime(note.timestamp)} - {lessonTitle}
                              </button>
                              <p className="text-xs text-gray-500 mt-1">
                                Section: {sectionTitle}
                              </p>
                            </div>
                            <span className="text-gray-400 text-sm">
                              {new Date(note.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-200">{note.content}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Course Reviews</h3>
                  {course?.rating && course?.ratingsCount ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-lg ${
                              star <= Math.round(course.rating)
                                ? "text-yellow-400"
                                : "text-gray-500"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-white font-semibold">
                        {course.rating.toFixed(1)}
                      </span>
                      <span className="text-gray-400">
                        ({course.ratingsCount} reviews)
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400">No ratings yet</span>
                  )}
                </div>

                {/* Add Review Form */}
                <div className="bg-gray-700 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold mb-3">Leave a Review</h4>

                  {/* Rating Stars */}
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm text-gray-300">Rating:</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setNewRating(star)}
                          className={`text-2xl ${
                            star <= newRating
                              ? "text-yellow-400"
                              : "text-gray-500"
                          } hover:text-yellow-300 transition-colors`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <span className="text-sm text-gray-400">
                      ({newRating}/5)
                    </span>
                  </div>

                  {/* Review Text */}
                  <textarea
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    placeholder="Write your review..."
                    className="w-full bg-gray-600 text-white p-3 rounded border border-gray-500 focus:border-purple-500 focus:outline-none resize-none mb-3"
                    rows={4}
                  />

                  <button
                    onClick={addReview}
                    disabled={!newReview.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Submit Review
                  </button>
                </div>

                {/* My Reviews Section */}
                {enrollmentReviews && enrollmentReviews.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3 text-purple-400">
                      My Reviews for this Course
                    </h4>
                    <div className="space-y-3">
                      {enrollmentReviews.map((review: any, index: number) => (
                        <div
                          key={index}
                          className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-lg"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span
                                    key={star}
                                    className={`text-sm ${
                                      star <= review.rating
                                        ? "text-yellow-400"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="text-purple-300 text-sm font-medium">
                                My Review
                              </span>
                            </div>
                            <span className="text-gray-400 text-sm">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-200">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Course Reviews */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold mb-3">
                    All Course Reviews
                  </h4>
                  {!course?.reviews || course.reviews.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      No reviews yet. Be the first to review this course!
                    </p>
                  ) : (
                    course.reviews.map((review: any, index: number) => (
                      <div
                        key={review._id || index}
                        className="bg-gray-700 p-4 rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {review.user?.firstName?.[0] || "U"}
                            </div>
                            <div>
                              <p className="font-semibold text-white">
                                {review.user?.firstName || "Anonymous"}{" "}
                                {review.user?.lastName || "User"}
                              </p>
                              <div className="flex items-center space-x-2">
                                <div className="flex space-x-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                      key={star}
                                      className={`text-sm ${
                                        star <= review.rating
                                          ? "text-yellow-400"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                                <span className="text-sm text-gray-400">
                                  {new Date(
                                    review.date || review.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-200 mt-2">
                          {review.comment || review.review}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "resources" && (
              <div>
                <h3 className="text-xl font-bold mb-4">Lesson Resources</h3>
                {currentLessonObj?.resources &&
                currentLessonObj.resources.length > 0 ? (
                  <div className="space-y-3">
                    {currentLessonObj.resources.map(
                      (resource: any, index: number) => (
                        <div
                          key={index}
                          className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
                                  resource.type === "pdf"
                                    ? "bg-red-500"
                                    : resource.type === "zip"
                                    ? "bg-yellow-500"
                                    : resource.type === "doc"
                                    ? "bg-blue-500"
                                    : "bg-gray-500"
                                }`}
                              >
                                {resource.type === "pdf"
                                  ? "PDF"
                                  : resource.type === "zip"
                                  ? "ZIP"
                                  : resource.type === "doc"
                                  ? "DOC"
                                  : "FILE"}
                              </div>
                              <div>
                                <h4 className="font-semibold text-white">
                                  {resource.name}
                                </h4>
                                <p className="text-sm text-gray-400 capitalize">
                                  {resource.type} file
                                </p>
                              </div>
                            </div>
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <span>Download</span>
                            </a>
                          </div>
                        </div>
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
                <h3 className="text-xl font-bold mb-4">Announcements</h3>
                <p className="text-gray-400">
                  Course announcements will be displayed here.
                </p>
              </div>
            )}

            {activeTab === "qa" && (
              <div className="max-w-none">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      Q&A Discussion
                    </h3>
                    <div className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30">
                      <span className="text-sm text-purple-300 font-medium">
                        {questionsData?.data?.pagination?.totalQuestions || 0}{" "}
                        questions
                      </span>
                    </div>
                  </div>

                  {!isAsking && (
                    <button
                      onClick={startAsking}
                      className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 active:scale-95"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">❓</span>
                        <span>Ask Question</span>
                      </div>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/0 via-purple-400/10 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  )}
                </div>

                {/* Ask Question Form */}
                {isAsking && (
                  <div className="mb-8 p-6 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-purple-900/20 rounded-2xl border border-purple-500/20 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-purple-300 flex items-center space-x-2">
                        <span>❓</span>
                        <span>Ask a New Question</span>
                      </h4>
                      <button
                        onClick={stopAsking}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                      >
                        <FaTimes />
                      </button>
                    </div>

                    {currentLessonObj && (
                      <div className="mb-4 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                        <p className="text-sm text-blue-300 flex items-center space-x-2">
                          <span>📚</span>
                          <span>
                            Question for:{" "}
                            <span className="font-medium">
                              {currentLessonObj.title}
                            </span>
                          </span>
                        </p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Question Title
                        </label>
                        <input
                          type="text"
                          value={newQuestion.title}
                          onChange={(e) =>
                            setNewQuestion((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          placeholder="What's your question about?"
                          className="w-full p-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Question Details
                        </label>
                        <textarea
                          value={newQuestion.content}
                          onChange={(e) =>
                            setNewQuestion((prev) => ({
                              ...prev,
                              content: e.target.value,
                            }))
                          }
                          placeholder="Provide more details about your question..."
                          rows={4}
                          className="w-full p-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all resize-none"
                        />
                      </div>

                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={stopAsking}
                          className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreateQuestion}
                          disabled={
                            !newQuestion.title.trim() ||
                            !newQuestion.content.trim() ||
                            createQuestionMutation.isPending
                          }
                          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {createQuestionMutation.isPending
                            ? "Posting..."
                            : "Post Question"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Filters and Search */}
                <div className="mb-6 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 backdrop-blur-sm">
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-64">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search questions..."
                          onChange={(e) => setQASearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          🔍
                        </div>
                      </div>
                    </div>

                    <select
                      onChange={(e) =>
                        setAnswered(
                          e.target.value === "all"
                            ? null
                            : e.target.value === "true"
                        )
                      }
                      className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="all">All Questions</option>
                      <option value="false">Unanswered</option>
                      <option value="true">Answered</option>
                    </select>

                    <select
                      value={qaFilters.sortBy}
                      onChange={(e) => setQASortBy(e.target.value)}
                      className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="popular">Most Popular</option>
                      <option value="unanswered">Unanswered First</option>
                    </select>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-6">
                  {questionsLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                    </div>
                  ) : !questionsData?.data?.questions?.length ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">❓</div>
                      <h3 className="text-xl font-semibold text-gray-300 mb-2">
                        No questions yet
                      </h3>
                      <p className="text-gray-400 mb-6">
                        Be the first to ask a question about this course!
                      </p>
                      <button
                        onClick={startAsking}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all"
                      >
                        Ask First Question
                      </button>
                    </div>
                  ) : (
                    questionsData.data.questions.map((question: any) => (
                      <div
                        key={question._id}
                        className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/30 rounded-2xl border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 backdrop-blur-sm"
                      >
                        <div className="flex items-start space-x-4">
                          {/* Vote Section */}
                          <div className="flex flex-col items-center space-y-2 min-w-16">
                            <button
                              onClick={() =>
                                handleVoteQuestion(question._id, "upvote")
                              }
                              className={`p-2 rounded-lg transition-all hover:scale-110 ${
                                question.userVoteType === "upvote"
                                  ? "bg-green-500/20 text-green-400 border border-green-500/50"
                                  : "bg-gray-700/50 text-gray-400 hover:bg-green-500/10 hover:text-green-400"
                              }`}
                            >
                              ▲
                            </button>
                            <span
                              className={`font-bold text-lg ${
                                question.voteScore > 0
                                  ? "text-green-400"
                                  : question.voteScore < 0
                                  ? "text-red-400"
                                  : "text-gray-400"
                              }`}
                            >
                              {question.voteScore}
                            </span>
                            <button
                              onClick={() =>
                                handleVoteQuestion(question._id, "downvote")
                              }
                              className={`p-2 rounded-lg transition-all hover:scale-110 ${
                                question.userVoteType === "downvote"
                                  ? "bg-red-500/20 text-red-400 border border-red-500/50"
                                  : "bg-gray-700/50 text-gray-400 hover:bg-red-500/10 hover:text-red-400"
                              }`}
                            >
                              ▼
                            </button>
                          </div>

                          {/* Question Content */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-white mb-2 hover:text-purple-300 transition-colors">
                                  {question.title}
                                </h4>
                                <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                      {question.user.firstName?.[0] || "U"}
                                    </div>
                                    <span>
                                      {question.user.firstName}{" "}
                                      {question.user.lastName}
                                    </span>
                                  </div>
                                  <span>•</span>
                                  <span>
                                    {new Date(
                                      question.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                  {question.lesson && (
                                    <>
                                      <span>•</span>
                                      <span className="text-blue-400">
                                        {question.lesson.title}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {question.isAnswered && (
                                <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30 text-sm font-medium">
                                  ✓ Answered
                                </div>
                              )}
                            </div>

                            <p className="text-gray-300 mb-4 leading-relaxed">
                              {question.content}
                            </p>

                            {question.tags && question.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {question.tags.map(
                                  (tag: string, index: number) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs border border-purple-500/30"
                                    >
                                      #{tag}
                                    </span>
                                  )
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <button
                                  onClick={() =>
                                    toggleQuestionExpansion(question._id)
                                  }
                                  className="flex items-center space-x-1 hover:text-purple-300 transition-colors"
                                >
                                  <span>💬</span>
                                  <span>{question.answersCount} answers</span>
                                  <span className="ml-1">
                                    {expandedQuestions.has(question._id)
                                      ? "▲"
                                      : "▼"}
                                  </span>
                                </button>
                              </div>

                              <div className="flex items-center space-x-2">
                                {question.answersCount > 0 && (
                                  <button
                                    onClick={() =>
                                      toggleQuestionExpansion(question._id)
                                    }
                                    className="px-4 py-2 bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 rounded-lg transition-all border border-purple-500/30 hover:border-purple-400/50"
                                  >
                                    {expandedQuestions.has(question._id)
                                      ? "Hide Answers"
                                      : "View Answers"}
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    startReplyingToQuestion(question._id)
                                  }
                                  className="px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg transition-all border border-blue-500/30 hover:border-blue-400/50"
                                >
                                  Reply
                                </button>
                              </div>
                            </div>

                            {/* Answer Form */}
                            {replyingToQuestionId === question._id && (
                              <div className="mt-4 p-4 bg-blue-900/20 rounded-xl border border-blue-500/30">
                                <textarea
                                  value={newAnswer}
                                  onChange={(e) => setNewAnswer(e.target.value)}
                                  placeholder="Write your answer..."
                                  rows={3}
                                  className="w-full p-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all resize-none"
                                />
                                <div className="flex justify-end space-x-3 mt-3">
                                  <button
                                    onClick={stopReplyingToQuestion}
                                    className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleCreateAnswer(question._id)
                                    }
                                    disabled={!newAnswer.trim()}
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                  >
                                    Post Answer
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Answers Section */}
                            {expandedQuestions.has(question._id) && (
                              <AnswersSection
                                question={question}
                                onVoteAnswer={handleVoteAnswer}
                                onAcceptAnswer={handleAcceptAnswer}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {questionsData?.data?.pagination &&
                  questionsData.data.pagination.totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <div className="flex items-center space-x-2">
                        {Array.from(
                          { length: questionsData.data.pagination.totalPages },
                          (_, index) => (
                            <button
                              key={index}
                              onClick={() => setQASearch("")} // This should be setPage but keeping simple for now
                              className={`px-4 py-2 rounded-lg transition-all ${
                                qaFilters.page === index + 1
                                  ? "bg-purple-600 text-white"
                                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                              }`}
                            >
                              {index + 1}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <div className="w-80 bg-gradient-to-b from-slate-900/95 via-gray-900/95 to-slate-800/95 backdrop-blur-md h-screen overflow-y-auto fixed right-0 top-0 border-l border-slate-700/50 z-40 shadow-2xl shadow-black/20">
          <div className="p-6">
            {/* Header with course info */}
            <div className="bg-gradient-to-r from-slate-800/50 to-gray-800/50 -m-6 p-6 mb-6 border-b border-slate-700/30 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                  Course Content
                </h2>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="group p-2 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200 border border-transparent hover:border-slate-600/30"
                >
                  <FaTimes className="text-slate-400 group-hover:text-white transition-colors duration-200" />
                </button>
              </div>
              <h3 className="text-base font-semibold text-slate-200 truncate mb-2">
                {course.title}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-slate-400">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>
                    {course.sections.reduce(
                      (total, section) => total + section.lessons.length,
                      0
                    )}{" "}
                    lessons
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>{course.sections.length} sections</span>
                </div>
              </div>
            </div>

            {/* Course Sections */}
            <div className="space-y-2">
              {course.sections.map((section: any, sectionIndex: number) => (
                <div
                  key={sectionIndex}
                  className="border border-gray-700 rounded-lg"
                >
                  <div className="p-3 bg-gray-700">
                    <h3 className="font-semibold text-sm">{section.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {section.lessons.length} lessons
                    </p>
                  </div>

                  <div className="divide-y divide-gray-700">
                    {section.lessons.map((lesson: any, lessonIndex: number) => {
                      const progress = getLessonProgress(
                        lesson._id || lesson.id
                      );
                      const isCurrentLesson =
                        currentSection === sectionIndex &&
                        currentLesson === lessonIndex;

                      return (
                        <button
                          key={lessonIndex}
                          onClick={() => loadLesson(sectionIndex, lessonIndex)}
                          className={`w-full text-left p-3 hover:bg-gray-700 transition-colors ${
                            isCurrentLesson ? "bg-purple-600" : ""
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                progress?.completed
                                  ? "bg-green-500"
                                  : "bg-gray-600"
                              }`}
                            >
                              {progress?.completed ? (
                                <FaCheck />
                              ) : (
                                lessonIndex + 1
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {lesson.title}
                              </p>
                              <p className="text-xs text-gray-400">
                                {formatTime(lesson.duration)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1">
                              {lesson.isPreview && (
                                <span className="text-xs bg-green-600 px-2 py-1 rounded">
                                  Preview
                                </span>
                              )}
                              {lesson.resources &&
                                lesson.resources.length > 0 && (
                                  <span
                                    className="text-xs bg-blue-600 px-2 py-1 rounded"
                                    title="Has Resources"
                                  >
                                    📁
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
            <div className="sticky bottom-0 bg-gray-900 -mx-4 px-4 py-3 border-t border-gray-700 mt-4">
              <div className="text-xs text-gray-400 space-y-1">
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
                    className="text-purple-400 hover:text-purple-300 text-xs cursor-pointer"
                  >
                    My Learning
                  </button>
                  <button
                    onClick={() => navigate(`/course/${courseId}`)}
                    className="text-purple-400 hover:text-purple-300 text-xs cursor-pointer"
                  >
                    Course Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
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

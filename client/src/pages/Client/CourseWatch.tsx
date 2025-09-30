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
import { useCourse } from "../../hooks/useCourseQueries";
import {
  useCompleteLessonProgress,
  useCourseProgress,
} from "../../hooks/useUserProgress";

const CourseWatch: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  // Video player state
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
    "overview" | "notes" | "reviews" | "resources" | "announcements"
  >("overview");

  const [newNote, setNewNote] = useState("");

  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({});

  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);

  const currentLessonObj =
    course?.sections[currentSection]?.lessons[currentLesson];

  const { data: allNotesResponse } = useEnrollmentNotes(enrollment?.id || "");
  const allCourseNotes = allNotesResponse?.data || [];

  const { data: enrollmentReviewsResponse } = useEnrollmentReviews(
    enrollment?.id || ""
  );
  const enrollmentReviews = enrollmentReviewsResponse?.data?.reviews || [];

  const addReviewMutation = useAddCourseReview();

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
      video.src = lesson.videoUrl;
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
    // Only allow completion if lesson is not already completed
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

  // Check if user can complete the lesson (must be in last 1 minute)
  const canCompleteLesson = () => {
    if (!currentLessonObj || !duration || duration === 0) return false;
    const remainingTime = duration - currentTime;
    return remainingTime <= 60; // 60 seconds = 1 minute
  };

  // Check if lesson is already completed
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
      alert("Congratulations! You've completed the entire course!");
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
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Video Player */}
      <div className={`flex-1 relative ${showSidebar ? "mr-80" : ""}`}>
        {/* Top Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 bg-gray-800/95 backdrop-blur-sm z-30 border-b border-gray-700">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/my-learning")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                ← Back to My Learning
              </button>
              <div className="h-4 w-px bg-gray-600"></div>
              <h1 className="text-lg font-semibold text-white truncate max-w-96">
                {course.title}
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-300">
                {currentSection + 1}.{currentLesson + 1} /{" "}
                {course.sections.reduce(
                  (total, section) => total + section.lessons.length,
                  0
                )}
              </div>
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded"
              >
                <FaList />
              </button>
            </div>
          </div>
        </div>

        <div className="relative h-screen pt-16">
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
                  className="p-2 hover:bg-white/20 rounded transition-colors"
                  disabled={currentSection === 0 && currentLesson === 0}
                  title="Previous Lesson"
                >
                  <FaStepBackward />
                </button>

                <button
                  onClick={() => seek(currentTime - 10)}
                  className="p-2 hover:bg-white/20 rounded transition-colors"
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
                  className="p-3 hover:bg-white/20 rounded-full transition-colors"
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
                  className="p-2 hover:bg-white/20 rounded transition-colors"
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
                  className="p-2 hover:bg-white/20 rounded transition-colors"
                  title="Next Lesson"
                >
                  <FaStepForward />
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleMute}
                    className="p-2 hover:bg-white/20 rounded"
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
                  className="p-2 hover:bg-white/20 rounded"
                  title="Fullscreen (F)"
                >
                  {isFullscreen ? <FaCompress /> : <FaExpand />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Info Section Below Video */}
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white mb-1">
                {currentLessonObj?.title}
              </h1>
              <p className="text-gray-400 text-sm">
                Section {currentSection + 1}:{" "}
                {course.sections[currentSection]?.title}
              </p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                <span>
                  Lesson {currentLesson + 1} of{" "}
                  {course.sections[currentSection]?.lessons?.length || 0}
                </span>
                <span>•</span>
                <span>
                  Duration: {formatTime(currentLessonObj?.duration || 0)}
                </span>
                {currentLessonObj?.resources &&
                  currentLessonObj.resources.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-blue-400">
                        {currentLessonObj.resources.length} Resource
                        {currentLessonObj.resources.length !== 1 ? "s" : ""}
                      </span>
                    </>
                  )}
                {currentLessonObj &&
                  getLessonProgress(currentLessonObj._id || currentLessonObj.id)
                    ?.completed && (
                    <>
                      <span>•</span>
                      <div className="flex items-center text-green-400">
                        <FaCheck className="mr-1" />
                        Completed
                      </div>
                    </>
                  )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={markLessonComplete}
                disabled={!canCompleteLesson() && !isLessonCompleted()}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  isLessonCompleted()
                    ? "bg-green-500 text-white cursor-default"
                    : canCompleteLesson()
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }`}
                title={
                  isLessonCompleted()
                    ? "Lesson Completed"
                    : canCompleteLesson()
                    ? "Mark as Complete"
                    : "Complete the video to the last minute to mark as complete"
                }
              >
                <FaCheck />
                <span className="text-sm">
                  {isLessonCompleted() ? "Completed" : "Complete"}
                </span>
              </button>

              <button
                onClick={() => setShowNotes(!showNotes)}
                className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                title="Notes"
              >
                <FaNotesMedical />
              </button>

              {currentLessonObj?.resources &&
                currentLessonObj.resources.length > 0 && (
                  <button
                    onClick={() => setActiveTab("resources")}
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    title="Lesson Resources"
                  >
                    <svg
                      className="w-5 h-5"
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
                  className="p-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
                  title="Quiz"
                >
                  <FaQuestionCircle />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Section Below Video */}
        <div className="bg-gray-800 border-t border-gray-700">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-700">
            {(
              [
                "overview",
                "notes",
                "reviews",
                "resources",
                "announcements",
              ] as const
            ).map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "text-white border-b-2 border-purple-500 bg-gray-700"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "overview" && (
              <div>
                <h3 className="text-xl font-bold mb-4">Course Overview</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">About This Course</h4>
                    <p className="text-gray-300">{course.description}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">What You'll Learn</h4>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      <li>Comprehensive understanding of the subject matter</li>
                      <li>Practical skills and knowledge application</li>
                      <li>Step-by-step learning progression</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Course Info</h4>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                      <span>
                        Instructor: {course.instructor.firstName}{" "}
                        {course.instructor.lastName}
                      </span>
                      <span>Sections: {course.sections.length}</span>
                      <span>
                        Total Lessons:{" "}
                        {course.sections.reduce(
                          (total, section) => total + section.lessons.length,
                          0
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div>
                <h3 className="text-xl font-bold mb-4">My Notes</h3>

                {/* Add Note */}
                <div className="bg-gray-700 p-4 rounded-lg mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a note at current time..."
                        className="w-full bg-gray-600 text-white p-3 rounded border border-gray-500 focus:border-purple-500 focus:outline-none resize-none"
                        rows={3}
                      />
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-sm text-gray-400">
                          Note will be added at {formatTime(currentTime)}
                        </span>
                        <button
                          onClick={addNote}
                          disabled={!newNote.trim()}
                          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <p className="text-gray-400 text-center py-8">
                      No notes yet. Add your first note above!
                    </p>
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
                          className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors"
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
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <div className="w-80 bg-gray-800 h-screen overflow-y-auto fixed right-0 top-0 border-l border-gray-700 z-40">
          <div className="p-4">
            {/* Header with course info */}
            <div className="bg-gray-900 -m-4 p-4 mb-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold">Course Content</h2>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  <FaTimes />
                </button>
              </div>
              <h3 className="text-sm font-medium text-gray-300 truncate">
                {course.title}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {course.sections.reduce(
                  (total, section) => total + section.lessons.length,
                  0
                )}{" "}
                lessons
              </p>
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
                    className="text-purple-400 hover:text-purple-300 text-xs"
                  >
                    My Learning
                  </button>
                  <button
                    onClick={() => navigate(`/course/${courseId}`)}
                    className="text-purple-400 hover:text-purple-300 text-xs"
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
                className="mt-2 w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
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

      {/* Quiz Panel */}
      {showQuiz && currentLessonObj?.quiz && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Lesson Quiz</h3>
              <button
                onClick={() => setShowQuiz(false)}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              {currentLessonObj.quiz.map((question, index) => (
                <div key={index} className="p-4 bg-gray-700 rounded-lg">
                  <h4 className="font-medium mb-3">{question.question}</h4>
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <button
                        key={optionIndex}
                        onClick={() =>
                          setQuizAnswers((prev) => ({
                            ...prev,
                            [index]: optionIndex,
                          }))
                        }
                        className={`w-full text-left p-2 rounded border ${
                          quizAnswers[index] === optionIndex
                            ? "border-blue-500 bg-blue-600/20"
                            : "border-gray-600 hover:bg-gray-600"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                console.log("Quiz submitted:", quizAnswers);
                setShowQuiz(false);
              }}
              className="mt-4 w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg"
            >
              Submit Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseWatch;

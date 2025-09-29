import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaPlay,
  FaPause,
  FaExpand,
  FaCompress,
  FaVolumeUp,
  FaVolumeMute,
  FaBackward,
  FaForward,
  FaBookmark,
  FaRegBookmark,
  FaQuestionCircle,
  FaNotesMedical,
  FaCheck,
  FaList,
  FaTimes,
} from "react-icons/fa";
import { useCourse } from "../../hooks/useCourseQueries";
import {
  useCourseProgress,
  useUpdateLessonProgress,
} from "../../hooks/useUserProgress";
import {
  useUserEnrollments,
  useEnrollmentNotes,
  useAddEnrollmentNote,
} from "../../hooks/useEnrollment";

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

  // Course data using hooks
  const { data: courseResponse, isLoading: courseLoading } = useCourse(
    courseId!
  );
  const course = courseResponse?.data;

  const { data: courseProgress } = useCourseProgress(courseId!);

  // Get user enrollments to find the enrollment for this course
  const { data: enrollmentsResponse } = useUserEnrollments();
  const enrollment = enrollmentsResponse?.data?.enrollments?.find(
    (e: any) => e.course._id === courseId
  );

  // Mutations
  const updateProgressMutation = useUpdateLessonProgress();
  const addNoteMutation = useAddEnrollmentNote();

  // Local state
  const [currentSection, setCurrentSection] = useState(0);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "notes" | "reviews" | "announcements"
  >("overview");

  // Notes state

  const [newNote, setNewNote] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({});

  // Get notes for current lesson
  const currentLessonObj =
    course?.sections[currentSection]?.lessons[currentLesson];
  const { data: lessonNotesResponse } = useEnrollmentNotes(
    enrollment?._id || "",
    currentLessonObj?.id
  );
  const lessonNotes = lessonNotesResponse?.data || [];

  //   console.log(lessonNotes);

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
      // Allow keyboard shortcuts even when input elements are focused, except for textareas and inputs
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

      // Load user progress for this lesson
      const progress = getLessonProgress(lesson.id);
      if (progress && progress.watchTime > 0) {
        video.currentTime = Math.min(progress.watchTime, lesson.duration);
      }
    }

    // Update URL
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

  const updateProgress = (completed: boolean = false) => {
    if (!course) return;

    const lesson = course.sections[currentSection]?.lessons[currentLesson];
    if (!lesson) return;
    // console.log(course);

    updateProgressMutation.mutate({
      courseId: course.id,
      progressData: {
        lessonId: lesson.id,
        watchTime: Math.floor(currentTime),
        completed: completed,
      },
    });

    if (completed) {
      console.log("Lesson completed!");
    }
  };

  const markLessonComplete = () => {
    updateProgress(true);
  };

  const goToNextLesson = () => {
    if (!course) return;

    const currentLessonObj =
      course.sections[currentSection]?.lessons[currentLesson];
    if (currentLessonObj) {
      updateProgress(false); // Save current progress
    }

    const currentSectionObj = course.sections[currentSection];
    if (currentLesson < currentSectionObj.lessons.length - 1) {
      // Next lesson in same section
      loadLesson(currentSection, currentLesson + 1);
    } else if (currentSection < course.sections.length - 1) {
      // First lesson of next section
      loadLesson(currentSection + 1, 0);
    } else {
      alert("Congratulations! You've completed the entire course!");
    }
  };

  const goToPreviousLesson = () => {
    if (!course) return;

    if (currentLesson > 0) {
      // Previous lesson in same section
      loadLesson(currentSection, currentLesson - 1);
    } else if (currentSection > 0) {
      // Last lesson of previous section
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
        enrollmentId: enrollment._id,
        noteData: {
          lessonId: lesson.id,
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

  const lessonProgress = currentLessonObj
    ? getLessonProgress(currentLessonObj.id)
    : null;

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

              // Auto-save progress every 10 seconds
              if (Math.floor(video.currentTime) % 10 === 0) {
                updateProgress(false);
              }
            }}
            onLoadedMetadata={(e) => {
              const video = e.target as HTMLVideoElement;
              setDuration(video.duration);
            }}
            onEnded={() => {
              setIsPlaying(false);
              updateProgress(true); // Mark as completed
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
                className="w-full h-1 bg-gray-600 rounded cursor-pointer"
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
                <div
                  className="h-full bg-red-500 rounded"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={goToPreviousLesson}
                  className="p-2 hover:bg-white/20 rounded"
                  disabled={currentSection === 0 && currentLesson === 0}
                  title="Previous Lesson"
                >
                  <FaBackward />
                </button>

                <button
                  onClick={() => seek(currentTime - 10)}
                  className="p-2 hover:bg-white/20 rounded text-sm"
                  title="Rewind 10 seconds (←)"
                >
                  -10s
                </button>

                <button
                  onClick={togglePlayPause}
                  className="p-3 hover:bg-white/20 rounded-full"
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
                  className="p-2 hover:bg-white/20 rounded text-sm"
                  title="Forward 10 seconds (→)"
                >
                  +10s
                </button>

                <button
                  onClick={goToNextLesson}
                  className="p-2 hover:bg-white/20 rounded"
                  title="Next Lesson"
                >
                  <FaForward />
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
                    className="w-20"
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

          {/* Lesson Info Overlay */}
          <div className="absolute top-20 left-4 right-4">
            <div className="bg-black/50 rounded-lg p-4">
              <h1 className="text-xl font-bold mb-1">
                {currentLessonObj?.title}
              </h1>
              <p className="text-gray-300 text-sm">
                Section: {course.sections[currentSection]?.title}
              </p>
              {lessonProgress?.completed && (
                <div className="flex items-center mt-2 text-green-400 text-sm">
                  <FaCheck className="mr-1" />
                  Completed
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-20 right-4 flex flex-col space-y-2">
            <button
              onClick={markLessonComplete}
              className="p-3 bg-green-600 hover:bg-green-700 rounded-full"
              title="Mark as Complete"
            >
              <FaCheck />
            </button>

            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full"
              title="Bookmark"
            >
              {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
            </button>

            <button
              onClick={() => setShowNotes(!showNotes)}
              className="p-3 bg-purple-600 hover:bg-purple-700 rounded-full"
              title="Notes"
            >
              <FaNotesMedical />
            </button>

            {currentLessonObj?.quiz && currentLessonObj.quiz.length > 0 && (
              <button
                onClick={() => setShowQuiz(!showQuiz)}
                className="p-3 bg-orange-600 hover:bg-orange-700 rounded-full"
                title="Quiz"
              >
                <FaQuestionCircle />
              </button>
            )}
          </div>
        </div>

        {/* Tabs Section Below Video */}
        <div className="bg-gray-800 border-t border-gray-700">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-700">
            {(["overview", "notes", "reviews", "announcements"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? "text-white border-b-2 border-blue-500 bg-gray-700"
                      : "text-gray-300 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
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
                        className="w-full bg-gray-600 text-white p-3 rounded border border-gray-500 focus:border-blue-500 focus:outline-none resize-none"
                        rows={3}
                      />
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-sm text-gray-400">
                          Note will be added at {formatTime(currentTime)}
                        </span>
                        <button
                          onClick={addNote}
                          disabled={!newNote.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add Note
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes List */}
                <div className="space-y-4">
                  {lessonNotes.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      No notes yet. Add your first note above!
                    </p>
                  ) : (
                    lessonNotes.map((note: any) => (
                      <div
                        key={note._id}
                        className="bg-gray-700 p-4 rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <button
                            onClick={() => {
                              const video = videoRef.current;
                              if (video) {
                                video.currentTime = note.timestamp;
                                setCurrentTime(note.timestamp);
                              }
                            }}
                            className="text-blue-400 hover:text-blue-300 font-medium text-sm"
                          >
                            {formatTime(note.timestamp)}
                          </button>
                          <span className="text-gray-400 text-sm">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-200">{note.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <h3 className="text-xl font-bold mb-4">Course Reviews</h3>
                <p className="text-gray-400">
                  Course reviews will be displayed here.
                </p>
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
                  key={section.id}
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
                      const progress = getLessonProgress(lesson.id);
                      const isCurrentLesson =
                        currentSection === sectionIndex &&
                        currentLesson === lessonIndex;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => loadLesson(sectionIndex, lessonIndex)}
                          className={`w-full text-left p-3 hover:bg-gray-700 transition-colors ${
                            isCurrentLesson ? "bg-blue-600" : ""
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
                            {lesson.isPreview && (
                              <span className="text-xs bg-green-600 px-2 py-1 rounded">
                                Preview
                              </span>
                            )}
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
                    className="text-blue-400 hover:text-blue-300 text-xs"
                  >
                    My Learning
                  </button>
                  <button
                    onClick={() => navigate(`/course/${courseId}`)}
                    className="text-blue-400 hover:text-blue-300 text-xs"
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
                className="mt-2 w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Add Note
              </button>
            </div>

            <div className="space-y-2">
              {lessonNotes.map((note: any) => (
                <div key={note.id} className="p-3 bg-gray-700 rounded-lg">
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

import React from "react";
import QuizComponent from "../Client/CourseWatch/QuizComponent";
import Controls from "../Client/CourseWatch/Controls";

interface VideoPlayerProps {
  isMobile: boolean;
  isTablet: boolean;
  showQuiz: boolean;
  currentLessonObj: any;
  lessonQuizStates: {
    [key: string]: { completed: boolean; passed: boolean; score: number };
  };
  courseId: string | undefined;
  user: any;
  setQuizCompleted: (completed: boolean) => void;
  setQuizPassed: (passed: boolean) => void;
  setLessonQuizStates: (states: any) => void;
  setShowQuiz: (show: boolean) => void;
  videoRef: any;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isMuted: boolean;
  isFullscreen: boolean;
  showControls: boolean;
  retryCount: number;
  lastTimeUpdate: any;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsVideoLoading: (loading: boolean) => void;
  setIsPlaying: (playing: boolean) => void;
  setRetryCount: (count: any) => void;
  setLastTimeUpdate: (time: number) => void;
  setWatchTimeTracker: (tracker: number | ((prev: number) => number)) => void;
  lastWatchTimeUpdate: React.MutableRefObject<number>;
  loadingTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  stuckCheckRef: React.MutableRefObject<NodeJS.Timeout | null>;
  refreshVideo: () => void;
  isLessonCompleted: () => boolean;
  canCompleteLesson: () => boolean;
  markLessonComplete: () => void;
  goToNextLesson: () => void;
  getLessonProgress: (lessonId: string) => any;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  loadLesson: (sectionIndex: number, lessonIndex: number) => void;
  course: any;
  currentSection: number;
  currentLesson: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  isMobile,
  isTablet,
  showQuiz,
  currentLessonObj,
  lessonQuizStates,
  courseId,
  user,
  setQuizCompleted,
  setQuizPassed,
  setLessonQuizStates,
  setShowQuiz,
  videoRef,
  isPlaying,
  currentTime,
  duration,
  isMuted,
  isFullscreen,
  showControls,
  retryCount,
  setCurrentTime,
  setDuration,
  setIsVideoLoading,
  setIsPlaying,
  setRetryCount,
  setLastTimeUpdate,
  setWatchTimeTracker,
  lastWatchTimeUpdate,
  loadingTimeoutRef,
  stuckCheckRef,
  refreshVideo,
  isLessonCompleted,
  canCompleteLesson,
  markLessonComplete,
  goToNextLesson,
  getLessonProgress,
  togglePlayPause,
  seek,
  toggleMute,
  toggleFullscreen,
  loadLesson,
  course,
  currentSection,
  currentLesson,
}) => {
  return (
    <div
      className={`relative ${
        isMobile ? "h-56 pt-16" : isTablet ? "h-80 pt-16" : "h-screen pt-16"
      }`}
    >
      {showQuiz && currentLessonObj?.quiz ? (
        <div className="w-full h-full bg-slate-800 rounded-lg overflow-hidden">
          <QuizComponent
            questions={currentLessonObj.quiz.map((q: any, index: number) => ({
              id: `${currentLessonObj._id}-${index}`,
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
            }))}
            onQuizComplete={(score: number, passed: boolean) => {
              setQuizCompleted(true);
              setQuizPassed(passed);

              if (currentLessonObj) {
                const lessonId = currentLessonObj._id || currentLessonObj.id;
                const previousState = lessonQuizStates[lessonId];
                const shouldKeepPassed =
                  previousState?.passed && previousState.completed;

                const newQuizStates = {
                  ...lessonQuizStates,
                  [lessonId]: {
                    completed: true,
                    passed: shouldKeepPassed || passed,
                    score: Math.max(score, previousState?.score || 0),
                  },
                };

                setLessonQuizStates(newQuizStates);

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

                const now = Date.now();
                if (isPlaying && now - lastWatchTimeUpdate.current >= 10000) {
                  lastWatchTimeUpdate.current = now;
                  setWatchTimeTracker((prev: number) => prev + 10);
                }

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

              if (retryCount < 3) {
                setTimeout(() => {
                  setRetryCount((prev: any) => prev + 1);
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

              if (!isLessonCompleted() && canCompleteLesson()) {
                markLessonComplete();
              }

              if (currentLessonObj?.quiz && currentLessonObj.quiz.length > 0) {
                const lessonId = currentLessonObj._id || currentLessonObj.id;
                const quizState = lessonQuizStates[lessonId];
                const lessonProgress = getLessonProgress(lessonId);

                if (!quizState?.completed || !lessonProgress?.completed) {
                  setShowQuiz(true);
                  return;
                }
              }

              setTimeout(() => {
                goToNextLesson();
              }, 1000);
            }}
            onPlay={() => {
              setIsPlaying(true);
              stuckCheckRef.current = setTimeout(() => {
                const now = Date.now();
                const timeSinceUpdate = now - Date.now();
                const video = videoRef.current;

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
                    Video failed to load after multiple attempts. Try refreshing
                    the page.
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
            setIsMuted={() => {}}
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
  );
};

export default VideoPlayer;

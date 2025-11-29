import { useState, useEffect } from "react";
import {
  FaCompress,
  FaExpand,
  FaPause,
  FaPlay,
  FaStepBackward,
  FaStepForward,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import formatTime from "../../../utils/formatTime";

type Props = {
  videoRef: any;
  setIsMuted: (muted: boolean) => void;
  course: any;
  currentLesson: number;
  loadLesson: (sectionIndex: number, lessonIndex: number) => void;
  currentSection: number;
  duration: number;
  setCurrentTime: (time: number) => void;
  showControls: boolean;
  isPlaying: boolean;
  currentTime: number;
  seek: (time: number) => void;
  goToNextLesson: () => void;
  togglePlayPause: () => void;
  toggleMute: () => void;
  isMuted: boolean;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
};
const Controls = ({
  videoRef,
  setIsMuted,
  course,
  currentLesson,
  loadLesson,
  currentSection,
  duration,
  setCurrentTime,
  showControls,
  isPlaying,
  currentTime,
  seek,
  goToNextLesson,
  togglePlayPause,
  toggleMute,
  isMuted,
  isFullscreen,
  toggleFullscreen,
}: Props) => {
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [_, setIsTablet] = useState(
    window.innerWidth >= 768 && window.innerWidth < 1024
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const goToPreviousLesson = () => {
    if (!course) return;

    if (currentLesson > 0) {
      loadLesson(currentSection, currentLesson - 1);
    } else if (currentSection > 0) {
      const prevSection = course.sections[currentSection - 1];
      loadLesson(currentSection - 1, prevSection.lessons.length - 1);
    }
  };

  const handleProgressBarClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const video = videoRef.current;
    if (!video || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent ${
        isMobile ? "p-3" : "p-4"
      } transition-all duration-300 ${
        showControls || !isPlaying
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2"
      }`}
    >
      {/* Progress Bar - Enhanced for Mobile */}
      <div className={`${isMobile ? "mb-3" : "mb-4"}`}>
        <div
          className={`w-full ${
            isMobile ? "h-1 hover:h-1.5" : "h-2 hover:h-3"
          } bg-gray-600/80 rounded-full cursor-pointer transition-all duration-200 group relative backdrop-blur-sm`}
          onClick={(e) => {
            handleProgressBarClick(e);
          }}
        >
          {/* Completion threshold indicator */}
          {duration > 60 && (
            <div
              className="absolute top-0 h-full w-0.5 bg-green-400 z-10 rounded-full"
              style={{ left: `${((duration - 60) / duration) * 100}%` }}
              title="Complete button becomes available here"
            />
          )}

          {/* Progress Fill */}
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full relative shadow-lg"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          >
            {/* Progress Handle */}
            <div
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 ${
                isMobile ? "w-2.5 h-2.5" : "w-3 h-3"
              } bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 border-2 border-blue-400`}
            ></div>
          </div>

          {/* Buffer indicator (if needed in future) */}
          <div
            className="absolute top-0 left-0 h-full bg-gray-400/30 rounded-full"
            style={{ width: "85%" }}
          ></div>
        </div>
      </div>

      {/* Controls - Responsive Layout */}
      <div className="flex items-center justify-between">
        {/* Left Controls */}
        <div
          className={`flex items-center ${
            isMobile ? "space-x-2" : "space-x-3 lg:space-x-4"
          }`}
        >
          {/* Previous Lesson Button */}
          <button
            onClick={goToPreviousLesson}
            className={`${
              isMobile ? "p-1.5" : "p-2"
            } hover:bg-white/20 rounded-lg transition-all duration-200 cursor-pointer transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
            disabled={currentSection === 0 && currentLesson === 0}
            title="Previous Lesson"
          >
            <FaStepBackward
              className={`${isMobile ? "text-sm" : "text-base"}`}
            />
          </button>

          {/* Rewind 10s Button */}
          <button
            onClick={() => seek(currentTime - 10)}
            className={`${
              isMobile ? "p-1.5" : "p-2"
            } hover:bg-white/20 rounded-lg transition-all duration-200 cursor-pointer transform hover:scale-110 active:scale-95`}
            title="Rewind 10 seconds (←)"
          >
            <svg
              width={isMobile ? "20" : "24"}
              height={isMobile ? "20" : "24"}
              viewBox="0 0 24 24"
              fill="currentColor"
              className="drop-shadow-sm"
            >
              <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
              <text
                x="12"
                y="15"
                textAnchor="middle"
                fontSize={isMobile ? "7" : "8"}
                fill="currentColor"
                className="font-bold"
              >
                10
              </text>
            </svg>
          </button>

          {/* Play/Pause Button - Main Control */}
          <button
            onClick={togglePlayPause}
            className={`${
              isMobile ? "p-2.5" : "p-3"
            } hover:bg-white/20 rounded-full transition-all duration-200 cursor-pointer transform hover:scale-110 active:scale-95 bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg`}
            title="Play/Pause (Spacebar)"
          >
            {isPlaying ? (
              <FaPause
                className={`${isMobile ? "text-lg" : "text-xl"} drop-shadow-sm`}
              />
            ) : (
              <FaPlay
                className={`${
                  isMobile ? "text-lg ml-0.5" : "text-xl ml-1"
                } drop-shadow-sm`}
              />
            )}
          </button>

          {/* Forward 10s Button */}
          <button
            onClick={() => seek(currentTime + 10)}
            className={`${
              isMobile ? "p-1.5" : "p-2"
            } hover:bg-white/20 rounded-lg transition-all duration-200 cursor-pointer transform hover:scale-110 active:scale-95`}
            title="Forward 10 seconds (→)"
          >
            <svg
              width={isMobile ? "20" : "24"}
              height={isMobile ? "20" : "24"}
              viewBox="0 0 24 24"
              fill="currentColor"
              className="drop-shadow-sm"
            >
              <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
              <text
                x="12"
                y="15"
                textAnchor="middle"
                fontSize={isMobile ? "7" : "8"}
                fill="currentColor"
                className="font-bold"
              >
                10
              </text>
            </svg>
          </button>

          {/* Next Lesson Button */}
          <button
            onClick={goToNextLesson}
            className={`${
              isMobile ? "p-1.5" : "p-2"
            } hover:bg-white/20 rounded-lg transition-all duration-200 cursor-pointer transform hover:scale-110 active:scale-95`}
            title="Next Lesson"
          >
            <FaStepForward
              className={`${isMobile ? "text-sm" : "text-base"}`}
            />
          </button>

          {/* Volume Controls - Hidden on Mobile */}
          {!isMobile && (
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 cursor-pointer transform hover:scale-110 active:scale-95"
                title={isMuted ? "Unmute" : "Mute"}
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
                className="w-16 lg:w-20 accent-purple-500 bg-gray-600/50 h-1 rounded-lg appearance-none cursor-pointer hover:bg-gray-500/50 transition-colors"
                title="Volume"
              />
            </div>
          )}

          {/* Time Display */}
          <div
            className={`${
              isMobile ? "text-xs" : "text-sm"
            } font-mono bg-black/40 px-2 py-1 rounded backdrop-blur-sm border border-white/10`}
          >
            <span className="text-white">{formatTime(currentTime)}</span>
            <span className="text-gray-400 mx-1">/</span>
            <span className="text-gray-300">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Controls */}
        <div
          className={`flex items-center ${
            isMobile ? "space-x-1" : "space-x-2"
          }`}
        >
          {/* Mobile Volume Control */}
          {isMobile && (
            <button
              onClick={toggleMute}
              className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 cursor-pointer transform hover:scale-110 active:scale-95"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <FaVolumeMute className="text-sm" />
              ) : (
                <FaVolumeUp className="text-sm" />
              )}
            </button>
          )}

          {/* Playback Speed */}
          <select
            value={playbackRate}
            onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
            className={`bg-black/60 border border-gray-600/50 rounded-lg ${
              isMobile ? "px-1.5 py-1 text-xs" : "px-2 py-1 text-sm"
            } backdrop-blur-sm hover:bg-black/80 transition-all cursor-pointer`}
            title="Playback Speed"
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className={`${
              isMobile ? "p-1.5" : "p-2"
            } hover:bg-white/20 rounded-lg transition-all duration-200 cursor-pointer transform hover:scale-110 active:scale-95`}
            title="Fullscreen (F)"
          >
            {isFullscreen ? (
              <FaCompress className={`${isMobile ? "text-sm" : "text-base"}`} />
            ) : (
              <FaExpand className={`${isMobile ? "text-sm" : "text-base"}`} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;

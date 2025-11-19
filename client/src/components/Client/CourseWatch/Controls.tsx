import { useState } from "react";
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
      className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
        showControls || !isPlaying ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Progress Bar */}
      <div className="mb-4">
        <div
          className="w-full h-2 bg-gray-600 rounded cursor-pointer hover:h-3 transition-all duration-200 group relative"
          onClick={(e) => {
            handleProgressBarClick(e);
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
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
            onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
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
  );
};

export default Controls;

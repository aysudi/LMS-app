import { useState, useEffect } from "react";
import formatTime from "../../../utils/formatTime";

type Props = {
  newNote: string;
  setNewNote: (note: string) => void;
  setCurrentTime: (time: number) => void;
  loadLesson: (sectionIndex: number, lessonIndex: number) => void;
  videoRef: any;
  course: any;
  currentSection: number;
  allCourseNotes: any[];
  currentTime: number;
  addNote: () => void;
  currentLesson: number;
};

const NotesTab = ({
  newNote,
  setNewNote,
  setCurrentTime,
  loadLesson,
  videoRef,
  course,
  currentSection,
  allCourseNotes,
  currentTime,
  addNote,
  currentLesson,
}: Props) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">📝</span>
        </div>
        <h3
          className={`${
            isMobile ? "text-lg" : "text-xl lg:text-2xl"
          } font-bold text-slate-100`}
        >
          My Notes
        </h3>
      </div>

      {/* Add Note Section */}
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-xl border border-slate-700/50 backdrop-blur-sm shadow-xl overflow-hidden">
        <div className={`${isMobile ? "p-4" : "p-6"}`}>
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-slate-300">
              {/* <span className="text-lg">✍️</span> */}
              <span>Add a New Note</span>
            </div>

            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write your note here... This will be saved with the current video timestamp."
              className={`w-full bg-slate-700/50 text-slate-100 ${
                isMobile ? "p-3 text-sm" : "p-4"
              } rounded-xl border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none resize-none transition-all placeholder-slate-400`}
              rows={isMobile ? 2 : 3}
            />

            <div
              className={`flex ${
                isMobile ? "flex-col space-y-3" : "justify-between items-center"
              }`}
            >
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <span className="text-blue-400">🕐</span>
                <span>
                  Note will be saved at{" "}
                  <span className="font-mono text-blue-300">
                    {formatTime(currentTime)}
                  </span>
                </span>
              </div>

              <button
                onClick={addNote}
                disabled={!newNote.trim()}
                className={`${
                  isMobile ? "w-full" : ""
                } px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium border border-blue-500/30 transform hover:scale-105 active:scale-95 disabled:hover:scale-100 shadow-lg`}
              >
                {isMobile ? "📝 Add Note" : "Add Note"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          {/* <span className="text-lg">📚</span> */}
          <h4
            className={`${
              isMobile ? "text-base" : "text-lg"
            } font-semibold text-slate-200`}
          >
            Your Notes ({allCourseNotes.length})
          </h4>
        </div>

        {allCourseNotes.length === 0 ? (
          <div
            className={`text-center ${
              isMobile ? "py-8" : "py-12"
            } bg-slate-800/30 rounded-xl border border-slate-700/50`}
          >
            <div className="text-4xl lg:text-6xl mb-4">📝</div>
            <h3
              className={`${
                isMobile ? "text-lg" : "text-xl"
              } font-semibold text-slate-300 mb-2`}
            >
              No notes yet
            </h3>
            <p className={`text-slate-400 ${isMobile ? "text-sm" : ""}`}>
              Start taking notes as you watch the lesson!
            </p>
          </div>
        ) : (
          allCourseNotes.map((note: any) => {
            let lessonTitle = "Unknown Lesson";
            let sectionTitle = "Unknown Section";
            let sectionIndex = -1;
            let lessonIndex = -1;

            if (course && course.sections) {
              for (let sIdx = 0; sIdx < course.sections.length; sIdx++) {
                const section = course.sections[sIdx];
                if (section.lessons) {
                  for (let lIdx = 0; lIdx < section.lessons.length; lIdx++) {
                    const lesson = section.lessons[lIdx];
                    const lessonId = lesson._id || lesson.id;
                    const noteLesson = note.lesson;

                    if (
                      lessonId &&
                      noteLesson &&
                      (lessonId.toString() === noteLesson.toString() ||
                        lessonId === noteLesson ||
                        lesson._id === noteLesson ||
                        lesson.id === noteLesson)
                    ) {
                      lessonTitle = lesson.title || `Lesson ${lIdx + 1}`;
                      sectionTitle = section.title || `Section ${sIdx + 1}`;
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
                className="group bg-gradient-to-br from-slate-800/60 to-slate-700/40 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-xl transform hover:scale-102"
              >
                <div className={`${isMobile ? "p-4" : "p-5"}`}>
                  <div
                    className={`flex ${
                      isMobile
                        ? "flex-col space-y-3"
                        : "justify-between items-start"
                    } mb-3`}
                  >
                    {/* Note Header */}
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => {
                          if (sectionIndex !== -1 && lessonIndex !== -1) {
                            loadLesson(sectionIndex, lessonIndex);

                            const seekToTime = () => {
                              const video = videoRef.current;
                              if (video && video.readyState >= 2) {
                                video.currentTime = note.timestamp;
                                setCurrentTime(note.timestamp);
                              } else if (video) {
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

                            if (
                              sectionIndex === currentSection &&
                              lessonIndex === currentLesson
                            ) {
                              setTimeout(seekToTime, 100);
                            } else {
                              setTimeout(seekToTime, 1500);
                            }
                          }
                        }}
                        className={`group/btn w-full text-left hover:bg-blue-600/20 rounded-lg p-2 -m-2 transition-all duration-200 ${
                          isMobile ? "space-y-1" : ""
                        }`}
                        title="Click to jump to this moment in the video"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-400 group-hover/btn:text-blue-300 font-mono text-sm font-medium bg-blue-500/20 px-2 py-0.5 rounded border border-blue-400/30">
                            {formatTime(note.timestamp)}
                          </span>
                          <span className="text-slate-300 group-hover/btn:text-white font-medium text-sm truncate">
                            {lessonTitle}
                          </span>
                        </div>
                        <p
                          className={`${
                            isMobile ? "text-xs" : "text-xs"
                          } text-slate-500 mt-1 group-hover/btn:text-slate-400 transition-colors`}
                        >
                          📚 {sectionTitle}
                        </p>
                      </button>
                    </div>

                    {/* Note Date */}
                    <div
                      className={`${
                        isMobile ? "self-start" : "flex-shrink-0 ml-4"
                      }`}
                    >
                      <span
                        className={`${
                          isMobile ? "text-xs" : "text-sm"
                        } text-slate-400 bg-slate-700/50 px-2 py-1 rounded border border-slate-600/30`}
                      >
                        📅 {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Note Content */}
                  <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
                    <p
                      className={`text-slate-200 ${
                        isMobile ? "text-sm" : ""
                      } leading-relaxed`}
                    >
                      {note.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotesTab;

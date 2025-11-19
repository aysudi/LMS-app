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
  return (
    <div>
      <h3 className="text-2xl font-bold mb-6 text-slate-100">My Notes</h3>

      {/* Add Note */}
      <div className="bg-slate-800/50 p-6 rounded-2xl mb-6 border border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-1">
            <label className="flex items-center space-x-2 text-sm font-medium text-slate-300 mb-2">
              <span>Add a Note</span>
            </label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write your note here..."
              className="w-full bg-slate-700/50 text-slate-100 p-4 rounded-xl border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none resize-none transition-all"
              rows={3}
            />
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <span>🕐</span>
                <span>Note will be saved at {formatTime(currentTime)}</span>
              </div>
              <button
                onClick={addNote}
                disabled={!newNote.trim()}
                className="px-6 py-2 bg-blue-600/90 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all font-medium border border-blue-500/30"
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
                className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 backdrop-blur-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
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
                              video.addEventListener("canplay", handleCanPlay);
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
                      className="text-blue-400 hover:text-blue-300 font-medium text-sm text-left"
                    >
                      {formatTime(note.timestamp)} - {lessonTitle}
                    </button>
                    <p className="text-xs text-slate-500 mt-1">
                      Section: {sectionTitle}
                    </p>
                  </div>
                  <span className="text-slate-400 text-sm">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-200">{note.content}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotesTab;

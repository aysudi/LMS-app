import React from "react";
import { FaTimes } from "react-icons/fa";
import formatTime from "../../utils/formatTime";

interface NotesModalProps {
  showNotes: boolean;
  setShowNotes: (show: boolean) => void;
  isMobile: boolean;
  newNote: string;
  setNewNote: (note: string) => void;
  currentTime: number;
  addNote: () => void;
  allCourseNotes: any[];
}

const NotesModal: React.FC<NotesModalProps> = ({
  showNotes,
  setShowNotes,
  isMobile,
  newNote,
  setNewNote,
  currentTime,
  addNote,
  allCourseNotes,
}) => {
  if (!showNotes) return null;

  return (
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
            <h3 className="text-lg font-bold text-slate-100">Lesson Notes</h3>
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
                  <p className="text-sm text-slate-200 mb-2">{note.content}</p>
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <span className="font-mono">
                      {formatTime(note.timestamp)}
                    </span>
                    <span>•</span>
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
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
  );
};

export default NotesModal;

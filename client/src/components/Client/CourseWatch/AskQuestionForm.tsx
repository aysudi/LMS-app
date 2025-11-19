import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useQAFormState } from "../../../hooks/useQAHelpers";
import { useCreateQuestion } from "../../../hooks/useQA";

type Props = {
  courseId: string | undefined;
  currentLessonObj: any;
};

const AskQuestionForm = ({ courseId, currentLessonObj }: Props) => {
  const [newQuestion, setNewQuestion] = useState({ title: "", content: "" });
  const { stopAsking } = useQAFormState();
  const createQuestionMutation = useCreateQuestion(courseId!);

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

  return (
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
              <span className="font-medium">{currentLessonObj.title}</span>
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
            {createQuestionMutation.isPending ? "Posting..." : "Post Question"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AskQuestionForm;

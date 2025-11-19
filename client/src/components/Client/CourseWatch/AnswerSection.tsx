import { useQuestionDetails } from "../../../hooks/useQA";

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

export default AnswersSection;

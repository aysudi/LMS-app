import { useState } from "react";
import {
  useAcceptAnswer,
  useVoteOnAnswer,
  useVoteOnQuestion,
} from "../../../hooks/useQA";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as qaService from "../../../services/qa.service";
import { useQAFormState } from "../../../hooks/useQAHelpers";
import AnswersSection from "./AnswerSection";

type Props = {
  question: any;
};
const QuestionList = ({ question }: Props) => {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  );
  const voteQuestionMutation = useVoteOnQuestion();
  const voteAnswerMutation = useVoteOnAnswer();
  const acceptAnswerMutation = useAcceptAnswer();
  const queryClient = useQueryClient();
  const [newAnswer, setNewAnswer] = useState("");

  const {
    replyingToQuestionId,
    startReplyingToQuestion,
    stopReplyingToQuestion,
  } = useQAFormState();

  const { mutate: createAnswerMutate } = useMutation({
    mutationFn: ({
      questionId,
      data,
    }: {
      questionId: string;
      data: { content: string };
    }) => qaService.createAnswer(questionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("qa"),
      });
      setNewAnswer("");
      stopReplyingToQuestion();
    },
    onError: (error: any) => {
      console.error("Error creating answer:", error);
    },
  });

  const handleCreateAnswer = (questionId: string) => {
    if (!newAnswer.trim()) return;

    createAnswerMutate({
      questionId,
      data: { content: newAnswer.trim() },
    });
  };

  const handleVoteAnswer = (
    answerId: string,
    voteType: "upvote" | "downvote"
  ) => {
    voteAnswerMutation.mutate({
      answerId,
      voteData: { type: voteType },
    });
  };

  const handleAcceptAnswer = (questionId: string, answerId: string) => {
    acceptAnswerMutation.mutate({ questionId, answerId });
  };

  const toggleQuestionExpansion = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleVoteQuestion = (
    questionId: string,
    voteType: "upvote" | "downvote"
  ) => {
    voteQuestionMutation.mutate({
      questionId,
      voteData: { type: voteType },
    });
  };

  return (
    <div
      key={question._id}
      className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/30 rounded-2xl border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 backdrop-blur-sm"
    >
      <div className="flex items-start space-x-4">
        {/* Vote Section */}
        <div className="flex flex-col items-center space-y-2 min-w-16">
          <button
            onClick={() => handleVoteQuestion(question._id, "upvote")}
            className={`p-2 rounded-lg transition-all hover:scale-110 ${
              question.userVoteType === "upvote"
                ? "bg-green-500/20 text-green-400 border border-green-500/50"
                : "bg-gray-700/50 text-gray-400 hover:bg-green-500/10 hover:text-green-400"
            }`}
          >
            ▲
          </button>
          <span
            className={`font-bold text-lg ${
              question.voteScore > 0
                ? "text-green-400"
                : question.voteScore < 0
                ? "text-red-400"
                : "text-gray-400"
            }`}
          >
            {question.voteScore}
          </span>
          <button
            onClick={() => handleVoteQuestion(question._id, "downvote")}
            className={`p-2 rounded-lg transition-all hover:scale-110 ${
              question.userVoteType === "downvote"
                ? "bg-red-500/20 text-red-400 border border-red-500/50"
                : "bg-gray-700/50 text-gray-400 hover:bg-red-500/10 hover:text-red-400"
            }`}
          >
            ▼
          </button>
        </div>

        {/* Question Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white mb-2 hover:text-purple-300 transition-colors">
                {question.title}
              </h4>
              <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {question.user.firstName?.[0] || "U"}
                  </div>
                  <span>
                    {question.user.firstName} {question.user.lastName}
                  </span>
                </div>
                <span>•</span>
                <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                {question.lesson && (
                  <>
                    <span>•</span>
                    <span className="text-blue-400">
                      {question.lesson.title}
                    </span>
                  </>
                )}
              </div>
            </div>

            {question.isAnswered && (
              <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30 text-sm font-medium">
                ✓ Answered
              </div>
            )}
          </div>

          <p className="text-gray-300 mb-4 leading-relaxed">
            {question.content}
          </p>

          {question.tags && question.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {question.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs border border-purple-500/30"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <button
                onClick={() => toggleQuestionExpansion(question._id)}
                className="flex items-center space-x-1 hover:text-purple-300 transition-colors"
              >
                <span>💬</span>
                <span>{question.answersCount} answers</span>
                <span className="ml-1">
                  {expandedQuestions.has(question._id) ? "▲" : "▼"}
                </span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {question.answersCount > 0 && (
                <button
                  onClick={() => toggleQuestionExpansion(question._id)}
                  className="px-4 py-2 bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 rounded-lg transition-all border border-purple-500/30 hover:border-purple-400/50"
                >
                  {expandedQuestions.has(question._id)
                    ? "Hide Answers"
                    : "View Answers"}
                </button>
              )}
              <button
                onClick={() => startReplyingToQuestion(question._id)}
                className="px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg transition-all border border-blue-500/30 hover:border-blue-400/50"
              >
                Reply
              </button>
            </div>
          </div>

          {/* Answer Form */}
          {replyingToQuestionId === question._id && (
            <div className="mt-4 p-4 bg-blue-900/20 rounded-xl border border-blue-500/30">
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Write your answer..."
                rows={3}
                className="w-full p-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all resize-none"
              />
              <div className="flex justify-end space-x-3 mt-3">
                <button
                  onClick={stopReplyingToQuestion}
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleCreateAnswer(question._id)}
                  disabled={!newAnswer.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Post Answer
                </button>
              </div>
            </div>
          )}

          {/* Answers Section */}
          {expandedQuestions.has(question._id) && (
            <AnswersSection
              question={question}
              onVoteAnswer={handleVoteAnswer}
              onAcceptAnswer={handleAcceptAnswer}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionList;

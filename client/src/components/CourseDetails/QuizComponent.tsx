import React from "react";

interface QuizComponentProps {
  questions?: any[];
  quiz?: any[];
  onComplete?: (score: number) => void;
  onQuizComplete?: (score: number, passed: boolean) => void;
  onClose?: () => void;
  timeLimit?: number;
  title?: string;
}

const QuizComponent: React.FC<QuizComponentProps> = ({
  quiz,
  questions,
  onComplete,
  onQuizComplete,
  onClose,
  timeLimit,
  title,
}) => {
  const quizData = questions || quiz || [];

  return (
    <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {title || "Quiz"} ({quizData.length} questions)
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>
      {timeLimit && (
        <p className="text-sm text-gray-600 mb-4">
          Time limit: {timeLimit} minutes
        </p>
      )}
      <p className="text-gray-600">Quiz functionality coming soon...</p>
      {(onComplete || onQuizComplete) && (
        <button
          onClick={() => {
            if (onComplete) onComplete(0);
            if (onQuizComplete) onQuizComplete(0, true);
          }}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Complete Quiz
        </button>
      )}
    </div>
  );
};

export default QuizComponent;

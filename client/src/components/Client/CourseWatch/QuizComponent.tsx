import React, { useState, useEffect } from "react";
import { FaTimes, FaClock, FaCheck, FaTimes as FaX } from "react-icons/fa";

interface QuizQuestion {
  _id?: string;
  id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizComponentProps {
  questions?: QuizQuestion[];
  quiz?: QuizQuestion[];
  onComplete?: (score: number) => void;
  onQuizComplete?: (score: number, passed: boolean) => void;
  onClose?: () => void;
  timeLimit?: number;
  title?: string;
  passingScore?: number;
}

const QuizComponent: React.FC<QuizComponentProps> = ({
  quiz,
  questions,
  onComplete,
  onQuizComplete,
  onClose,
  timeLimit,
  title,
  passingScore = 70,
}) => {
  const quizData = questions || quiz || [];
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    new Array(quizData.length).fill(null)
  );
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit ? timeLimit * 60 : null);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Timer effect
  useEffect(() => {
    if (timeLeft && timeLeft > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev && prev <= 1) {
            setIsTimeUp(true);
            handleSubmitQuiz();
            return 0;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResults || isTimeUp) return;

    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === quizData[index].correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / quizData.length) * 100);
  };

  const handleSubmitQuiz = () => {
    const score = calculateScore();
    const passed = score >= passingScore;

    setShowResults(true);

    if (onComplete) onComplete(score);
    if (onQuizComplete) onQuizComplete(score, passed);
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(quizData.length).fill(null));
    setShowResults(false);
    setIsTimeUp(false);
    if (timeLimit) {
      setTimeLeft(timeLimit * 60);
    }
  };

  if (!quizData || quizData.length === 0) {
    return (
      <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">
            No Quiz Available
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <FaTimes />
            </button>
          )}
        </div>
        <p className="text-slate-400">This lesson doesn't have a quiz.</p>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const passed = score >= passingScore;

    return (
      <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Quiz Results</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <div className="text-center mb-6">
          <div
            className={`text-4xl font-bold mb-2 ${
              passed ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {score}%
          </div>
          <div
            className={`text-lg font-medium mb-4 ${
              passed ? "text-emerald-300" : "text-red-300"
            }`}
          >
            {passed
              ? "🎉 Congratulations! You passed!"
              : "😔 You didn't pass this time"}
          </div>
          <div className="text-slate-400 text-sm">
            You got{" "}
            {
              selectedAnswers.filter(
                (answer, index) => answer === quizData[index].correctAnswer
              ).length
            }{" "}
            out of {quizData.length} questions correct
          </div>
          <div className="text-slate-400 text-sm">
            Passing score: {passingScore}%
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {quizData.map((question, index) => {
            const userAnswer = selectedAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;

            return (
              <div
                key={question._id || question.id || index}
                className="border border-slate-600 rounded-lg p-4"
              >
                <div className="flex items-start space-x-3 mb-3">
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      isCorrect ? "bg-emerald-500" : "bg-red-500"
                    }`}
                  >
                    {isCorrect ? (
                      <FaCheck className="text-white text-xs" />
                    ) : (
                      <FaX className="text-white text-xs" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium mb-2">
                      {question.question}
                    </p>
                    <div className="space-y-1">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-2 rounded text-sm ${
                            optionIndex === question.correctAnswer
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                              : optionIndex === userAnswer &&
                                userAnswer !== question.correctAnswer
                              ? "bg-red-500/20 text-red-300 border border-red-500/50"
                              : "bg-slate-700/50 text-slate-300"
                          }`}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                    {question.explanation && (
                      <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded text-blue-300 text-sm">
                        <strong>Explanation:</strong> {question.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center space-x-4">
          {!passed && (
            <button
              onClick={handleRetakeQuiz}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Retake Quiz
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const currentQ = quizData[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.length) * 100;

  return (
    <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">
            {title || "Quiz"}
          </h3>
          <div className="text-slate-400 text-sm">
            Question {currentQuestion + 1} of {quizData.length}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {timeLeft !== null && (
            <div
              className={`flex items-center space-x-2 ${
                timeLeft < 60 ? "text-red-400" : "text-slate-400"
              }`}
            >
              <FaClock />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h4 className="text-lg font-medium text-white mb-4">
          {currentQ.question}
        </h4>

        <div className="space-y-3">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={isTimeUp}
              className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                selectedAnswers[currentQuestion] === index
                  ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                  : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500"
              } ${
                isTimeUp ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswers[currentQuestion] === index
                      ? "border-purple-500 bg-purple-500"
                      : "border-slate-500"
                  }`}
                >
                  {selectedAnswers[currentQuestion] === index && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevQuestion}
          disabled={currentQuestion === 0}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          Previous
        </button>

        <div className="flex space-x-2">
          {quizData.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentQuestion
                  ? "bg-purple-500"
                  : selectedAnswers[index] !== null
                  ? "bg-emerald-500"
                  : "bg-slate-600"
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNextQuestion}
          disabled={selectedAnswers[currentQuestion] === null || isTimeUp}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          {currentQuestion === quizData.length - 1 ? "Submit" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default QuizComponent;

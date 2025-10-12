import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaQuestionCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaTrophy,
  FaBrain,
  FaLightbulb,
  FaRocket,
  FaArrowLeft,
  FaArrowRight,
  FaPlay,
} from "react-icons/fa";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizComponentProps {
  questions: QuizQuestion[];
  onQuizComplete: (score: number, passed: boolean) => void;
  onClose: () => void;
  passingScore?: number;
  timeLimit?: number; // in seconds
  title?: string;
}

const QuizComponent: React.FC<QuizComponentProps> = ({
  questions,
  onQuizComplete,
  onClose,
  passingScore = 80,
  timeLimit,
  title = "Knowledge Check",
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(
    new Array(questions.length).fill(-1)
  );
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  const currentQ = questions[currentQuestion];

  useEffect(() => {
    if (timeLimit && timeLeft && timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResults) {
      handleSubmitQuiz();
    }
  }, [timeLeft, showResults, timeLimit]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
    const correctAnswers = selectedAnswers.filter(
      (answer, index) => answer === questions[index].correctAnswer
    ).length;
    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= passingScore;
    onQuizComplete(score, passed);
  };

  const handleReturnToVideo = () => {
    onClose();
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <FaTrophy className="text-yellow-500" />;
    if (score >= 80) return <FaRocket className="text-blue-500" />;
    if (score >= 70) return <FaBrain className="text-purple-500" />;
    return <FaLightbulb className="text-gray-500" />;
  };

  if (showResults) {
    const correctAnswers = selectedAnswers.filter(
      (answer, index) => answer === questions[index].correctAnswer
    ).length;
    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= passingScore;

    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
        {/* Results Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Quiz Results</h2>
            <button
              onClick={handleReturnToVideo}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FaPlay className="text-sm" />
              Return to Video
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Score Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-white rounded-xl shadow-lg p-8 mb-6 border-l-4 ${
                passed ? "border-green-500" : "border-red-500"
              }`}
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-16 h-16 mb-4"
                >
                  {getScoreIcon(score)}
                </motion.div>
                <h3 className="text-2xl font-bold mb-2">
                  {passed ? "🎉 Congratulations!" : "Keep Learning!"}
                </h3>
                <p className="text-gray-600 mb-4">
                  You scored {correctAnswers} out of {questions.length}{" "}
                  questions correctly
                </p>
                <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
                  {score}%
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {passed
                    ? `Passing score: ${passingScore}%`
                    : `You need ${passingScore}% to pass`}
                </p>
              </div>
            </motion.div>

            {/* Question Review */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Question Review
              </h4>
              {questions.map((question, index) => {
                const userAnswer = selectedAnswers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                const wasAnswered = userAnswer !== -1;

                return (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 bg-white rounded-lg shadow border-l-4 ${
                      isCorrect
                        ? "border-green-500"
                        : wasAnswered
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {isCorrect ? (
                          <FaCheckCircle className="text-green-500 text-xl" />
                        ) : wasAnswered ? (
                          <FaTimesCircle className="text-red-500 text-xl" />
                        ) : (
                          <FaQuestionCircle className="text-gray-400 text-xl" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 mb-3">
                          {index + 1}. {question.question}
                        </h5>
                        <div className="space-y-2 text-sm">
                          {wasAnswered && (
                            <p>
                              <span className="font-medium">Your answer:</span>{" "}
                              <span
                                className={
                                  isCorrect ? "text-green-700" : "text-red-700"
                                }
                              >
                                {question.options[userAnswer]}
                              </span>
                            </p>
                          )}
                          {!wasAnswered && (
                            <p className="text-gray-600">
                              <span className="font-medium">Not answered</span>
                            </p>
                          )}
                          {!isCorrect && (
                            <p>
                              <span className="font-medium">
                                Correct answer:
                              </span>{" "}
                              <span className="text-green-700">
                                {question.options[question.correctAnswer]}
                              </span>
                            </p>
                          )}
                          {question.explanation && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <p className="text-blue-800">
                                <span className="font-medium">
                                  Explanation:
                                </span>{" "}
                                {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-blue-50 flex flex-col">
      {/* Quiz Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaQuestionCircle className="text-blue-600 text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <FaPlay className="text-sm" />
            Return to Video
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-600 mb-2">
            <span>Progress</span>
            <span>
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Timer */}
        {timeLimit && timeLeft !== undefined && timeLeft > 0 && (
          <div className="flex items-center gap-2 mt-3 text-sm">
            <FaClock className="text-orange-500" />
            <span
              className={`font-medium ${
                timeLeft <= 60 ? "text-red-600" : "text-gray-700"
              }`}
            >
              {Math.floor(timeLeft / 60)}:
              {String(timeLeft % 60).padStart(2, "0")} remaining
            </span>
          </div>
        )}
      </div>

      {/* Quiz Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Question */}
              <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-8 leading-relaxed">
                  {currentQ.question}
                </h2>

                {/* Options - Always Visible */}
                <div className="space-y-4">
                  {currentQ.options.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        selectedAnswers[currentQuestion] === index
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedAnswers[currentQuestion] === index
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedAnswers[currentQuestion] === index && (
                            <FaCheckCircle className="text-white text-sm" />
                          )}
                        </div>
                        <span className="text-gray-900 font-medium">
                          {option}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestion === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaArrowLeft />
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {questions.map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full ${
                        index === currentQuestion
                          ? "bg-blue-500"
                          : selectedAnswers[index] !== -1
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>

                {currentQuestion === questions.length - 1 ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={selectedAnswers[currentQuestion] === -1}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Submit Quiz
                    <FaCheckCircle />
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    disabled={selectedAnswers[currentQuestion] === -1}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <FaArrowRight />
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default QuizComponent;

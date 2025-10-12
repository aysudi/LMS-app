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
  passingScore?: number;
  timeLimit?: number; // in seconds
  title?: string;
}

const QuizComponent: React.FC<QuizComponentProps> = ({
  questions,
  onQuizComplete,
  passingScore = 80,
  timeLimit,
  title = "Knowledge Check",
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);


  // Timer effect
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
    const correctAnswers = selectedAnswers.filter(
      (answer, index) => answer === questions[index].correctAnswer
    ).length;
    
    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= passingScore;
    
    setShowResults(true);
    onQuizComplete(score, passed);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto p-8"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Results Header */}
          <div className={`p-8 text-white ${passed ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-red-500 to-pink-600"}`}>
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4"
              >
                {passed ? (
                  <FaCheckCircle className="text-4xl" />
                ) : (
                  <FaTimesCircle className="text-4xl" />
                )}
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">
                {passed ? "🎉 Congratulations!" : "Keep Learning!"}
              </h2>
              <p className="text-xl opacity-90">
                {passed 
                  ? "You've successfully completed the quiz!" 
                  : `You need ${passingScore}% to pass. Try again!`
                }
              </p>
            </div>
          </div>

          {/* Score Details */}
          <div className="p-8">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className={`text-4xl font-bold mb-2 ${getScoreColor(score)}`}>
                  {score}%
                </div>
                <p className="text-gray-600 font-medium">Your Score</p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {correctAnswers}/{questions.length}
                </div>
                <p className="text-gray-600 font-medium">Correct Answers</p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="text-4xl mb-2 flex justify-center">
                  {getScoreIcon(score)}
                </div>
                <p className="text-gray-600 font-medium">
                  {score >= 90 ? "Excellent" : score >= 80 ? "Great" : score >= 70 ? "Good" : "Needs Work"}
                </p>
              </div>
            </div>

            {/* Question Review */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Review Your Answers</h3>
              {questions.map((question, index) => {
                const userAnswer = selectedAnswers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border-2 ${
                      isCorrect 
                        ? "border-green-200 bg-green-50" 
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-1 rounded-full ${
                        isCorrect ? "bg-green-500" : "bg-red-500"
                      }`}>
                        {isCorrect ? (
                          <FaCheckCircle className="text-white text-sm" />
                        ) : (
                          <FaTimesCircle className="text-white text-sm" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-2">
                          {index + 1}. {question.question}
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="font-medium">Your answer:</span>{" "}
                            <span className={isCorrect ? "text-green-700" : "text-red-700"}>
                              {question.options[userAnswer] || "Not answered"}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p>
                              <span className="font-medium">Correct answer:</span>{" "}
                              <span className="text-green-700">
                                {question.options[question.correctAnswer]}
                              </span>
                            </p>
                          )}
                          {question.explanation && (
                            <p className="text-gray-600 mt-2">
                              <span className="font-medium">Explanation:</span> {question.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-8">
              {!passed && (
                <button
                  onClick={() => {
                    setShowResults(false);
                    setCurrentQuestion(0);
                    setSelectedAnswers([]);
                    setTimeLeft(timeLimit);
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                >
                  Try Again
                </button>
              )}
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
              >
                Back to Course
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Quiz Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-2">{title}</h1>
              <div className="flex items-center gap-4 text-purple-100">
                <span className="flex items-center gap-2">
                  <FaQuestionCircle />
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                {timeLimit && timeLeft && (
                  <span className={`flex items-center gap-2 ${
                    timeLeft < 60 ? "text-yellow-300 font-bold" : ""
                  }`}>
                    <FaClock />
                    {formatTime(timeLeft)}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</div>
              <div className="text-sm text-purple-100">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 bg-white/20 rounded-full h-2">
            <motion.div
              className="bg-white rounded-full h-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Question Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-8">
                {currentQ.question}
              </h2>

              <div className="space-y-4 mb-8">
                {currentQ.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                      selectedAnswers[currentQuestion] === index
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswers[currentQuestion] === index
                          ? "border-purple-500 bg-purple-500"
                          : "border-gray-300"
                      }`}>
                        {selectedAnswers[currentQuestion] === index && (
                          <FaCheckCircle className="text-white text-sm" />
                        )}
                      </div>
                      <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                      <span className="flex-1">{option}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              ← Previous
            </button>

            <div className="flex gap-2">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === currentQuestion
                      ? "bg-purple-500"
                      : selectedAnswers[index] !== undefined
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNextQuestion}
              disabled={selectedAnswers[currentQuestion] === undefined}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {currentQuestion === questions.length - 1 ? "Submit Quiz" : "Next →"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default QuizComponent;

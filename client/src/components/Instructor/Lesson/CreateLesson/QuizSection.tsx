import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaPlus, FaQuestionCircle, FaTrash } from "react-icons/fa";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

type Props = {
  quiz: QuizQuestion[];
  setQuiz: (quiz: QuizQuestion[]) => void;
};

const QuizSection = ({ quiz, setQuiz }: Props) => {
  const { t } = useTranslation();

  const addQuizQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `question-${Date.now()}`,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    };
    setQuiz([...quiz, newQuestion]);
  };

  const updateQuizQuestion = (id: string, updates: Partial<QuizQuestion>) => {
    setQuiz(quiz.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const removeQuizQuestion = (id: string) => {
    setQuiz(quiz.filter((q) => q.id !== id));
  };

  const updateQuizOption = (
    questionId: string,
    optionIndex: number,
    value: string
  ) => {
    const question = quiz.find((q) => q.id === questionId);
    if (question) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuizQuestion(questionId, { options: newOptions });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <FaQuestionCircle className="mr-2 text-indigo-600" />
          {t("instructor.editCourse.lessonCreate.lessonQuiz")}
        </h2>
        <button
          onClick={addQuizQuestion}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium cursor-pointer"
        >
          <FaPlus className="mr-2" />
          {t("instructor.editCourse.lessonCreate.addQuestion")}
        </button>
      </div>

      <div className="space-y-6">
        {quiz.map((question, qIndex) => (
          <div
            key={question.id}
            className="border border-gray-200 rounded-xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-medium text-gray-900">
                {t("instructor.editCourse.lessonCreate.question", {
                  index: qIndex + 1,
                })}
              </h3>
              <button
                onClick={() => removeQuizQuestion(question.id)}
                className="text-red-600 hover:text-red-700 p-1 cursor-pointer"
              >
                <FaTrash />
              </button>
            </div>

            <div className="space-y-4">
              <textarea
                value={question.question}
                onChange={(e) =>
                  updateQuizQuestion(question.id, {
                    question: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                placeholder={t(
                  "instructor.editCourse.lessonCreate.enterQuestion"
                )}
                rows={2}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`correct-${question.id}`}
                      checked={question.correctAnswer === oIndex}
                      onChange={() =>
                        updateQuizQuestion(question.id, {
                          correctAnswer: oIndex,
                        })
                      }
                      className="text-green-600 focus:ring-green-500"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) =>
                        updateQuizOption(question.id, oIndex, e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder={t(
                        "instructor.editCourse.lessonCreate.option",
                        {
                          index: oIndex + 1,
                        }
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {quiz.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FaQuestionCircle className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            <p>{t("instructor.editCourse.lessonCreate.noQuizQuestions")}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default QuizSection;

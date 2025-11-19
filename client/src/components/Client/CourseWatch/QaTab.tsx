import { useQAFilters, useQAFormState } from "../../../hooks/useQAHelpers";
import AskQuestionForm from "./AskQuestionForm";
import QuestionList from "./QuestionList";

interface Props {
  questionsData: any;
  courseId: any;
  currentLessonObj: any;
  questionsLoading: boolean;
}
const QaTab = ({
  questionsData,
  courseId,
  currentLessonObj,
  questionsLoading,
}: Props) => {
  const { isAsking, startAsking } = useQAFormState();

  const {
    filters: qaFilters,
    setSearch: setQASearch,
    setAnswered,
    setSortBy: setQASortBy,
  } = useQAFilters();

  return (
    <div className="max-w-none">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Q&A Discussion
          </h3>
          <div className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30">
            <span className="text-sm text-purple-300 font-medium">
              {questionsData?.data?.pagination?.totalQuestions || 0} questions
            </span>
          </div>
        </div>

        {!isAsking && (
          <button
            onClick={startAsking}
            className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 active:scale-95"
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">❓</span>
              <span>Ask Question</span>
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/0 via-purple-400/10 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        )}
      </div>

      {/* Ask Question Form */}
      {isAsking && (
        <AskQuestionForm
          courseId={courseId}
          currentLessonObj={currentLessonObj}
        />
      )}

      {/* Filters and Search */}
      <div className="mb-6 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 backdrop-blur-sm">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <input
                type="text"
                placeholder="Search questions..."
                onChange={(e) => setQASearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
          </div>

          <select
            onChange={(e) =>
              setAnswered(
                e.target.value === "all" ? null : e.target.value === "true"
              )
            }
            className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="all">All Questions</option>
            <option value="false">Unanswered</option>
            <option value="true">Answered</option>
          </select>

          <select
            value={qaFilters.sortBy}
            onChange={(e) => setQASortBy(e.target.value)}
            className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="popular">Most Popular</option>
            <option value="unanswered">Unanswered First</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {questionsLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : !questionsData?.data?.questions?.length ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❓</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No questions yet
            </h3>
            <p className="text-gray-400 mb-6">
              Be the first to ask a question about this course!
            </p>
            <button
              onClick={startAsking}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              Ask First Question
            </button>
          </div>
        ) : (
          questionsData.data.questions.map((question: any) => (
            <QuestionList question={question} />
          ))
        )}
      </div>

      {/* Pagination */}
      {questionsData?.data?.pagination &&
        questionsData.data.pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              {Array.from(
                { length: questionsData.data.pagination.totalPages },
                (_, index) => (
                  <button
                    key={index}
                    onClick={() => setQASearch("")}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      qaFilters.page === index + 1
                        ? "bg-purple-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {index + 1}
                  </button>
                )
              )}
            </div>
          </div>
        )}
    </div>
  );
};

export default QaTab;

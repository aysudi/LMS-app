import React from "react";
import { motion } from "framer-motion";
import { FaGraduationCap } from "react-icons/fa";
import Loading from "../Common/Loading";
import CourseCard from "../Client/CourseCard";

interface CoursesContentProps {
  isLoading: boolean;
  error: any;
  courses: any[];
  searchQuery: string;
  viewMode: "grid" | "list";
  pagination: any;
  handlePageChange: (page: number) => void;
  clearFilters: () => void;
  t: (key: string, options?: any) => string;
}

const CoursesContent: React.FC<CoursesContentProps> = ({
  isLoading,
  error,
  courses,
  searchQuery,
  viewMode,
  pagination,
  handlePageChange,
  clearFilters,
  t,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Loading State */}
      {isLoading && (
        <Loading variant="page" message={t("courses.loadingCourses")} />
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-24">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-10 max-w-md mx-auto">
            <div className="text-red-500 text-xl mb-6 font-semibold">
              {t("courses.failedToLoad")}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium"
            >
              {t("courses.tryAgain")}
            </button>
          </div>
        </div>
      )}

      {/* No Results */}
      {!isLoading && !error && courses.length === 0 && (
        <div className="text-center py-24">
          <div className="bg-white rounded-3xl p-12 max-w-md mx-auto shadow-sm border border-gray-100">
            <FaGraduationCap className="text-8xl text-gray-300 mb-6 mx-auto" />
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              {t("courses.noCoursesFound")}
            </h3>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              {searchQuery
                ? t("courses.noSearchResults", { query: searchQuery })
                : t("courses.noFilterResults")}
            </p>
            <button
              onClick={clearFilters}
              className="px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 font-medium"
            >
              {t("courses.clearFilters")}
            </button>
          </div>
        </div>
      )}

      {/* Courses Grid/List */}
      {!isLoading && !error && courses.length > 0 && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`${
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                : "space-y-6"
            }`}
          >
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CourseCard course={course} viewMode={viewMode} />
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-12 flex justify-center"
            >
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("courses.previous")}
                </button>

                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const pageNum = Math.max(1, pagination.currentPage - 2) + i;
                    if (pageNum > pagination.totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          pageNum === pagination.currentPage
                            ? "bg-indigo-600 text-white"
                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("courses.next")}
                </button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default CoursesContent;

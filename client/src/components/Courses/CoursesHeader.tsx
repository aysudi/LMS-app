import React from "react";
import { FaTh, FaList } from "react-icons/fa";

interface CoursesHeaderProps {
  searchQuery: string;
  filters: {
    category: string;
    level: string;
    minPrice: string;
    maxPrice: string;
    isFree: boolean;
  };
  pagination: any;
  isLoading: boolean;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  t: (key: string, options?: any) => string;
}

const CoursesHeader: React.FC<CoursesHeaderProps> = ({
  searchQuery,
  filters,
  pagination,
  isLoading,
  viewMode,
  setViewMode,
  t,
}) => {
  return (
    <div className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title & Stats */}
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                {searchQuery
                  ? t("courses.searchResults", { query: searchQuery })
                  : t("courses.discoverCourses")}
              </h1>

              {/* Active Filters Display */}
              {(searchQuery ||
                filters.category ||
                filters.level ||
                filters.minPrice ||
                filters.maxPrice ||
                filters.isFree) && (
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {searchQuery && (
                    <span className="inline-flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
                      🔍 {t("courses.searchLabel")}: "{searchQuery}"
                    </span>
                  )}
                  {filters.category && (
                    <span className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      📂 {t("courses.category")}: {filters.category}
                    </span>
                  )}
                  {filters.level && (
                    <span className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      📊 {t("courses.level")}: {filters.level}
                    </span>
                  )}
                  {(filters.minPrice || filters.maxPrice) && (
                    <span className="inline-flex items-center px-3 py-1.5 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                      💰 Price: {filters.minPrice || "0"}$ -{" "}
                      {filters.maxPrice || "∞"}$
                    </span>
                  )}
                  {filters.isFree && (
                    <span className="inline-flex items-center px-3 py-1.5 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                      🆓 {t("courses.freeOnly")}
                    </span>
                  )}
                </div>
              )}

              <p className="text-gray-600 text-lg">
                {!isLoading && pagination && pagination.totalCourses > 0 && (
                  <span>
                    {t("courses.showingResults", {
                      start: (pagination.currentPage - 1) * 12 + 1,
                      end: Math.min(
                        pagination.currentPage * 12,
                        pagination.totalCourses
                      ),
                      total: pagination.totalCourses,
                    })}
                  </span>
                )}
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <FaTh className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <FaList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesHeader;

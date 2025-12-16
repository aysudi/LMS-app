import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";

interface CoursesFiltersProps {
  filters: {
    category: string;
    level: string;
    minPrice: string;
    maxPrice: string;
    isFree: boolean;
  };
  searchQuery: string;
  showFilters: boolean;
  handleFilterChange: (key: string, value: string | boolean) => void;
  updateSearchParams: (updates: Record<string, string | null>) => void;
  clearFilters: () => void;
  t: (key: string) => string;
}

const CoursesFilters: React.FC<CoursesFiltersProps> = ({
  filters,
  searchQuery,
  showFilters,
  handleFilterChange,
  updateSearchParams,
  clearFilters,
  t,
}) => {
  const [searchParams] = useSearchParams();

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex flex-wrap items-center gap-6">
            {/* Filter Toggle */}

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Level Filter */}
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange("level", e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">{t("courses.allLevels")}</option>
                <option value="Beginner">{t("courses.levels.beginner")}</option>
                <option value="Intermediate">
                  {t("courses.levels.intermediate")}
                </option>
                <option value="Advanced">{t("courses.levels.advanced")}</option>
              </select>

              {/* Price Range */}
              <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  💰 Price:
                </span>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) =>
                    handleFilterChange("minPrice", e.target.value)
                  }
                  className="w-20 px-2 py-1 border-0 bg-transparent text-sm focus:outline-none focus:ring-0"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleFilterChange("maxPrice", e.target.value)
                  }
                  className="w-20 px-2 py-1 border-0 bg-transparent text-sm focus:outline-none focus:ring-0"
                />
                <span className="text-sm text-gray-500">$</span>
              </div>
            </div>

            {/* Sort */}
            <div className="ml-auto flex items-center space-x-3">
              <span className="text-sm text-gray-600 font-medium">
                {t("courses.sortBy")}:
              </span>
              <select
                value={`${searchParams.get("sortBy") || "rating"}-${
                  searchParams.get("sortOrder") || "desc"
                }`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split("-");
                  updateSearchParams({
                    sortBy,
                    sortOrder,
                    page: "1",
                  });
                }}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              >
                <option value="rating-desc">
                  {t("courses.sortOptions.highestRated")}
                </option>
                <option value="originalPrice-asc">
                  {t("courses.sortOptions.priceLowToHigh")}
                </option>
                <option value="originalPrice-desc">
                  {t("courses.sortOptions.priceHighToLow")}
                </option>
                <option value="createdAt-desc">
                  {t("courses.sortOptions.newestFirst")}
                </option>
              </select>
            </div>

            {/* Clear Filters */}
            {(searchQuery ||
              filters.category ||
              filters.level ||
              filters.minPrice ||
              filters.maxPrice ||
              filters.isFree) && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium"
              >
                {t("courses.clearAll")}
              </button>
            )}
          </div>

          {/* Additional Filter Options */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-6 border-t border-gray-100 mt-4">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Additional Filters
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Popular Price Ranges */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Quick Price Ranges
                        </label>
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              handleFilterChange("minPrice", "");
                              handleFilterChange("maxPrice", "");
                              handleFilterChange("isFree", true);
                            }}
                            className="w-full text-left px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            🆓 Free Courses
                          </button>
                          <button
                            onClick={() => {
                              handleFilterChange("minPrice", "0");
                              handleFilterChange("maxPrice", "50");
                              handleFilterChange("isFree", false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            💚 Under $50
                          </button>
                          <button
                            onClick={() => {
                              handleFilterChange("minPrice", "50");
                              handleFilterChange("maxPrice", "100");
                              handleFilterChange("isFree", false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            💛 $50 - $100
                          </button>
                          <button
                            onClick={() => {
                              handleFilterChange("minPrice", "100");
                              handleFilterChange("maxPrice", "");
                              handleFilterChange("isFree", false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            💎 Premium ($100+)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CoursesFilters;

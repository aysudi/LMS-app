import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaTimes,
} from "react-icons/fa";

export type SortOption =
  | "newest"
  | "oldest"
  | "title-asc"
  | "title-desc"
  | "students-desc"
  | "students-asc"
  | "price-desc"
  | "price-asc"
  | "rating-desc"
  | "rating-asc";

export type StatusFilter =
  | "all"
  | "published"
  | "draft"
  | "pending"
  | "rejected";

export type PriceFilter =
  | "all"
  | "free"
  | "paid"
  | "under-50"
  | "50-100"
  | "over-100";

export type RatingFilter = "all" | "4-plus" | "3-plus" | "2-plus" | "1-plus";

interface CourseFiltersProps {
  searchTerm: string;
  onSearchChange: (search: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  categories?: string[];
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  priceFilter?: PriceFilter;
  onPriceFilterChange?: (price: PriceFilter) => void;
  ratingFilter?: RatingFilter;
  onRatingFilterChange?: (rating: RatingFilter) => void;
  courseCount: number;
}

const CourseFilters: React.FC<CourseFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  categories = [],
  selectedCategory = "all",
  onCategoryChange,
  priceFilter = "all",
  onPriceFilterChange,
  ratingFilter = "all",
  onRatingFilterChange,
  courseCount,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "title-asc", label: "Title A-Z" },
    { value: "title-desc", label: "Title Z-A" },
    { value: "students-desc", label: "Most Students" },
    { value: "students-asc", label: "Least Students" },
    { value: "price-desc", label: "Highest Price" },
    { value: "price-asc", label: "Lowest Price" },
    { value: "rating-desc", label: "Highest Rating" },
    { value: "rating-asc", label: "Lowest Rating" },
  ];

  const statusOptions = [
    { value: "all", label: "All Courses" },
    { value: "published", label: "Published" },
    { value: "draft", label: "Draft" },
    { value: "pending", label: "Pending" },
    { value: "rejected", label: "Rejected" },
  ];

  const priceOptions = [
    { value: "all", label: "All Prices" },
    { value: "free", label: "Free" },
    { value: "paid", label: "Paid" },
    { value: "under-50", label: "Under $50" },
    { value: "50-100", label: "$50 - $100" },
    { value: "over-100", label: "Over $100" },
  ];

  const ratingOptions = [
    { value: "all", label: "All Ratings" },
    { value: "4-plus", label: "4+ Stars" },
    { value: "3-plus", label: "3+ Stars" },
    { value: "2-plus", label: "2+ Stars" },
    { value: "1-plus", label: "1+ Stars" },
  ];

  const hasActiveFilters =
    searchTerm ||
    statusFilter !== "all" ||
    (selectedCategory && selectedCategory !== "all") ||
    priceFilter !== "all" ||
    ratingFilter !== "all";

  const clearAllFilters = () => {
    onSearchChange("");
    onStatusFilterChange("all");
    onCategoryChange?.("all");
    onPriceFilterChange?.("all");
    onRatingFilterChange?.("all");
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* Main Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="text-sm" />
            </button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) =>
              onStatusFilterChange(e.target.value as StatusFilter)
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 border rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
              showFilters
                ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FaFilter className="text-sm" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* Extended Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            key="filters"
            initial={{ opacity: 0, height: 0, overflow: "hidden" }}
            animate={{
              opacity: 1,
              height: "auto",
              transition: {
                height: { duration: 0.3, ease: "easeInOut" },
                opacity: { duration: 0.2, delay: 0.1 },
              },
            }}
            exit={{
              opacity: 0,
              height: 0,
              transition: {
                height: { duration: 0.3, ease: "easeInOut", delay: 0.1 },
                opacity: { duration: 0.2 },
              },
            }}
            className="mt-6 pt-6 border-t border-gray-200"
            style={{ overflow: "hidden" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Categories */}
              {categories.length > 0 && onCategoryChange && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Price Range */}
              {onPriceFilterChange && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <select
                    value={priceFilter}
                    onChange={(e) =>
                      onPriceFilterChange(e.target.value as PriceFilter)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {priceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Rating Filter */}
              {onRatingFilterChange && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={ratingFilter}
                    onChange={(e) =>
                      onRatingFilterChange(e.target.value as RatingFilter)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {ratingOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const currentSort = sortBy;
                      if (currentSort.includes("asc")) {
                        onSortChange(
                          currentSort.replace("asc", "desc") as SortOption
                        );
                      } else if (currentSort.includes("desc")) {
                        onSortChange(
                          currentSort.replace("desc", "asc") as SortOption
                        );
                      }
                    }}
                    className="flex-1 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
                    title="Toggle sort order"
                  >
                    {sortBy.includes("desc") ? (
                      <>
                        <FaSortAmountDown className="text-sm text-gray-600 mr-2" />
                        <span className="text-sm text-gray-700">
                          Descending
                        </span>
                      </>
                    ) : (
                      <>
                        <FaSortAmountUp className="text-sm text-gray-600 mr-2" />
                        <span className="text-sm text-gray-700">Ascending</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary & Clear Filters */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          {courseCount} {courseCount === 1 ? "course" : "courses"} found
        </span>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1"
          >
            <FaTimes className="text-xs" />
            <span>Clear all filters</span>
          </button>
        )}
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
            >
              Search: "{searchTerm}"
              <button
                onClick={() => onSearchChange("")}
                className="ml-2 text-indigo-600 hover:text-indigo-800"
              >
                <FaTimes className="text-xs" />
              </button>
            </motion.span>
          )}

          {statusFilter !== "all" && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
            >
              Status: {statusFilter}
              <button
                onClick={() => onStatusFilterChange("all")}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                <FaTimes className="text-xs" />
              </button>
            </motion.span>
          )}

          {selectedCategory && selectedCategory !== "all" && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
            >
              Category: {selectedCategory}
              <button
                onClick={() => onCategoryChange?.("all")}
                className="ml-2 text-purple-600 hover:text-purple-800"
              >
                <FaTimes className="text-xs" />
              </button>
            </motion.span>
          )}

          {priceFilter && priceFilter !== "all" && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
            >
              Price: {priceOptions.find((p) => p.value === priceFilter)?.label}
              <button
                onClick={() => onPriceFilterChange?.("all")}
                className="ml-2 text-orange-600 hover:text-orange-800"
              >
                <FaTimes className="text-xs" />
              </button>
            </motion.span>
          )}

          {ratingFilter && ratingFilter !== "all" && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
            >
              Rating:{" "}
              {ratingOptions.find((r) => r.value === ratingFilter)?.label}
              <button
                onClick={() => onRatingFilterChange?.("all")}
                className="ml-2 text-yellow-600 hover:text-yellow-800"
              >
                <FaTimes className="text-xs" />
              </button>
            </motion.span>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseFilters;

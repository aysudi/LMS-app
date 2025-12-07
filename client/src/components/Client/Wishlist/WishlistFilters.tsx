import { FaChevronDown, FaFilter, FaList } from "react-icons/fa";
import { FaGrip } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { SortOption } from "../../Instructor/Courses/CourseFilters";

type Props = {
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  filterBy: string;
  setFilterBy: any;
  isSortOpen: boolean;
  setIsSortOpen: (open: boolean) => void;
  sortBy: string;
  setSortBy: any;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
};

type FilterOption =
  | "all"
  | "free"
  | "paid"
  | "beginner"
  | "intermediate"
  | "advanced";

const WishlistFilters = ({
  isFilterOpen,
  setIsFilterOpen,
  filterBy,
  setFilterBy,
  isSortOpen,
  setIsSortOpen,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
}: Props) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center space-x-3">
      {/* Filter Dropdown */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200 cursor-pointer"
        >
          <FaFilter className="text-sm" />
          <span>{t("common.filter")}</span>
          <FaChevronDown
            className={`text-sm transition-transform duration-200 ${
              isFilterOpen ? "rotate-180" : ""
            }`}
          />
        </motion.button>

        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10"
            >
              {[
                { value: "all", label: t("wishlist.allCourses") },
                { value: "free", label: t("wishlist.freeCourses") },
                { value: "paid", label: t("wishlist.paidCourses") },
                {
                  value: "beginner",
                  label: t("wishlist.beginnerLevel"),
                },
                {
                  value: "intermediate",
                  label: t("wishlist.intermediateLevel"),
                },
                {
                  value: "advanced",
                  label: t("wishlist.advancedLevel"),
                },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setFilterBy(option.value as FilterOption);
                    setIsFilterOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors duration-200 ${
                    filterBy === option.value
                      ? "text-purple-600 font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sort Dropdown */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsSortOpen(!isSortOpen)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200 cursor-pointer"
        >
          <span>
            {sortBy === "date" && t("wishlist.newestFirst")}
            {sortBy === "title" && t("wishlist.titleAZ")}
            {sortBy === "price" && t("wishlist.priceLowHigh")}
            {sortBy === "rating" && t("wishlist.highestRated")}
          </span>
          <FaChevronDown
            className={`text-sm transition-transform duration-200 ${
              isSortOpen ? "rotate-180" : ""
            }`}
          />
        </motion.button>

        <AnimatePresence>
          {isSortOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10"
            >
              {[
                { value: "date", label: t("wishlist.newestFirst") },
                { value: "title", label: t("wishlist.titleAZ") },
                { value: "price", label: t("wishlist.priceLowHigh") },
                {
                  value: "rating",
                  label: t("wishlist.highestRated"),
                },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortBy(option.value as SortOption);
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors duration-200 ${
                    sortBy === option.value
                      ? "text-purple-600 font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* View Mode Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setViewMode("grid")}
          className={`p-2 rounded-md transition-all duration-200 ${
            viewMode === "grid"
              ? "bg-white text-purple-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FaGrip />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setViewMode("list")}
          className={`p-2 rounded-md transition-all duration-200 ${
            viewMode === "list"
              ? "bg-white text-purple-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FaList />
        </motion.button>
      </div>
    </div>
  );
};

export default WishlistFilters;

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaRegHeart,
  FaSearch,
  FaExclamationCircle,
  FaCheckCircle,
} from "react-icons/fa";
import { useWishlistHelpers } from "../../hooks/useWishlist";
import { useWishlistToast } from "../../hooks/useWishlistToast";
import CourseCard from "../../components/Client/Wishlist/WishlistCourseCard";
import Loading from "../../components/Common/Loading";
// @ts-ignore
import { useTranslation } from "react-i18next";
import WishlistFilters from "../../components/Client/Wishlist/WishlistFilters";
import BulkActions from "../../components/Client/Wishlist/BulkActions";

type ViewMode = "grid" | "list";
type SortOption = "date" | "title" | "price" | "rating";
type FilterOption =
  | "all"
  | "free"
  | "paid"
  | "beginner"
  | "intermediate"
  | "advanced";

const Wishlist: React.FC = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(
    new Set()
  );
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const navigate = useNavigate();

  const { wishlistItems, wishlistCount, isLoadingWishlist, error } =
    useWishlistHelpers();

  const { removeFromWishlistWithToast } = useWishlistToast({
    onRemoveSuccess: (courseId) => {
      setSelectedCourses((prev) => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    },
  });

  const filteredAndSortedCourses = useMemo(() => {
    let courses = [...wishlistItems];

    if (searchQuery.trim()) {
      courses = courses.filter(
        (course) =>
          course.title?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
          course.description
            ?.toLowerCase()
            ?.includes(searchQuery.toLowerCase()) ||
          course.instructor?.firstName
            ?.toLowerCase()
            ?.includes(searchQuery.toLowerCase()) ||
          course.instructor?.lastName
            ?.toLowerCase()
            ?.includes(searchQuery.toLowerCase()) ||
          course.category?.toLowerCase()?.includes(searchQuery.toLowerCase())
      );
    }

    if (filterBy !== "all") {
      courses = courses.filter((course) => {
        switch (filterBy) {
          case "free":
            return course.isFree || course.currentPrice === 0;
          case "paid":
            return !course.isFree && (course.currentPrice || 0) > 0;
          case "beginner":
          case "intermediate":
          case "advanced":
            return course.level?.toLowerCase() === filterBy;
          default:
            return true;
        }
      });
    }

    courses.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        case "price":
          const priceA = a.currentPrice || a.originalPrice || 0;
          const priceB = b.currentPrice || b.originalPrice || 0;
          return priceA - priceB;
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "date":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    return courses;
  }, [wishlistItems, searchQuery, filterBy, sortBy]);

  const handleRemoveFromWishlist = async (
    courseId: string,
    courseTitle: string
  ) => {
    await removeFromWishlistWithToast(courseId, courseTitle, true);
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  if (isLoadingWishlist) {
    return <Loading variant="page" message={t("wishlist.loadingWishlist")} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FaExclamationCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t("wishlist.failedToLoadWishlist")}
              </h2>
              <p className="text-gray-600 mb-4">
                {t("wishlist.wishlistLoadError")}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                {t("common.tryAgain")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <BulkActions
            setIsSelectionMode={setIsSelectionMode}
            setSelectedCourses={setSelectedCourses}
            selectedCourses={selectedCourses}
            filteredAndSortedCourses={filteredAndSortedCourses}
            wishlistItems={wishlistItems}
            wishlistCount={wishlistCount}
            isSelectionMode={isSelectionMode}
          />

          {/* Controls */}
          {wishlistCount > 0 && (
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 bg-white">
              {/* Search */}
              <div className="relative flex-1 lg:max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("wishlist.searchCourses")}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50/50 backdrop-blur-sm transition-all duration-200"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Filters and View Controls */}
              <WishlistFilters
                setSortBy={setSortBy}
                viewMode={viewMode}
                setViewMode={setViewMode}
                sortBy={sortBy}
                filterBy={filterBy}
                isFilterOpen={isFilterOpen}
                setIsFilterOpen={setIsFilterOpen}
                isSortOpen={isSortOpen}
                setIsSortOpen={setIsSortOpen}
                setFilterBy={setFilterBy}
              />
            </div>
          )}
        </motion.div>

        {/* Course List */}
        <AnimatePresence mode="wait">
          {wishlistCount === 0 ? (
            // Empty State
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="text-center py-20"
            >
              <div className="max-w-md mx-auto">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <FaRegHeart className="text-4xl text-purple-400" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {t("wishlist.wishlistEmpty")}
                </h2>
                <p className="text-gray-600 mb-8">
                  {t("wishlist.wishlistEmptyDescription")}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/courses")}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 cursor-pointer"
                >
                  {t("wishlist.exploreCourses")}
                </motion.button>
              </div>
            </motion.div>
          ) : filteredAndSortedCourses.length === 0 ? (
            // No Results State
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="text-center py-20"
            >
              <FaSearch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {t("wishlist.noCoursesFound")}
              </h2>
              <p className="text-gray-600 mb-6">
                {t("wishlist.adjustFilters")}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchQuery("");
                  setFilterBy("all");
                }}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all duration-200"
              >
                {t("wishlist.clearFilters")}
              </motion.button>
            </motion.div>
          ) : (
            // Courses Grid/List
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              }`}
            >
              {filteredAndSortedCourses.map((course, index) => (
                <div key={course.id} className="relative">
                  {/* Selection Checkbox Overlay */}
                  {isSelectionMode && (
                    <div className="absolute top-2 left-2 z-20">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSelectCourse(course.id);
                        }}
                        className={`w-6 h-6 rounded-md border-2 transition-all duration-200 flex items-center justify-center backdrop-blur-sm ${
                          selectedCourses.has(course.id)
                            ? "bg-purple-600 border-purple-600"
                            : "bg-white/90 border-gray-300 hover:border-purple-400"
                        }`}
                      >
                        {selectedCourses.has(course.id) && (
                          <FaCheckCircle className="text-white text-xs" />
                        )}
                      </motion.button>
                    </div>
                  )}

                  <CourseCard
                    course={course}
                    index={index}
                    showWishlistButton={false}
                    showRemoveButton={!isSelectionMode}
                    onRemoveFromWishlist={handleRemoveFromWishlist}
                  />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Summary */}
        {wishlistCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center text-gray-600"
          >
            {t("wishlist.showingResults", {
              showing: filteredAndSortedCourses.length,
              total: wishlistCount,
            })}
            {searchQuery && (
              <span> {t("wishlist.matching", { query: searchQuery })}</span>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaRegHeart,
  FaFilter,
  FaSearch,
  FaTrash,
  FaList,
  FaChevronDown,
  FaArrowLeft,
  FaExclamationCircle,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import { FaGrip } from "react-icons/fa6";

import {
  useWishlistHelpers,
  useToggleWishlist,
  useRemoveFromWishlist,
} from "../../hooks/useWishlist";

import { useSnackbar } from "notistack";
import CourseCard from "../../components/Client/HomeCourseCard";
import Loading from "../../components/Common/Loading";

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
  const { enqueueSnackbar } = useSnackbar();

  const { wishlistItems, wishlistCount, isLoadingWishlist, error } =
    useWishlistHelpers();
  const { toggleWishlist, isLoading: isToggling } = useToggleWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();

  const filteredAndSortedCourses = useMemo(() => {
    let courses = [...wishlistItems];

    if (searchQuery.trim()) {
      courses = courses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          course.instructor.firstName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          course.instructor.lastName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          course.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
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
            return course.level.toLowerCase() === filterBy;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    courses.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "price":
          const priceA = a.currentPrice || a.originalPrice || 0;
          const priceB = b.currentPrice || b.originalPrice || 0;
          return priceA - priceB;
        case "rating":
          return b.rating - a.rating;
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
    try {
      await toggleWishlist(courseId, true);
      enqueueSnackbar(`"${courseTitle}" removed from wishlist`, {
        variant: "success",
        autoHideDuration: 3000,
      });
      setSelectedCourses((prev) => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    } catch (error) {
      enqueueSnackbar("Failed to remove from wishlist", {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
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

  const handleSelectAll = () => {
    if (selectedCourses.size === filteredAndSortedCourses.length) {
      setSelectedCourses(new Set());
    } else {
      setSelectedCourses(
        new Set(filteredAndSortedCourses.map((course) => course.id))
      );
    }
  };

  const handleRemoveSelected = async () => {
    const coursesToRemove = Array.from(selectedCourses);
    const courseCount = coursesToRemove.length;

    try {
      for (let i = 0; i < coursesToRemove.length; i++) {
        const courseId = coursesToRemove[i];

        try {
          await removeFromWishlistMutation.mutateAsync(courseId);
        } catch (courseError) {
          console.error(`Failed to remove course ${courseId}:`, courseError);
        }

        if (i < coursesToRemove.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      enqueueSnackbar(
        `${courseCount} course${
          courseCount > 1 ? "s" : ""
        } removed from wishlist`,
        {
          variant: "success",
          autoHideDuration: 3000,
        }
      );

      setSelectedCourses(new Set());
      setIsSelectionMode(false);
    } catch (error) {
      enqueueSnackbar("Failed to remove courses", {
        variant: "error",
        autoHideDuration: 3000,
      });
      console.error("Error in bulk removal:", error);
      setSelectedCourses(new Set());
      setIsSelectionMode(false);
    }
  };

  if (isLoadingWishlist) {
    return <Loading variant="page" message="Loading wishlist..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FaExclamationCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Failed to load wishlist
              </h2>
              <p className="text-gray-600 mb-4">
                Something went wrong while loading your wishlist.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
                className="p-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all duration-200"
              >
                <FaArrowLeft className="text-gray-600" />
              </motion.button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                  <span>My Wishlist</span>
                </h1>
                <p className="text-gray-600 mt-1">
                  {wishlistCount} course{wishlistCount !== 1 ? "s" : ""} saved
                  for later
                </p>
              </div>
            </div>

            {/* Bulk Actions */}
            {wishlistCount > 0 && (
              <div className="flex items-center space-x-3">
                {!isSelectionMode ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsSelectionMode(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center space-x-2"
                  >
                    <FaCheckCircle className="text-sm" />
                    <span>Select</span>
                  </motion.button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSelectAll}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all duration-200"
                    >
                      {selectedCourses.size === filteredAndSortedCourses.length
                        ? "Deselect All"
                        : "Select All"}
                    </motion.button>

                    {selectedCourses.size > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRemoveSelected}
                        disabled={isToggling}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium rounded-lg transition-all duration-200 flex items-center space-x-2"
                      >
                        {isToggling ? (
                          <FaSpinner className="text-sm animate-spin" />
                        ) : (
                          <FaTrash className="text-sm" />
                        )}
                        <span>Remove ({selectedCourses.size})</span>
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setIsSelectionMode(false);
                        setSelectedCourses(new Set());
                      }}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-all duration-200"
                    >
                      Cancel
                    </motion.button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          {wishlistCount > 0 && (
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              {/* Search */}
              <div className="relative flex-1 lg:max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Filters and View Controls */}
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
                    <span>Filter</span>
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
                          { value: "all", label: "All Courses" },
                          { value: "free", label: "Free Courses" },
                          { value: "paid", label: "Paid Courses" },
                          { value: "beginner", label: "Beginner Level" },
                          {
                            value: "intermediate",
                            label: "Intermediate Level",
                          },
                          { value: "advanced", label: "Advanced Level" },
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
                      {sortBy === "date" && "Newest First"}
                      {sortBy === "title" && "Title A-Z"}
                      {sortBy === "price" && "Price Low-High"}
                      {sortBy === "rating" && "Highest Rated"}
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
                          { value: "date", label: "Newest First" },
                          { value: "title", label: "Title A-Z" },
                          { value: "price", label: "Price Low-High" },
                          { value: "rating", label: "Highest Rated" },
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
                  Your wishlist is empty
                </h2>
                <p className="text-gray-600 mb-8">
                  Start exploring courses and add your favorites to your
                  wishlist for easy access later.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/courses")}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 cursor-pointer"
                >
                  Explore Courses
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
                No courses found
              </h2>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or filter criteria to find what you're
                looking for.
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
                Clear Filters
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
            Showing {filteredAndSortedCourses.length} of {wishlistCount} course
            {wishlistCount !== 1 ? "s" : ""}
            {searchQuery && <span> matching "{searchQuery}"</span>}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

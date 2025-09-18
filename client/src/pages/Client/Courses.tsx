import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaFilter,
  FaStar,
  FaUsers,
  FaClock,
  FaHeart,
  FaPlay,
  FaChevronDown,
  FaList,
  FaHistory,
  FaBookmark,
  FaGraduationCap,
  FaUser,
  FaTag,
  FaSpinner,
  FaTh,
} from "react-icons/fa";
import { useAuthContext } from "../../context/AuthContext";
import { usePersonalization } from "../../hooks/usePersonalization";
import { useCourses } from "../../hooks/useCourseQueries";
import type { Course, CourseQuery } from "../../services/course.service";
import {
  getSearchSuggestions,
  saveSearchHistory,
  getSearchHistory,
  getLocalSearchHistory,
  saveLocalSearchHistory,
  clearLocalSearchHistory,
} from "../../services/search.service";
import type {
  SearchSuggestion,
  RecentSearch,
} from "../../services/search.service";

// Enhanced CourseCard component
const CourseCard = ({
  course,
  viewMode = "grid",
}: {
  course: Course;
  viewMode?: "grid" | "list";
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const { isInWishlist, addToWishlist, removeFromWishlist, addViewedCourse } =
    usePersonalization();

  const handleCourseClick = () => {
    if (isAuthenticated) {
      addViewedCourse(course._id);
    }
    navigate(`/course/${course._id}`);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }

    if (isInWishlist(course._id)) {
      await removeFromWishlist(course._id);
    } else {
      await addToWishlist(course._id);
    }
  };

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 cursor-pointer group"
        onClick={handleCourseClick}
      >
        <div className="flex">
          <div className="relative w-64 h-40 flex-shrink-0">
            <img
              src={
                course.image ||
                "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop"
              }
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold rounded-full">
                {course.level}
              </span>
            </div>
            <button
              onClick={handleWishlistToggle}
              className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
                isInWishlist(course._id)
                  ? "bg-red-500/90 text-white"
                  : "bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white"
              }`}
            >
              <FaHeart className="text-sm" />
            </button>
          </div>

          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100 mr-3">
                    {course.category}
                  </span>
                  {course.discountPrice &&
                    course.originalPrice > course.discountPrice && (
                      <span className="text-xs text-gray-500 line-through bg-gray-100 px-2 py-1 rounded-full">
                        ${course.originalPrice}
                      </span>
                    )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                  {course.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.shortDescription || course.description}
                </p>
              </div>
              <div className="ml-4 text-right">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {course.isFree || course.originalPrice === 0
                    ? "FREE"
                    : `$${course.discountPrice || course.originalPrice}`}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <FaStar className="text-yellow-400" />
                  <span className="font-semibold text-gray-700">
                    {course.rating || 0}
                  </span>
                  <span className="text-gray-500">
                    ({course.ratingsCount || 0})
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <FaUsers className="text-indigo-500" />
                  <span className="text-gray-600">
                    {Number(course.enrollmentCount || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <FaClock className="text-gray-500" />
                  <span className="text-gray-600">
                    {Math.round(course.totalDuration / 60) || 0}h
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {course.instructor?.firstName?.charAt(0) || "I"}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {course.instructor?.firstName} {course.instructor?.lastName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1 cursor-pointer"
      onClick={handleCourseClick}
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={
            course.image ||
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop"
          }
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold rounded-full shadow-lg">
            {course.level}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <button
            onClick={handleWishlistToggle}
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 transform hover:scale-110 ${
              isInWishlist(course._id)
                ? "bg-red-500/90 text-white shadow-lg"
                : "bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white"
            }`}
          >
            <FaHeart className="text-sm" />
          </button>
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur-lg text-indigo-600 p-3 rounded-full shadow-2xl transform scale-0 group-hover:scale-100 transition-transform duration-300">
            <FaPlay className="text-lg ml-1" />
          </div>
        </div>

        <div className="absolute bottom-3 right-3">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-full shadow-lg">
            <span className="text-sm font-bold">
              {course.isFree || course.originalPrice === 0
                ? "FREE"
                : `$${course.discountPrice || course.originalPrice}`}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100">
            {course.category}
          </span>
          {course.discountPrice &&
            course.originalPrice > course.discountPrice && (
              <span className="text-xs text-gray-500 line-through bg-gray-100 px-2 py-1 rounded-full">
                ${course.originalPrice}
              </span>
            )}
        </div>

        <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300">
          {course.title}
        </h3>

        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {course.instructor?.firstName?.charAt(0) || "I"}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {course.instructor?.firstName} {course.instructor?.lastName}
          </p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <FaStar className="text-yellow-400" />
              <span className="font-semibold text-gray-700">
                {course.rating || 0}
              </span>
              <span className="text-gray-500 text-xs">
                ({course.ratingsCount || 0})
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <FaUsers className="text-indigo-500" />
              <span className="text-gray-600 text-xs">
                {Number(course.enrollmentCount || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Courses = () => {
  const { isAuthenticated } = useAuthContext();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search and filtering state
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // UI state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>(
    searchParams.get("sortBy") || "rating"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as "asc" | "desc") || "desc"
  );

  // Filter state
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    level: searchParams.get("level") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    isFree: searchParams.get("isFree") === "true",
  });

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Build query params for API
  const buildQueryParams = useCallback((): CourseQuery => {
    const params: CourseQuery = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: 12,
      sortBy: sortBy as any,
      sortOrder,
    };

    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (filters.category) params.category = filters.category;
    if (filters.level) params.level = filters.level;
    if (filters.minPrice) params.minPrice = parseFloat(filters.minPrice);
    if (filters.maxPrice) params.maxPrice = parseFloat(filters.maxPrice);
    if (filters.isFree) {
      params.minPrice = 0;
      params.maxPrice = 0;
    }

    return params;
  }, [searchParams, searchQuery, filters, sortBy, sortOrder]);

  // Fetch courses
  const {
    data: coursesData,
    isLoading,
    error,
  } = useCourses(buildQueryParams());
  const courses = coursesData?.data || [];
  const pagination = coursesData?.pagination;

  // Load search suggestions
  const loadSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await getSearchSuggestions(query.trim());
      setSuggestions(response.data);
    } catch (error) {
      console.error("Failed to load suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  // Load recent searches
  const loadRecentSearches = useCallback(async () => {
    try {
      if (isAuthenticated) {
        const response = await getSearchHistory();
        setRecentSearches(response.data);
      } else {
        const localHistory = getLocalSearchHistory();
        setRecentSearches(localHistory);
      }
    } catch (error) {
      console.error("Failed to load search history:", error);
      // Fallback to local storage
      const localHistory = getLocalSearchHistory();
      setRecentSearches(localHistory);
    }
  }, [isAuthenticated]);

  // Save search to history
  const saveSearch = useCallback(
    async (query: string, type: "search" | "suggestion" = "search") => {
      const searchData = {
        query,
        type,
        timestamp: new Date().toISOString(),
      };

      try {
        if (isAuthenticated) {
          await saveSearchHistory(searchData);
        } else {
          saveLocalSearchHistory(searchData);
        }
        await loadRecentSearches();
      } catch (error) {
        console.error("Failed to save search history:", error);
        // Fallback to local storage
        saveLocalSearchHistory(searchData);
        setRecentSearches((prev) =>
          [searchData, ...prev.filter((item) => item.query !== query)].slice(
            0,
            10
          )
        );
      }
    },
    [isAuthenticated, loadRecentSearches]
  );

  // Update URL params
  const updateSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });

      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim()) {
      loadSuggestions(value);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle search submission
  const handleSearchSubmit = async (query: string) => {
    if (query.trim()) {
      setSearchQuery(query.trim());
      updateSearchParams({ search: query.trim(), page: "1" });
      await saveSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = async (suggestion: SearchSuggestion) => {
    await handleSearchSubmit(suggestion.value);
    await saveSearch(suggestion.value, "suggestion");
  };

  // Handle recent search click
  const handleRecentSearchClick = (search: RecentSearch) => {
    handleSearchSubmit(search.query);
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const updates: Record<string, string | null> = { page: "1" };

    if (key === "category") updates.category = (value as string) || null;
    if (key === "level") updates.level = (value as string) || null;
    if (key === "minPrice") updates.minPrice = (value as string) || null;
    if (key === "maxPrice") updates.maxPrice = (value as string) || null;
    if (key === "isFree") updates.isFree = value ? "true" : null;

    updateSearchParams(updates);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    updateSearchParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: "",
      level: "",
      minPrice: "",
      maxPrice: "",
      isFree: false,
    });
    setSearchQuery("");
    setSearchParams({});
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load recent searches on mount
  useEffect(() => {
    loadRecentSearches();
  }, [loadRecentSearches]);

  // Handle search input focus
  const handleSearchFocus = () => {
    if (!searchQuery.trim() && recentSearches.length > 0) {
      setShowSuggestions(true);
    } else if (searchQuery.trim()) {
      loadSuggestions(searchQuery);
      setShowSuggestions(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Hero Search Section */}
      <section className="relative pt-20 pb-12 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
            >
              Discover{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Amazing Courses
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
            >
              Explore thousands of courses from expert instructors. Find the
              perfect learning path for your goals.
            </motion.p>
          </div>

          {/* Enhanced Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-4xl mx-auto relative"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl opacity-20 blur-xl"></div>
              <div className="relative bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                <div className="flex items-center">
                  <FaSearch className="absolute left-6 text-gray-400 text-xl z-10" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search courses, instructors, categories..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={handleSearchFocus}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleSearchSubmit(searchQuery)
                    }
                    className="w-full pl-16 pr-32 py-6 text-lg bg-transparent border-none focus:outline-none focus:ring-0 placeholder-gray-500"
                  />
                  <button
                    onClick={() => handleSearchSubmit(searchQuery)}
                    className="absolute right-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Search Suggestions & Recent Searches */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    ref={suggestionsRef}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-96 overflow-y-auto"
                  >
                    {/* Recent Searches */}
                    {!searchQuery.trim() && recentSearches.length > 0 && (
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                            <FaHistory className="mr-2 text-gray-400" />
                            Recent Searches
                          </h4>
                          <button
                            onClick={() => {
                              if (isAuthenticated) {
                                // Clear server history
                              } else {
                                clearLocalSearchHistory();
                              }
                              setRecentSearches([]);
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="space-y-1">
                          {recentSearches.slice(0, 5).map((search, index) => (
                            <button
                              key={index}
                              onClick={() => handleRecentSearchClick(search)}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center"
                            >
                              <FaHistory className="mr-3 text-gray-400 text-xs" />
                              {search.query}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Search Suggestions */}
                    {searchQuery.trim() && (
                      <div className="p-4">
                        {isLoadingSuggestions ? (
                          <div className="flex items-center justify-center py-4">
                            <FaSpinner className="animate-spin text-gray-400 mr-2" />
                            <span className="text-sm text-gray-500">
                              Loading suggestions...
                            </span>
                          </div>
                        ) : suggestions.length > 0 ? (
                          <div className="space-y-1">
                            {suggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() =>
                                  handleSuggestionClick(suggestion)
                                }
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center"
                              >
                                {suggestion.type === "course" && (
                                  <FaBookmark className="mr-3 text-indigo-500 text-xs" />
                                )}
                                {suggestion.type === "category" && (
                                  <FaTag className="mr-3 text-purple-500 text-xs" />
                                )}
                                {suggestion.type === "instructor" && (
                                  <FaUser className="mr-3 text-green-500 text-xs" />
                                )}
                                <div className="flex-1">
                                  <div className="font-medium">
                                    {suggestion.label}
                                  </div>
                                  {suggestion.count && (
                                    <div className="text-xs text-gray-500">
                                      {suggestion.count}{" "}
                                      {suggestion.type === "instructor"
                                        ? "courses"
                                        : "results"}
                                    </div>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          searchQuery.trim().length >= 2 && (
                            <div className="text-center py-4">
                              <div className="text-sm text-gray-500">
                                No suggestions found
                              </div>
                              <button
                                onClick={() => handleSearchSubmit(searchQuery)}
                                className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
                              >
                                Search for "{searchQuery}"
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters and Controls */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className={`lg:w-80 ${showFilters ? "block" : "hidden lg:block"}`}
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Clear All
                  </button>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    <option value="development">Development</option>
                    <option value="design">Design</option>
                    <option value="business">Business</option>
                    <option value="marketing">Marketing</option>
                    <option value="photography">Photography</option>
                    <option value="music">Music</option>
                  </select>
                </div>

                {/* Level Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Level
                  </label>
                  <select
                    value={filters.level}
                    onChange={(e) =>
                      handleFilterChange("level", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Price Range
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) =>
                        handleFilterChange("minPrice", e.target.value)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        handleFilterChange("maxPrice", e.target.value)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Free Courses Toggle */}
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.isFree}
                      onChange={(e) =>
                        handleFilterChange("isFree", e.target.checked)
                      }
                      className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      Free Courses Only
                    </span>
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Results Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 bg-white rounded-2xl p-6 shadow-lg"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {searchQuery
                      ? `Search Results for "${searchQuery}"`
                      : "All Courses"}
                  </h2>
                  <p className="text-gray-600">
                    {pagination
                      ? `Showing ${pagination.totalCourses} courses`
                      : "Loading..."}
                  </p>
                </div>

                <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <FaFilter />
                    <span>Filters</span>
                  </button>

                  {/* View Mode Toggle */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === "grid"
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-gray-500"
                      }`}
                    >
                      <FaTh />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === "list"
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-gray-500"
                      }`}
                    >
                      <FaList />
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [newSortBy, newSortOrder] =
                          e.target.value.split("-");
                        setSortBy(newSortBy);
                        setSortOrder(newSortOrder as "asc" | "desc");
                        updateSearchParams({
                          sortBy: newSortBy,
                          sortOrder: newSortOrder,
                          page: "1",
                        });
                      }}
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="rating-desc">Highest Rated</option>
                      <option value="rating-asc">Lowest Rated</option>
                      <option value="originalPrice-asc">
                        Price: Low to High
                      </option>
                      <option value="originalPrice-desc">
                        Price: High to Low
                      </option>
                      <option value="createdAt-desc">Newest First</option>
                      <option value="createdAt-asc">Oldest First</option>
                      <option value="studentsCount-desc">Most Popular</option>
                    </select>
                    <FaChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </motion.div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-indigo-600 mb-4 mx-auto" />
                    <p className="text-lg text-gray-600">Loading courses...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-16">
                  <div className="text-red-500 text-lg mb-4">
                    Failed to load courses
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* No Results */}
              {!isLoading && !error && courses.length === 0 && (
                <div className="text-center py-16">
                  <FaGraduationCap className="text-6xl text-gray-300 mb-4 mx-auto" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    No courses found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery
                      ? `We couldn't find any courses matching "${searchQuery}". Try adjusting your search or filters.`
                      : "No courses match your current filters. Try adjusting your criteria."}
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}

              {/* Courses Grid/List */}
              {!isLoading && !error && courses.length > 0 && (
                <>
                  <div
                    className={`${
                      viewMode === "grid"
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        : "space-y-6"
                    }`}
                  >
                    {courses.map((course) => (
                      <CourseCard
                        key={course._id}
                        course={course}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="mt-12 flex justify-center"
                    >
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handlePageChange(pagination.currentPage - 1)
                          }
                          disabled={!pagination.hasPreviousPage}
                          className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                          Previous
                        </button>

                        {Array.from(
                          { length: Math.min(5, pagination.totalPages) },
                          (_, i) => {
                            const page = i + 1;
                            return (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                  page === pagination.currentPage
                                    ? "bg-indigo-600 text-white"
                                    : "bg-white border border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {page}
                              </button>
                            );
                          }
                        )}

                        <button
                          onClick={() =>
                            handlePageChange(pagination.currentPage + 1)
                          }
                          disabled={!pagination.hasNextPage}
                          className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Courses;

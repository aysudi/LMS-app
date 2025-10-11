import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import {
  FaFilter,
  FaChevronDown,
  FaList,
  FaGraduationCap,
  FaTh,
} from "react-icons/fa";
import { useCourses } from "../../hooks/useCourseHooks";
import type { CourseQuery } from "../../types/course.type";
import Loading from "../../components/Common/Loading";
import CourseCard from "../../components/Client/CourseCard";

const Courses: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentQuery, setCurrentQuery] = useState<CourseQuery>({
    page: 1,
    limit: 12,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    level: "",
    minPrice: "",
    maxPrice: "",
    isFree: false,
  });

  const { data: coursesData, isLoading, error } = useCourses(currentQuery);
  const courses = coursesData?.data || [];
  const pagination = coursesData?.pagination;

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

  const handlePageChange = (page: number) => {
    updateSearchParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  useEffect(() => {
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const level = searchParams.get("level") || "";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const isFree = searchParams.get("isFree") === "true";

    setSearchQuery(search);
    setFilters({
      category,
      level,
      minPrice,
      maxPrice,
      isFree,
    });
  }, [searchParams]);

  useEffect(() => {
    const query: CourseQuery = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: 12,
      search: searchQuery || undefined,
      category: filters.category || undefined,
      level: filters.level || undefined,
      minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
      sortBy: (searchParams.get("sortBy") as any) || "rating",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    };

    setCurrentQuery(query);
  }, [searchParams, searchQuery, filters]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Title & Stats */}
              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                  {searchQuery
                    ? `Search Results for "${searchQuery}"`
                    : "Discover Courses"}
                </h1>

                {/* Active Filters Display */}
                {(searchQuery ||
                  filters.category ||
                  filters.level ||
                  filters.isFree) && (
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {searchQuery && (
                      <span className="inline-flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
                        🔍 Search: "{searchQuery}"
                      </span>
                    )}
                    {filters.category && (
                      <span className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                        📂 Category: {filters.category}
                      </span>
                    )}
                    {filters.level && (
                      <span className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        📊 Level: {filters.level}
                      </span>
                    )}
                    {filters.isFree && (
                      <span className="inline-flex items-center px-3 py-1.5 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                        💰 Free Only
                      </span>
                    )}
                  </div>
                )}

                <p className="text-gray-600 text-lg">
                  {!isLoading && pagination && pagination.totalCourses > 0 && (
                    <span>
                      Showing {(pagination.currentPage - 1) * 12 + 1} -{" "}
                      {Math.min(
                        pagination.currentPage * 12,
                        pagination.totalCourses
                      )}{" "}
                      of {pagination.totalCourses} courses
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

      {/* Filters Bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-wrap items-center gap-6">
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-3 px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium"
              >
                <FaFilter className="w-4 h-4" />
                <span>Filters</span>
                <FaChevronDown
                  className={`w-3 h-3 transform transition-transform duration-200 ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Quick Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Category Filter */}
                <select
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">All Categories</option>
                  <option value="development">Development</option>
                  <option value="design">Design</option>
                  <option value="business">Business</option>
                  <option value="marketing">Marketing</option>
                  <option value="photography">Photography</option>
                  <option value="music">Music</option>
                </select>

                {/* Level Filter */}
                <select
                  value={filters.level}
                  onChange={(e) => handleFilterChange("level", e.target.value)}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>

                {/* Free Toggle */}
                <label className="flex items-center space-x-3 cursor-pointer bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all duration-200">
                  <input
                    type="checkbox"
                    checked={filters.isFree}
                    onChange={(e) =>
                      handleFilterChange("isFree", e.target.checked)
                    }
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Free Only
                  </span>
                </label>
              </div>

              {/* Sort */}
              <div className="ml-auto flex items-center space-x-3">
                <span className="text-sm text-gray-600 font-medium">
                  Sort by:
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
                  <option value="rating-desc">Highest Rated</option>
                  <option value="originalPrice-asc">Price: Low to High</option>
                  <option value="originalPrice-desc">Price: High to Low</option>
                  <option value="createdAt-desc">Newest First</option>
                  <option value="studentsCount-desc">Most Popular</option>
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
                  Clear All
                </button>
              )}
            </div>

            {/* Expanded Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t border-gray-100 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Price Range */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price Range
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            placeholder="Min"
                            value={filters.minPrice}
                            onChange={(e) =>
                              handleFilterChange("minPrice", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            value={filters.maxPrice}
                            onChange={(e) =>
                              handleFilterChange("maxPrice", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Duration Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                          <option value="">Any Duration</option>
                          <option value="0-2">0-2 hours</option>
                          <option value="2-6">2-6 hours</option>
                          <option value="6-12">6-12 hours</option>
                          <option value="12+">12+ hours</option>
                        </select>
                      </div>

                      {/* Rating Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Rating
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                          <option value="">Any Rating</option>
                          <option value="4.5">4.5+ Stars</option>
                          <option value="4.0">4.0+ Stars</option>
                          <option value="3.5">3.5+ Stars</option>
                          <option value="3.0">3.0+ Stars</option>
                        </select>
                      </div>

                      {/* Language Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                          <option value="">Any Language</option>
                          <option value="english">English</option>
                          <option value="spanish">Spanish</option>
                          <option value="french">French</option>
                          <option value="german">German</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Loading State */}
        {isLoading && <Loading variant="page" message="Loading courses..." />}

        {/* Error State */}
        {error && (
          <div className="text-center py-24">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-10 max-w-md mx-auto">
              <div className="text-red-500 text-xl mb-6 font-semibold">
                Failed to load courses
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium"
              >
                Try Again
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
                No courses found
              </h3>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                {searchQuery
                  ? `We couldn't find any courses matching "${searchQuery}". Try adjusting your search or filters.`
                  : "No courses match your current filters. Try adjusting your criteria."}
              </p>
              <button
                onClick={clearFilters}
                className="px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 font-medium"
              >
                Clear Filters
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
                    Previous
                  </button>

                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      const pageNum =
                        Math.max(1, pagination.currentPage - 2) + i;
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
                    Next
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Courses;

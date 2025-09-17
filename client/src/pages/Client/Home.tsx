import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaStar,
  FaUsers,
  FaPlay,
  FaHeart,
  FaArrowRight,
  FaGraduationCap,
  FaCode,
  FaPalette,
  FaChartLine,
  FaCamera,
  FaRocket,
  FaFire,
  FaTrophy,
  FaLightbulb,
} from "react-icons/fa";
import { useAuthContext } from "../../context/AuthContext";
import { usePersonalization } from "../../hooks/usePersonalization";
import {
  useCourses,
  useFeaturedCourses,
  useFreeCourses,
  useTrendingCourses,
} from "../../hooks/useCourseQueries";

const CourseCard = ({ course, index }: { course: any; index: number }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const { isInWishlist, addToWishlist, removeFromWishlist, addViewedCourse } =
    usePersonalization();

  const handleCourseClick = (courseId: string | number) => {
    if (isAuthenticated) {
      addViewedCourse(courseId.toString());
    }
    navigate(`/course/${courseId}`);
  };

  const handleWishlistToggle = async (courseId: string | number) => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }

    const courseIdStr = courseId.toString();
    if (isInWishlist(courseIdStr)) {
      await removeFromWishlist(courseIdStr);
    } else {
      await addToWishlist(courseIdStr);
    }
  };

  const handleEnroll = (courseId: string | number) => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }
    // Handle enrollment logic
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
      onClick={() => handleCourseClick(course._id || course.id)}
    >
      <div className="relative">
        <img
          src={
            course.image ||
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop"
          }
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Wishlist Button */}
        <div className="absolute top-3 right-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleWishlistToggle(course._id);
            }}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors duration-200 ${
              isInWishlist(course._id)
                ? "bg-red-500 text-white"
                : "bg-white/80 text-gray-700 hover:bg-red-500 hover:text-white"
            }`}
          >
            <FaHeart className="text-sm" />
          </button>
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/90 backdrop-blur-sm text-indigo-500 p-3 rounded-full shadow-xl">
            <FaPlay className="text-lg ml-1" />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-3">
          <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
            {course.category}
          </span>
        </div>

        <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {course.title}
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          by{" "}
          <span className="font-medium">
            {course.instructor?.firstName
              ? `${course.instructor.firstName} ${course.instructor.lastName}`
              : "Instructor"}
          </span>
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <FaStar className="text-yellow-400" />
            <span className="font-medium">{course.rating || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaUsers className="text-indigo-500" />
            <span>{Number(course.enrollmentCount || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">
              {course.isFree || course.originalPrice === 0
                ? "Free"
                : `$${course.discountPrice || course.originalPrice}`}
            </span>
            {course.discountPrice &&
              course.originalPrice > course.discountPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${course.originalPrice}
                </span>
              )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEnroll(course._id);
            }}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Enroll
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const {
    recommendations,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    addToSearchHistory,
    addViewedCourse,
  } = usePersonalization();

  // Fetch real course data
  const { data: allCoursesData, isLoading: allCoursesLoading } = useCourses({
    limit: 12,
    sortBy: "rating",
    sortOrder: "desc",
  });

  const { data: featuredCoursesData, isLoading: featuredLoading } =
    useFeaturedCourses(8);
  const { data: freeCoursesData, isLoading: freeLoading } = useFreeCourses(6);
  const { data: trendingCoursesData, isLoading: trendingLoading } =
    useTrendingCourses(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Use real course data or fallback to empty array
  const allCourses = allCoursesData?.data || [];
  const featuredCourses = featuredCoursesData?.data || [];
  const freeCourses = freeCoursesData?.data || [];
  const trendingCourse = trendingCoursesData?.data?.[0];

  // Calculate category counts from real data
  const categories = [
    {
      id: "all",
      name: "All Courses",
      icon: FaGraduationCap,
      count: allCourses.length,
    },
    {
      id: "development",
      name: "Development",
      icon: FaCode,
      count: allCourses.filter(
        (c) => c.category.toLowerCase() === "development"
      ).length,
    },
    {
      id: "design",
      name: "Design",
      icon: FaPalette,
      count: allCourses.filter((c) => c.category.toLowerCase() === "design")
        .length,
    },
    {
      id: "data-science",
      name: "Data Science",
      icon: FaChartLine,
      count: allCourses.filter((c) => c.category.toLowerCase().includes("data"))
        .length,
    },
    {
      id: "marketing",
      name: "Marketing",
      icon: FaRocket,
      count: allCourses.filter((c) => c.category.toLowerCase() === "marketing")
        .length,
    },
    {
      id: "photography",
      name: "Photography",
      icon: FaCamera,
      count: allCourses.filter(
        (c) => c.category.toLowerCase() === "photography"
      ).length,
    },
  ];

  const handleEnroll = (courseId: string | number) => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }
    // Handle enrollment logic
    console.log("Enrolling in course:", courseId);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && isAuthenticated) {
      addToSearchHistory(
        searchQuery.trim(),
        selectedCategory !== "all" ? selectedCategory : undefined
      );
    }
  };

  // Show loading state while fetching initial data
  if (allCoursesLoading && featuredLoading && freeLoading && trendingLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  const handleCourseClick = (courseId: number | string) => {
    if (isAuthenticated) {
      addViewedCourse(courseId.toString());
    }
    navigate(`/course/${courseId}`);
  };

  const handleWishlistToggle = async (courseId: number | string) => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }

    const courseIdStr = courseId.toString();
    if (isInWishlist(courseIdStr)) {
      await removeFromWishlist(courseIdStr);
    } else {
      await addToWishlist(courseIdStr);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
                Learn Without{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Limits
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Discover thousands of courses from expert instructors. Build
                skills that matter for your career and personal growth.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto mb-12"
            >
              {[
                { icon: FaUsers, value: "50K+", label: "Students" },
                { icon: FaGraduationCap, value: "1K+", label: "Courses" },
                { icon: FaTrophy, value: "100+", label: "Experts" },
                { icon: FaLightbulb, value: "24/7", label: "Support" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl mb-3">
                    <stat.icon className="text-white text-xl" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-2xl mx-auto"
            >
              <form onSubmit={handleSearchSubmit} className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="What do you want to learn today?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-lg"
                />
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Explore by Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-4 rounded-xl text-center transition-all duration-200 ${
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                      : "bg-white hover:bg-gray-50 text-gray-700 shadow-md border border-gray-200"
                  }`}
                >
                  <category.icon
                    className={`text-2xl mx-auto mb-2 ${
                      selectedCategory === category.id
                        ? "text-white"
                        : "text-indigo-600"
                    }`}
                  />
                  <div className="text-sm font-medium">{category.name}</div>
                  <div
                    className={`text-xs mt-1 ${
                      selectedCategory === category.id
                        ? "text-indigo-100"
                        : "text-gray-500"
                    }`}
                  >
                    {category.count} courses
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Personalized Sections for Authenticated Users */}
          {isAuthenticated && (
            <>
              {/* Recommended for You */}
              {(recommendations.recommended.length > 0 ||
                featuredCourses.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="mb-12"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <FaLightbulb className="text-indigo-600" />
                      Recommended for You
                    </h2>
                    <button className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                      View All <FaArrowRight className="text-sm" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {(recommendations.recommended.length > 0
                      ? recommendations.recommended
                      : featuredCourses
                    )
                      .slice(0, 4)
                      .map((course, index) => (
                        <CourseCard key={index} course={course} index={index} />
                      ))}
                  </div>
                </motion.div>
              )}

              {/* Free Courses */}
              {(recommendations.free.length > 0 || freeCourses.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="mb-12"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <FaRocket className="text-green-600" />
                      Free Courses to Get Started
                    </h2>
                    <button className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                      View All <FaArrowRight className="text-sm" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(recommendations.free.length > 0
                      ? recommendations.free
                      : freeCourses
                    )
                      .slice(0, 3)
                      .map((course, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md border border-green-200 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
                          onClick={() => handleCourseClick(course._id)}
                        >
                          <div className="relative">
                            <img
                              src={
                                course.image ||
                                "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop"
                              }
                              alt={course.title}
                              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 left-2">
                              <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                                FREE
                              </span>
                            </div>
                            <div className="absolute top-2 right-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleWishlistToggle(course._id);
                                }}
                                className={`p-2 rounded-full backdrop-blur-sm transition-colors duration-200 ${
                                  isInWishlist(course._id)
                                    ? "bg-red-500 text-white"
                                    : "bg-white/80 text-gray-700 hover:bg-red-500 hover:text-white"
                                }`}
                              >
                                <FaHeart className="text-sm" />
                              </button>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                              {course.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              by {course.instructor?.firstName}{" "}
                              {course.instructor?.lastName}
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-1">
                                <FaStar className="text-yellow-400 text-sm" />
                                <span className="text-sm font-medium">
                                  {course.rating}
                                </span>
                              </div>
                              <span className="text-gray-300">•</span>
                              <span className="text-sm text-gray-600">
                                {course.enrollmentCount} students
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </motion.div>
              )}

              {/* Trending Now - Single Featured Course */}
              {(trendingCourse || featuredCourses.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="mb-16"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3 mb-2">
                      <FaFire className="text-orange-500 text-4xl" />
                      Trending Now
                    </h2>
                    <p className="text-gray-600 text-lg">
                      The most popular course this week
                    </p>
                  </div>

                  {(() => {
                    const displayCourse = trendingCourse || featuredCourses[0];
                    if (!displayCourse) return null;
                    return (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="relative max-w-5xl mx-auto"
                      >
                        <div
                          className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 rounded-3xl shadow-2xl border border-orange-200 overflow-hidden group cursor-pointer"
                          onClick={() => handleCourseClick(displayCourse._id)}
                        >
                          {/* Trending Badge */}
                          <div className="absolute top-6 left-6 z-10">
                            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-lg">
                              <FaFire className="animate-pulse" />
                              <span className="font-bold text-sm">
                                🔥 TRENDING #1
                              </span>
                            </div>
                          </div>

                          {/* Wishlist Button */}
                          <div className="absolute top-6 right-6 z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleWishlistToggle(displayCourse._id);
                              }}
                              className={`p-3 rounded-full backdrop-blur-sm transition-all duration-200 shadow-lg ${
                                isInWishlist(displayCourse._id)
                                  ? "bg-red-500 text-white"
                                  : "bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white"
                              }`}
                            >
                              <FaHeart className="text-lg" />
                            </button>
                          </div>

                          <div className="grid md:grid-cols-2 gap-0">
                            {/* Course Image */}
                            <div className="relative overflow-hidden md:order-2">
                              <img
                                src={
                                  displayCourse.image ||
                                  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop"
                                }
                                alt={displayCourse.title}
                                className="w-full h-64 md:h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />

                              {/* Play Button Overlay */}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="bg-white/90 backdrop-blur-sm text-orange-500 p-4 rounded-full shadow-xl hover:bg-white transition-colors duration-200">
                                  <FaPlay className="text-2xl ml-1" />
                                </div>
                              </div>
                            </div>

                            {/* Course Content */}
                            <div className="p-8 md:p-12 flex flex-col justify-center md:order-1">
                              <div className="mb-4">
                                <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full">
                                  {displayCourse.category}
                                </span>
                              </div>

                              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors">
                                {displayCourse.title}
                              </h3>

                              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                                {displayCourse.description}
                              </p>

                              <div className="text-lg text-gray-700 mb-6">
                                by{" "}
                                <span className="font-semibold text-gray-900">
                                  {displayCourse.instructor?.firstName}{" "}
                                  {displayCourse.instructor?.lastName}
                                </span>
                              </div>

                              {/* Stats */}
                              <div className="flex items-center gap-6 mb-8">
                                <div className="flex items-center gap-2">
                                  <FaStar className="text-yellow-400 text-lg" />
                                  <span className="font-bold text-lg">
                                    {displayCourse.rating || 0}
                                  </span>
                                  <span className="text-gray-500">
                                    ({displayCourse.ratingsCount || 0} reviews)
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FaUsers className="text-indigo-500" />
                                  <span className="font-semibold">
                                    {Number(
                                      displayCourse.enrollmentCount || 0
                                    ).toLocaleString()}
                                  </span>
                                  <span className="text-gray-500">
                                    students
                                  </span>
                                </div>
                              </div>

                              {/* Price and CTA */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-3xl font-bold text-gray-900">
                                    {displayCourse.originalPrice === 0
                                      ? "Free"
                                      : `$${
                                          displayCourse.discountPrice ||
                                          displayCourse.originalPrice
                                        }`}
                                  </span>
                                  {displayCourse.discountPrice &&
                                    displayCourse.originalPrice >
                                      displayCourse.discountPrice && (
                                      <span className="text-lg text-gray-500 line-through">
                                        ${displayCourse.originalPrice}
                                      </span>
                                    )}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEnroll(displayCourse._id);
                                  }}
                                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                  Enroll Now
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })()}
                </motion.div>
              )}
            </>
          )}

          {/* Category Sections */}
          <div className="space-y-16">
            {(() => {
              // Helper function to get courses for a category
              const getCoursesForCategory = (category: string) => {
                const coursesToFilter =
                  recommendations.recommended.length > 0
                    ? recommendations.recommended
                    : allCourses;

                return coursesToFilter
                  .filter(
                    (course: any) =>
                      course.category.toLowerCase() === category.toLowerCase()
                  )
                  .slice(0, 3);
              };

              const categories = [
                {
                  id: "Development",
                  name: "Development",
                  description: "Master programming and software development",
                  icon: FaCode,
                  bgColor: "bg-blue-100",
                  iconColor: "text-blue-600",
                  buttonColor: "text-blue-600 hover:text-blue-700",
                  hoverBg: "hover:bg-blue-50",
                },
                {
                  id: "Design",
                  name: "Design",
                  description: "Create beautiful and functional designs",
                  icon: FaPalette,
                  bgColor: "bg-purple-100",
                  iconColor: "text-purple-600",
                  buttonColor: "text-purple-600 hover:text-purple-700",
                  hoverBg: "hover:bg-purple-50",
                },
                {
                  id: "Data Science",
                  name: "Data Science",
                  description: "Analyze data and build intelligent systems",
                  icon: FaChartLine,
                  bgColor: "bg-green-100",
                  iconColor: "text-green-600",
                  buttonColor: "text-green-600 hover:text-green-700",
                  hoverBg: "hover:bg-green-50",
                },
                {
                  id: "Marketing",
                  name: "Marketing",
                  description: "Grow your business and reach more customers",
                  icon: FaRocket,
                  bgColor: "bg-orange-100",
                  iconColor: "text-orange-600",
                  buttonColor: "text-orange-600 hover:text-orange-700",
                  hoverBg: "hover:bg-orange-50",
                },
                {
                  id: "Photography",
                  name: "Photography",
                  description:
                    "Capture moments and tell stories through images",
                  icon: FaCamera,
                  bgColor: "bg-pink-100",
                  iconColor: "text-pink-600",
                  buttonColor: "text-pink-600 hover:text-pink-700",
                  hoverBg: "hover:bg-pink-50",
                },
              ];

              return categories
                .map((category, categoryIndex) => {
                  const courses = getCoursesForCategory(category.id);

                  // Only render the category if it has courses
                  if (courses.length === 0) return null;

                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.6,
                        delay: 1.0 + categoryIndex * 0.1,
                      }}
                      className="mb-16"
                    >
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 ${category.bgColor} rounded-xl`}>
                            <category.icon
                              className={`${category.iconColor} text-2xl`}
                            />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                              {category.name}
                            </h2>
                            <p className="text-gray-600">
                              {category.description}
                            </p>
                          </div>
                        </div>
                        <button
                          className={`${category.buttonColor} font-medium flex items-center gap-2 px-4 py-2 rounded-lg ${category.hoverBg} transition-colors`}
                        >
                          View All <FaArrowRight className="text-sm" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course, index) => (
                          <CourseCard
                            key={`${category.id.toLowerCase()}-${
                              course._id || course.id
                            }`}
                            course={course}
                            index={index}
                          />
                        ))}
                      </div>
                    </motion.div>
                  );
                })
                .filter(Boolean); // Remove null values
            })()}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

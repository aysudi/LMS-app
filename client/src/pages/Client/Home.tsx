import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaFilter,
  FaStar,
  FaUsers,
  FaClock,
  FaPlay,
  FaHeart,
  FaBookmark,
  FaArrowRight,
  FaGraduationCap,
  FaCode,
  FaPalette,
  FaChartLine,
  FaCamera,
  FaRocket,
  FaSort,
  FaChevronDown,
  FaFire,
  FaTrophy,
  FaLightbulb,
} from "react-icons/fa";
import { useAuthContext } from "../../context/AuthContext";
import { usePersonalization } from "../../hooks/usePersonalization";

// Mock course data - replace with actual API data later
const mockCourses = [
  {
    id: 1,
    title: "Complete Web Development Bootcamp",
    instructor: "Sarah Johnson",
    category: "Development",
    price: 89.99,
    originalPrice: 199.99,
    rating: 4.8,
    students: 12543,
    duration: "42 hours",
    level: "Beginner",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop",
    description:
      "Learn HTML, CSS, JavaScript, React, Node.js and build real projects",
    tags: ["HTML", "CSS", "JavaScript", "React"],
    isNew: true,
    isBestseller: true,
  },
  {
    id: 2,
    title: "UI/UX Design Masterclass",
    instructor: "Alex Chen",
    category: "Design",
    price: 79.99,
    originalPrice: 149.99,
    rating: 4.9,
    students: 8967,
    duration: "28 hours",
    level: "Intermediate",
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop",
    description:
      "Master the fundamentals of user experience and interface design",
    tags: ["Figma", "Adobe XD", "Prototyping", "Design Systems"],
    isNew: false,
    isBestseller: true,
  },
  {
    id: 3,
    title: "Data Science with Python",
    instructor: "Dr. Maria Rodriguez",
    category: "Data Science",
    price: 94.99,
    originalPrice: 179.99,
    rating: 4.7,
    students: 15234,
    duration: "56 hours",
    level: "Advanced",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
    description: "Complete Python data science course with machine learning",
    tags: ["Python", "Pandas", "NumPy", "Machine Learning"],
    isNew: true,
    isBestseller: false,
  },
  {
    id: 4,
    title: "Digital Marketing Strategy",
    instructor: "James Wilson",
    category: "Marketing",
    price: 69.99,
    originalPrice: 129.99,
    rating: 4.6,
    students: 9876,
    duration: "32 hours",
    level: "Beginner",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
    description: "Build comprehensive digital marketing campaigns that convert",
    tags: ["SEO", "Social Media", "Analytics", "Content Marketing"],
    isNew: false,
    isBestseller: true,
  },
  {
    id: 5,
    title: "Mobile App Development with React Native",
    instructor: "Emily Davis",
    category: "Development",
    price: 99.99,
    originalPrice: 199.99,
    rating: 4.8,
    students: 7543,
    duration: "48 hours",
    level: "Intermediate",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop",
    description: "Build iOS and Android apps with React Native and Expo",
    tags: ["React Native", "JavaScript", "Mobile", "iOS", "Android"],
    isNew: true,
    isBestseller: false,
  },
  {
    id: 6,
    title: "Photography Fundamentals",
    instructor: "Michael Brown",
    category: "Photography",
    price: 59.99,
    originalPrice: 119.99,
    rating: 4.7,
    students: 6234,
    duration: "24 hours",
    level: "Beginner",
    image:
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=250&fit=crop",
    description: "Master photography basics and advanced techniques",
    tags: ["DSLR", "Composition", "Lighting", "Editing"],
    isNew: false,
    isBestseller: false,
  },
];

const categories = [
  {
    id: "all",
    name: "All Courses",
    icon: FaGraduationCap,
    count: mockCourses.length,
  },
  {
    id: "development",
    name: "Development",
    icon: FaCode,
    count: mockCourses.filter((c) => c.category === "Development").length,
  },
  {
    id: "design",
    name: "Design",
    icon: FaPalette,
    count: mockCourses.filter((c) => c.category === "Design").length,
  },
  {
    id: "data-science",
    name: "Data Science",
    icon: FaChartLine,
    count: mockCourses.filter((c) => c.category === "Data Science").length,
  },
  {
    id: "marketing",
    name: "Marketing",
    icon: FaRocket,
    count: mockCourses.filter((c) => c.category === "Marketing").length,
  },
  {
    id: "photography",
    name: "Photography",
    icon: FaCamera,
    count: mockCourses.filter((c) => c.category === "Photography").length,
  },
];

const sortOptions = [
  { value: "popular", label: "Most Popular", icon: FaFire },
  { value: "rating", label: "Highest Rated", icon: FaStar },
  { value: "newest", label: "Newest", icon: FaRocket },
  { value: "price-low", label: "Price: Low to High", icon: FaSort },
  { value: "price-high", label: "Price: High to Low", icon: FaSort },
];

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const {
    wishlist,
    recommendations,
    loading: personalizationLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    addToSearchHistory,
    addViewedCourse,
  } = usePersonalization();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);
  const [filteredCourses, setFilteredCourses] = useState(mockCourses);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  // Filter and sort courses
  useEffect(() => {
    let filtered = mockCourses;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (course) =>
          course.category.toLowerCase().replace(" ", "-") === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          course.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Sort courses
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "newest":
          return a.isNew ? -1 : 1;
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "popular":
        default:
          return b.students - a.students;
      }
    });

    setFilteredCourses(filtered);
  }, [searchQuery, selectedCategory, sortBy]);

  const toggleFavorite = (courseId: number) => {
    setFavorites((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const toggleBookmark = (courseId: number) => {
    setBookmarks((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleEnroll = (courseId: number) => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }
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

  const handleCourseClick = (courseId: number) => {
    if (isAuthenticated) {
      addViewedCourse(courseId.toString());
    }
    navigate(`/course/${courseId}`);
  };

  const handleWishlistToggle = async (courseId: number) => {
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
              {recommendations.recommended.length > 0 && (
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
                    {recommendations.recommended
                      .slice(0, 4)
                      .map((course, index) => (
                        <motion.div
                          key={course._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
                          onClick={() => handleCourseClick(course._id)}
                        >
                          <div className="relative">
                            <img
                              src={
                                course.thumbnail ||
                                "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop"
                              }
                              alt={course.title}
                              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
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
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-lg text-gray-900">
                                {course.isFree ? "Free" : `$${course.price}`}
                              </span>
                              {course.originalPrice &&
                                course.originalPrice > course.price && (
                                  <span className="text-sm text-gray-500 line-through">
                                    ${course.originalPrice}
                                  </span>
                                )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </motion.div>
              )}

              {/* Free Courses */}
              {recommendations.free.length > 0 && (
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
                    {recommendations.free.slice(0, 3).map((course, index) => (
                      <motion.div
                        key={course._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md border border-green-200 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
                        onClick={() => handleCourseClick(course._id)}
                      >
                        <div className="relative">
                          <img
                            src={
                              course.thumbnail ||
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

              {/* Most Popular Courses */}
              {recommendations.popular.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="mb-12"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <FaFire className="text-orange-600" />
                      Trending Now
                    </h2>
                    <button className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                      View All <FaArrowRight className="text-sm" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recommendations.popular
                      .slice(0, 4)
                      .map((course, index) => (
                        <motion.div
                          key={course._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
                          onClick={() => handleCourseClick(course._id)}
                        >
                          <div className="relative">
                            <img
                              src={
                                course.thumbnail ||
                                "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop"
                              }
                              alt={course.title}
                              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 left-2">
                              <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                                TRENDING
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
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-lg text-gray-900">
                                {course.isFree ? "Free" : `$${course.price}`}
                              </span>
                              {course.originalPrice &&
                                course.originalPrice > course.price && (
                                  <span className="text-sm text-gray-500 line-through">
                                    ${course.originalPrice}
                                  </span>
                                )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </motion.div>
              )}
            </>
          )}

          {/* Featured Section */}
          {selectedCategory === "all" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mb-12"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-3xl font-bold mb-4">
                      🔥 Featured Course of the Week
                    </h2>
                    <p className="text-indigo-100 mb-6">
                      Join thousands of students in our most popular web
                      development course. Learn from industry experts and build
                      real-world projects.
                    </p>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center gap-1">
                        <FaStar className="text-yellow-400" />
                        <span className="font-medium">4.8</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaUsers />
                        <span>12,543 students</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaClock />
                        <span>42 hours</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEnroll(1)}
                      className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-200"
                    >
                      Enroll Now - $89.99
                    </button>
                  </div>
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop"
                      alt="Featured Course"
                      className="rounded-xl shadow-xl"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button className="bg-white/20 backdrop-blur-sm text-white p-4 rounded-full hover:bg-white/30 transition-colors duration-200">
                        <FaPlay className="text-2xl" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Filters and Sort */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <h3 className="text-xl font-semibold text-gray-900">
                {filteredCourses.length} courses found
              </h3>

              {/* Mobile Filter Button */}
              <div className="sm:hidden w-full">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <FaFilter className="text-sm" />
                  <span>Filters & Sort</span>
                  <FaChevronDown
                    className={`text-xs transition-transform duration-200 ${
                      showFilters ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Desktop Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <FaFilter className="text-sm" />
                <span>Filters</span>
              </button>
            </div>

            {/* Desktop Sort Dropdown */}
            <div className="hidden sm:block relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
            </div>
          </motion.div>

          {/* Mobile Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="sm:hidden mb-8 bg-white rounded-xl shadow-lg border border-gray-200 p-4"
              >
                <h4 className="font-semibold text-gray-900 mb-4">Sort By</h4>
                <div className="grid grid-cols-1 gap-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowFilters(false);
                      }}
                      className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors duration-200 ${
                        sortBy === option.value
                          ? "bg-indigo-100 text-indigo-700"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <option.icon className="text-sm" />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Course Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  {/* Course Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {course.isNew && (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                          New
                        </span>
                      )}
                      {course.isBestseller && (
                        <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                          Bestseller
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => toggleFavorite(course.id)}
                        className={`p-2 rounded-full backdrop-blur-sm transition-colors duration-200 ${
                          favorites.includes(course.id)
                            ? "bg-red-500 text-white"
                            : "bg-white/80 text-gray-700 hover:bg-red-500 hover:text-white"
                        }`}
                      >
                        <FaHeart className="text-sm" />
                      </button>
                      <button
                        onClick={() => toggleBookmark(course.id)}
                        className={`p-2 rounded-full backdrop-blur-sm transition-colors duration-200 ${
                          bookmarks.includes(course.id)
                            ? "bg-indigo-500 text-white"
                            : "bg-white/80 text-gray-700 hover:bg-indigo-500 hover:text-white"
                        }`}
                      >
                        <FaBookmark className="text-sm" />
                      </button>
                    </div>

                    {/* Preview Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="bg-white/90 backdrop-blur-sm text-indigo-600 p-3 rounded-full shadow-lg hover:bg-white transition-colors duration-200">
                        <FaPlay className="text-lg" />
                      </button>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    {/* Course Info */}
                    <div className="flex items-start justify-between mb-3">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                        {course.category}
                      </span>
                      <span className="text-sm font-medium text-gray-500">
                        {course.level}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
                      {course.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="text-sm text-gray-500 mb-4">
                      by{" "}
                      <span className="font-medium text-gray-700">
                        {course.instructor}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {course.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {course.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{course.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Course Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <FaStar className="text-yellow-400" />
                        <span className="font-medium">{course.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaUsers />
                        <span>{course.students.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaClock />
                        <span>{course.duration}</span>
                      </div>
                    </div>

                    {/* Price and Action */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          ${course.price}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          ${course.originalPrice}
                        </span>
                      </div>
                      <button
                        onClick={() => handleEnroll(course.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <span>Enroll</span>
                        <FaArrowRight className="text-sm" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Load More Button */}
          {filteredCourses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="text-center mt-12"
            >
              <button className="px-8 py-3 bg-white border-2 border-indigo-600 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-200 shadow-md hover:shadow-lg">
                Load More Courses
              </button>
            </motion.div>
          )}

          {/* No Results */}
          {filteredCourses.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <div className="text-6xl text-gray-300 mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                No courses found
              </h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search criteria or browse different
                categories
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
              >
                View All Courses
              </button>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;

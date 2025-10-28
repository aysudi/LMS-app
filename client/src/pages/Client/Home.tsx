import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HTMLRenderer } from "../../utils/htmlRenderer";
import {
  FaStar,
  FaUsers,
  FaArrowRight,
  FaGraduationCap,
  FaRocket,
  FaFire,
  FaTrophy,
  FaLightbulb,
  FaHeart,
  FaShoppingCart,
} from "react-icons/fa";
import { useAuthContext } from "../../context/AuthContext";
import { usePersonalization } from "../../hooks/usePersonalization";
import { useToggleWishlist, useWishlistHelpers } from "../../hooks/useWishlist";
import {
  useCourses,
  useFeaturedCourses,
  useFreeCourses,
  useTrendingCourses,
  useUserCourses,
} from "../../hooks/useCourseHooks";
import Loading from "../../components/Common/Loading";
import ModernCourseCard from "../../components/Client/ModernCourseCard";
import FreeCourseCard from "../../components/Client/FreeCourseCard";
import type { Course } from "../../types/course.type";
import { generateCategoriesWithCounts } from "../../constants/categories";
import { useAddToCart, useCartHelpers } from "../../hooks/useCart";
import AddToCartModal from "../../components/Common/AddToCartModal";
import { useAddToCartModal } from "../../hooks/useAddToCartModal";
import { useToast } from "../../components/UI/ToastProvider";
import { generalToasts } from "../../utils/toastUtils";
// @ts-ignore
import { useTranslation } from "react-i18next";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const { recommendations, addViewedCourse } = usePersonalization();
  const { toggleWishlist } = useToggleWishlist();
  const { checkIfInWishlist } = useWishlistHelpers();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [processingWishlist, setProcessingWishlist] = useState<Set<string>>(
    new Set()
  );
  const [processingCart, setProcessingCart] = useState<Set<string>>(new Set());

  const { checkIfInCartLocal } = useCartHelpers();
  const addToCartMutation = useAddToCart();

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

  const { data: userCoursesData } = useUserCourses();

  const [selectedCategory, setSelectedCategory] = useState("all");

  const allCourses = allCoursesData?.data || [];
  const featuredCourses = featuredCoursesData?.data || [];
  const freeCourses = freeCoursesData?.data || [];
  const trendingCourse = trendingCoursesData?.data?.[0];
  const userCourses = userCoursesData?.data || [];

  const categories = generateCategoriesWithCounts(allCourses);

  const checkIfEnrolled = (courseId: string): boolean => {
    return userCourses.some((course: any) => course.id === courseId);
  };

  const {
    isModalOpen,
    addedCourse,
    recommendedCourses,
    openModal,
    closeModal,
  } = useAddToCartModal(allCourses);

  const handleAddAllToCart = async (courses: Course[]) => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }

    if (courses.length === 0) {
      showToast({
        title: "📚 No Courses Available",
        message: "All recommended courses are already in your cart!",
        type: "info",
        duration: 3000,
      });
      return;
    }

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const course of courses) {
        try {
          if (!checkIfInCartLocal(course.id)) {
            await addToCartMutation.mutateAsync(course.id);
            successCount++;
          }
        } catch (error) {
          console.error(`Failed to add course ${course.id} to cart:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        showToast({
          title: "🎉 Courses Added Successfully!",
          message: `${successCount} ${
            successCount > 1 ? "courses" : "course"
          } ${successCount > 1 ? "have" : "has"} been added to your cart. ${
            successCount > 1 ? "All courses are" : "Course is"
          } ready for checkout!`,
          type: "success",
          duration: 3200,
        });
      }

      if (errorCount > 0) {
        showToast({
          title: "⚠️ Partial Success",
          message: `${errorCount} course${
            errorCount > 1 ? "s" : ""
          } couldn't be added. Please try again.`,
          type: "warning",
          duration: 4000,
        });
      }

      closeModal();
    } catch (error) {
      showToast({
        title: "❌ Operation Failed",
        message: "Failed to add courses to cart. Please try again later.",
        type: "error",
        duration: 4000,
      });
    }
  };

  const handleEnroll = () => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent, course: Course) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }

    setProcessingWishlist((prev) => new Set([...prev, course.id]));

    try {
      const wasInWishlist = checkIfInWishlist(course.id);
      await toggleWishlist(course.id, wasInWishlist);

      showToast(
        generalToasts.success(
          wasInWishlist ? "Removed from wishlist!" : "Added to wishlist!",
          wasInWishlist
            ? `"${course.title}" removed from wishlist`
            : `"${course.title}" added to wishlist`
        )
      );
    } catch (error) {
      showToast(generalToasts.error("Fail", "Failed to update wishlist"));
    } finally {
      // Remove course from processing state
      setTimeout(() => {
        setProcessingWishlist((prev) => {
          const newSet = new Set(prev);
          newSet.delete(course.id);
          return newSet;
        });
      }, 500); // Small delay to show the effect
    }
  };

  const handleCartToggle = async (e: React.MouseEvent, course: Course) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }

    // Add course to processing state
    setProcessingCart((prev) => new Set([...prev, course.id]));

    try {
      // Check if course is already in cart locally first (faster UI feedback)
      if (checkIfInCartLocal(course.id)) {
        showToast({
          title: "📚 Already in Cart",
          message: `"${course.title}" is already in your cart!`,
          type: "info",
          duration: 3000,
        });
        return;
      }

      // Add course to cart using the mutation
      await addToCartMutation.mutateAsync(course.id);

      // Open the add to cart modal
      openModal(course);
    } catch (error: any) {
      console.error("Cart error:", error);
      showToast({
        title: "❌ Failed to Add",
        message:
          error.message || "Failed to add course to cart. Please try again.",
        type: "error",
        duration: 4000,
      });
    } finally {
      // Remove course from processing state
      setTimeout(() => {
        setProcessingCart((prev) => {
          const newSet = new Set(prev);
          newSet.delete(course.id);
          return newSet;
        });
      }, 500); // Small delay to show the effect
    }
  };

  if (allCoursesLoading && featuredLoading && freeLoading && trendingLoading) {
    return <Loading variant="page" message="Loading courses..." />;
  }

  const handleCourseClick = (courseId: number | string) => {
    if (isAuthenticated) {
      addViewedCourse(courseId.toString());
    }
    navigate(`/course/${courseId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Enhanced Background Decorations */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-1/3 w-96 h-96 bg-gradient-to-br from-pink-400 to-rose-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

          {/* Floating Elements */}
          <div className="absolute top-20 right-1/4 w-4 h-4 bg-indigo-400 rounded-full animate-bounce opacity-60"></div>
          <div className="absolute top-1/3 left-1/4 w-6 h-6 bg-purple-400 rounded-full animate-pulse opacity-40"></div>
          <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-cyan-400 rounded-full animate-bounce animation-delay-1000 opacity-50"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.25, 0, 1] }}
              className="mb-12"
            >
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-indigo-100 shadow-lg mb-8">
                <FaFire className="text-orange-500 mr-2" />
                <span className="text-sm font-semibold text-gray-700">
                  🎉 Join 50,000+ learners worldwide
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-8 leading-tight">
                Master New{" "}
                <span className="relative">
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Skills
                  </span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3"
                    viewBox="0 0 200 12"
                    fill="none"
                  >
                    <path
                      d="M2 10C20 6, 40 2, 60 3C80 4, 100 8, 120 4C140 1, 160 5, 180 2C185 1, 190 3, 198 2"
                      stroke="url(#gradient)"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient
                        id="gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="50%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
                Unlock your potential with expert-led courses designed for the
                modern learner.
                <span className="block mt-2 font-semibold text-gray-700">
                  Build skills that shape the future.
                </span>
              </p>
            </motion.div>

            {/* Enhanced Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0.25, 0.25, 0, 1],
              }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-16"
            >
              {[
                {
                  icon: FaUsers,
                  value: "50K+",
                  label: "Active Students",
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  icon: FaGraduationCap,
                  value: "1K+",
                  label: "Expert Courses",
                  color: "from-indigo-500 to-purple-500",
                },
                {
                  icon: FaTrophy,
                  value: "100+",
                  label: "Industry Experts",
                  color: "from-purple-500 to-pink-500",
                },
                {
                  icon: FaLightbulb,
                  value: "24/7",
                  label: "Learning Support",
                  color: "from-orange-500 to-red-500",
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="group"
                >
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110`}
                  >
                    <stat.icon className="text-white text-2xl" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.25, 0, 1] }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 bg-indigo-50 rounded-full mb-6">
                <FaGraduationCap className="text-indigo-600 mr-2" />
                <span className="text-sm font-semibold text-indigo-600">
                  Explore Categories
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Find Your{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Learning Path
                </span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Discover courses tailored to your interests. Each category is
                designed to take you from beginner to expert.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category, index) => (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.7 + index * 0.05,
                    ease: [0.25, 0.25, 0, 1],
                  }}
                  whileHover={{
                    scale: 1.05,
                    y: -5,
                  }}
                  whileTap={{ scale: 0.95 }}
                  className={`group relative p-6 rounded-2xl text-center transition-all duration-300 overflow-hidden ${
                    selectedCategory === category.id
                      ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl"
                      : "bg-white hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 text-gray-700 shadow-lg hover:shadow-xl border border-gray-100"
                  }`}
                >
                  {/* Background Pattern for Active Category */}
                  {selectedCategory === category.id && (
                    <div className="absolute inset-0 opacity-10">
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.3'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                      />
                    </div>
                  )}

                  {/* Icon with enhanced styling */}
                  <div
                    className={`relative inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 transition-all duration-300 ${
                      selectedCategory === category.id
                        ? "bg-white/20 backdrop-blur-sm"
                        : "bg-indigo-100 group-hover:bg-indigo-200"
                    }`}
                  >
                    <category.icon
                      className={`text-2xl transition-all duration-300 ${
                        selectedCategory === category.id
                          ? "text-white"
                          : "text-indigo-600 group-hover:text-indigo-700"
                      }`}
                    />

                    {/* Floating indicator for active */}
                    {selectedCategory === category.id && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse" />
                    )}
                  </div>

                  <div className="relative">
                    <div
                      className={`text-sm font-semibold mb-2 transition-colors duration-300 ${
                        selectedCategory === category.id
                          ? "text-white"
                          : "text-gray-900 group-hover:text-indigo-600"
                      }`}
                    >
                      {category.name}
                    </div>
                    <div
                      className={`text-xs transition-colors duration-300 ${
                        selectedCategory === category.id
                          ? "text-indigo-100"
                          : "text-gray-500 group-hover:text-indigo-500"
                      }`}
                    >
                      {category.count} courses
                    </div>
                  </div>

                  {/* Hover Border Effect */}
                  <div
                    className={`absolute inset-0 rounded-2xl border-2 transition-all duration-300 ${
                      selectedCategory === category.id
                        ? "border-white/30"
                        : "border-transparent group-hover:border-indigo-200"
                    }`}
                  />
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
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.7,
                    ease: [0.25, 0.25, 0, 1],
                  }}
                  className="mb-20"
                >
                  <div className="flex items-center justify-between mb-12">
                    <div>
                      <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-full mb-4">
                        <FaLightbulb className="text-orange-500 mr-2" />
                        <span className="text-sm font-semibold text-orange-600">
                          Personalized
                        </span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                        Recommended{" "}
                        <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                          for You
                        </span>
                      </h2>
                      <p className="text-gray-600 mt-2">
                        Courses picked just for your learning journey
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="hidden md:flex items-center gap-2 px-6 py-3 text-indigo-600 hover:text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-all duration-300"
                    >
                      View All <FaArrowRight className="text-sm" />
                    </motion.button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {featuredLoading
                      ? // Loading skeleton for recommended courses
                        Array.from({ length: 4 }).map((_, index) => (
                          <Loading
                            key={index}
                            variant="card"
                            size="md"
                            message=""
                          />
                        ))
                      : (recommendations.recommended.length > 0
                          ? recommendations.recommended
                          : featuredCourses
                        )
                          .slice(0, 4)
                          .map((course: Course, index: number) => (
                            <ModernCourseCard
                              key={index}
                              course={course}
                              index={index}
                              onWishlistToggle={handleWishlistToggle}
                              onCartToggle={handleCartToggle}
                              checkIfInWishlist={checkIfInWishlist}
                              checkIfInCart={checkIfInCartLocal}
                              checkIfEnrolled={checkIfEnrolled}
                              processingWishlist={processingWishlist}
                              processingCart={processingCart}
                              showCartButton={true}
                            />
                          ))}
                  </div>
                </motion.div>
              )}

              {/* Free Courses */}
              {(freeLoading ||
                recommendations.free.length > 0 ||
                freeCourses.length > 0) && (
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {freeLoading
                      ? // Loading skeleton for free courses
                        Array.from({ length: 4 }).map((_, index) => (
                          <Loading
                            key={index}
                            variant="card"
                            size="md"
                            message=""
                          />
                        ))
                      : (recommendations.free.length > 0
                          ? recommendations.free
                          : freeCourses
                        )
                          .slice(0, 4)
                          .map((course: Course, index: number) => (
                            <FreeCourseCard
                              key={index}
                              course={course}
                              index={index}
                              onWishlistToggle={handleWishlistToggle}
                              onCartToggle={handleCartToggle}
                              checkIfInWishlist={checkIfInWishlist}
                              checkIfInCart={checkIfInCartLocal}
                              processingWishlist={processingWishlist}
                              processingCart={processingCart}
                              onClick={() => handleCourseClick(course.id)}
                            />
                          ))}
                  </div>
                </motion.div>
              )}
            </>
          )}

          {/* Trending Now - Single Featured Course - Available for all users */}
          {(trendingLoading ||
            trendingCourse ||
            featuredCourses.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.9,
                ease: [0.25, 0.25, 0, 1],
              }}
              className="mb-24"
            >
              <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-full mb-6">
                  <FaFire className="text-orange-500 mr-2 animate-pulse" />
                  <span className="text-sm font-semibold text-orange-600">
                    Hot Trending
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  This Week's{" "}
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    Hottest Course
                  </span>
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of learners in the most popular course of the
                  week
                </p>
              </div>

              {trendingLoading ? (
                <div className="max-w-6xl mx-auto">
                  <Loading
                    variant="card"
                    size="lg"
                    message="Loading trending course..."
                  />
                </div>
              ) : (
                (() => {
                  const displayCourse = trendingCourse || featuredCourses[0];
                  if (!displayCourse) return null;
                  return (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 1.0 }}
                      className="relative max-w-6xl mx-auto"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl opacity-20 blur-2xl transform scale-105"></div>
                      <div
                        className="relative bg-white rounded-3xl shadow-2xl border border-orange-100 overflow-hidden group cursor-pointer backdrop-blur-sm"
                        onClick={() => {
                          handleCourseClick(displayCourse.id);
                        }}
                      >
                        {/* Enhanced Background Pattern */}
                        <div className="absolute inset-0 opacity-5">
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ff6b35' fill-opacity='0.1'%3E%3Cpath d='M30 30l15-15v30l-15-15zm-15 0L0 15v30l15-15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            }}
                          />
                        </div>

                        {/* Enhanced Trending Badge */}
                        <div className="absolute top-8 left-8 z-10">
                          <div className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm">
                            <FaFire className="animate-pulse text-lg" />
                            <span className="font-bold text-sm tracking-wide">
                              🔥 #1 TRENDING
                            </span>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-0">
                          {/* Course Image */}
                          <div className="relative overflow-hidden md:order-2">
                            <img
                              src={
                                displayCourse.image.url ||
                                "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop"
                              }
                              alt={displayCourse.title}
                              className="w-full h-64 md:h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />

                            {/* Action Buttons */}
                            <div className="absolute top-4 right-4 flex space-x-2 z-10">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) =>
                                  handleWishlistToggle(e, displayCourse)
                                }
                                disabled={processingWishlist.has(
                                  displayCourse.id
                                )}
                                className={`p-3 bg-white/90 rounded-full custom-icon-shadow transition-all duration-200 cursor-pointer ${
                                  processingWishlist.has(displayCourse.id)
                                    ? "text-purple-500 opacity-70"
                                    : checkIfInWishlist(displayCourse.id)
                                    ? "text-red-500 hover:bg-red-50"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-red-500"
                                }`}
                                title={
                                  processingWishlist.has(displayCourse.id)
                                    ? "Processing..."
                                    : checkIfInWishlist(displayCourse.id)
                                    ? "Remove from wishlist"
                                    : "Add to wishlist"
                                }
                                animate={
                                  processingWishlist.has(displayCourse.id)
                                    ? { scale: [1, 1.1, 1] }
                                    : {}
                                }
                                transition={
                                  processingWishlist.has(displayCourse.id)
                                    ? {
                                        duration: 0.8,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                      }
                                    : {}
                                }
                              >
                                <FaHeart
                                  className={`text-xl ${
                                    checkIfInWishlist(displayCourse.id)
                                      ? "fill-current"
                                      : ""
                                  }`}
                                />
                              </motion.button>

                              {!displayCourse.isFree && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) =>
                                    handleCartToggle(e, displayCourse)
                                  }
                                  disabled={processingCart.has(
                                    displayCourse.id
                                  )}
                                  className={`p-3 bg-white/90 rounded-full custom-icon-shadow transition-all duration-200 ${
                                    processingCart.has(displayCourse.id)
                                      ? "text-orange-500 opacity-70 cursor-pointer"
                                      : checkIfInCartLocal(displayCourse.id)
                                      ? "text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer"
                                      : "text-green-600 hover:bg-green-50 cursor-pointer"
                                  }`}
                                  title={
                                    processingCart.has(displayCourse.id)
                                      ? "Adding to cart..."
                                      : checkIfInCartLocal(displayCourse.id)
                                      ? "Already in cart"
                                      : "Add to cart"
                                  }
                                  animate={
                                    processingCart.has(displayCourse.id)
                                      ? { scale: [1, 1.1, 1] }
                                      : {}
                                  }
                                  transition={
                                    processingCart.has(displayCourse.id)
                                      ? {
                                          duration: 0.8,
                                          repeat: Infinity,
                                          ease: "easeInOut",
                                        }
                                      : {}
                                  }
                                >
                                  <FaShoppingCart className="text-xl" />
                                </motion.button>
                              )}
                            </div>

                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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

                            <div className="text-gray-600 mb-6 text-lg leading-relaxed">
                              <HTMLRenderer
                                content={displayCourse.description}
                                className="text-gray-600"
                                maxLength={300}
                              />
                            </div>

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
                                <span className="text-gray-500">students</span>
                              </div>
                            </div>

                            {/* Price and CTA */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl font-bold text-gray-900">
                                  {displayCourse.isFree ||
                                  displayCourse.originalPrice === 0
                                    ? "Free"
                                    : `$${
                                        displayCourse.discountPrice ||
                                        displayCourse.originalPrice
                                      }`}
                                </span>
                              </div>
                              <button
                                onClick={(e) => {
                                  handleEnroll();
                                  e.stopPropagation();
                                }}
                                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
                              >
                                Enroll Now
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })()
              )}
            </motion.div>
          )}

          {/* Category Sections */}
          <div className="space-y-16">
            {(() => {
              const getCoursesForCategory = (category: string) => {
                const coursesToFilter =
                  recommendations.recommended.length > 0
                    ? recommendations.recommended
                    : allCourses;

                return coursesToFilter
                  .filter((course: any) => course.category === category)
                  .slice(0, 3);
              };

              const generateDynamicCategories = () => {
                if (!allCourses || allCourses.length === 0) return [];

                const uniqueCategories = [
                  ...new Set(allCourses.map((course) => course.category)),
                ];

                const colorPalettes = [
                  {
                    bgColor: "bg-blue-100",
                    iconColor: "text-blue-600",
                    buttonColor: "text-blue-600 hover:text-blue-700",
                    hoverBg: "hover:bg-blue-50",
                  },
                  {
                    bgColor: "bg-purple-100",
                    iconColor: "text-purple-600",
                    buttonColor: "text-purple-600 hover:text-purple-700",
                    hoverBg: "hover:bg-purple-50",
                  },
                  {
                    bgColor: "bg-green-100",
                    iconColor: "text-green-600",
                    buttonColor: "text-green-600 hover:text-green-700",
                    hoverBg: "hover:bg-green-50",
                  },
                  {
                    bgColor: "bg-orange-100",
                    iconColor: "text-orange-600",
                    buttonColor: "text-orange-600 hover:text-orange-700",
                    hoverBg: "hover:bg-orange-50",
                  },
                  {
                    bgColor: "bg-pink-100",
                    iconColor: "text-pink-600",
                    buttonColor: "text-pink-600 hover:text-pink-700",
                    hoverBg: "hover:bg-pink-50",
                  },
                  {
                    bgColor: "bg-indigo-100",
                    iconColor: "text-indigo-600",
                    buttonColor: "text-indigo-600 hover:text-indigo-700",
                    hoverBg: "hover:bg-indigo-50",
                  },
                  {
                    bgColor: "bg-emerald-100",
                    iconColor: "text-emerald-600",
                    buttonColor: "text-emerald-600 hover:text-emerald-700",
                    hoverBg: "hover:bg-emerald-50",
                  },
                  {
                    bgColor: "bg-violet-100",
                    iconColor: "text-violet-600",
                    buttonColor: "text-violet-600 hover:text-violet-700",
                    hoverBg: "hover:bg-violet-50",
                  },
                  {
                    bgColor: "bg-red-100",
                    iconColor: "text-red-600",
                    buttonColor: "text-red-600 hover:text-red-700",
                    hoverBg: "hover:bg-red-50",
                  },
                  {
                    bgColor: "bg-cyan-100",
                    iconColor: "text-cyan-600",
                    buttonColor: "text-cyan-600 hover:text-cyan-700",
                    hoverBg: "hover:bg-cyan-50",
                  },
                  {
                    bgColor: "bg-amber-100",
                    iconColor: "text-amber-600",
                    buttonColor: "text-amber-600 hover:text-amber-700",
                    hoverBg: "hover:bg-amber-50",
                  },
                  {
                    bgColor: "bg-gray-100",
                    iconColor: "text-gray-600",
                    buttonColor: "text-gray-600 hover:text-gray-700",
                    hoverBg: "hover:bg-gray-50",
                  },
                ];

                return uniqueCategories.map((categoryName, index) => {
                  const colorIndex = index % colorPalettes.length;

                  return {
                    id: categoryName,
                    name: categoryName,
                    description: `Explore ${categoryName} courses and enhance your skills`,
                    icon: FaGraduationCap,
                    ...colorPalettes[colorIndex],
                  };
                });
              };

              const dynamicCategories = generateDynamicCategories();

              return dynamicCategories
                .map((category, categoryIndex) => {
                  const courses = getCoursesForCategory(category.id);

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
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {courses.map((course: Course, index: number) => (
                          <ModernCourseCard
                            key={index}
                            course={course}
                            index={index}
                            onWishlistToggle={handleWishlistToggle}
                            onCartToggle={handleCartToggle}
                            checkIfInWishlist={checkIfInWishlist}
                            checkIfInCart={checkIfInCartLocal}
                            checkIfEnrolled={checkIfEnrolled}
                            processingWishlist={processingWishlist}
                            processingCart={processingCart}
                            showCartButton={true}
                          />
                        ))}
                      </div>
                    </motion.div>
                  );
                })
                .filter(Boolean);
            })()}
          </div>
        </div>
      </section>

      {/* Add to Cart Modal */}
      <AddToCartModal
        isOpen={isModalOpen}
        onClose={closeModal}
        addedCourse={addedCourse}
        recommendedCourses={recommendedCourses}
        onAddAllToCart={handleAddAllToCart}
        checkIfInCart={checkIfInCartLocal}
      />
    </div>
  );
};

export default Home;

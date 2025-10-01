import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlay,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaClock,
  FaBook,
  FaGlobe,
  FaAward,
  FaChevronDown,
  FaChevronUp,
  FaPlayCircle,
  FaLock,
  FaDownload,
  FaHeart,
  FaRegHeart,
  FaShare,
  FaCheckCircle,
  FaExclamationTriangle,
  FaQuestionCircle,
  FaInfinity,
  FaMobile,
  FaTv,
  FaShoppingCart,
} from "react-icons/fa";
import { useSnackbar } from "notistack";
import { useCourse } from "../../hooks/useCourseQueries";
import { useToggleWishlist, useIsInWishlist } from "../../hooks/useWishlist";
import { useAuthContext } from "../../context/AuthContext";
import { useAddToCart, useIsInCart } from "../../hooks/useCart";
import { useUserCourses } from "../../hooks/useCourseQueries";
import type { Course, Lesson } from "../../types/course.type";

const CoursePreviewCard: React.FC<{
  course: Course;
  calculateDiscountPercentage: () => number;
  formatDuration: (seconds: number) => string;
  isWishlisted: boolean;
  onWishlistToggle: () => void;
  setIsVideoModalOpen: (value: boolean) => void;
  isAuthenticated: boolean;
  isInCart: boolean;
  isEnrolled: boolean;
  handleAddToCart: () => void;
  handleBuyNow: () => void;
  addToCartMutation: any;
  navigate: any;
}> = ({
  course,
  calculateDiscountPercentage,
  formatDuration,
  isWishlisted,
  onWishlistToggle,
  setIsVideoModalOpen,
  isAuthenticated,
  isInCart,
  isEnrolled,
  handleAddToCart,
  handleBuyNow,
  addToCartMutation,
  navigate,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
      {/* Video Preview */}
      <div className="relative aspect-video bg-gray-100">
        {course.image ? (
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <FaBook className="text-4xl text-gray-400" />
          </div>
        )}

        {/* Wishlist Button - Top Right Overlay (only for authenticated users) */}
        {isAuthenticated && (
          <motion.button
            onClick={onWishlistToggle}
            className={`absolute top-4 right-4 z-10 p-3 rounded-full backdrop-blur-md border transition-all duration-300 cursor-pointer ${
              isWishlisted
                ? "bg-red-50/90 text-red-600 border-red-200 hover:bg-red-100/90"
                : "bg-white/90 text-gray-600 border-gray-200 hover:bg-red-50/90 hover:text-red-600 hover:border-red-200"
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={isWishlisted ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              {isWishlisted ? (
                <FaHeart className="text-red-500 w-5 h-5" />
              ) : (
                <FaRegHeart className="w-5 h-5" />
              )}
              {/* Subtle pulse animation when wishlisted */}
              {isWishlisted && (
                <motion.div
                  className="absolute inset-0 bg-red-400 rounded-full"
                  initial={{ scale: 1, opacity: 0.3 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                />
              )}
            </motion.div>
          </motion.button>
        )}

        {/* Play Button Overlay */}
        {course.videoPromo && (
          <button
            onClick={() => setIsVideoModalOpen(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition-all duration-300 group"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <FaPlay className="text-2xl text-gray-800 ml-1" />
            </div>
          </button>
        )}

        {/* Preview Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded">
            Preview this course
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Price Section */}
        <div className="mb-6">
          {course.isFree ? (
            <div className="text-3xl font-bold text-gray-900">Free</div>
          ) : (
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-bold text-gray-900">
                ${course.currentPrice || course.originalPrice}
              </span>
              {calculateDiscountPercentage() > 0 && (
                <>
                  <span className="text-lg text-gray-500 line-through">
                    ${course.originalPrice}
                  </span>
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded">
                    {calculateDiscountPercentage()}% off
                  </span>
                </>
              )}
            </div>
          )}

          {!course.isFree && calculateDiscountPercentage() > 0 && (
            <p className="text-red-600 text-sm font-medium mt-2">
              🔥 3 days left at this price!
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          {isEnrolled ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/course/${course.id}/watch`);
              }}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-center rounded-lg transition-colors duration-200 cursor-pointer flex items-center justify-center space-x-2"
            >
              <FaPlay />
              <span>Continue Learning</span>
            </button>
          ) : course.isFree ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Handle free enrollment
                navigate(`/course/${course.id}/watch`);
              }}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-center rounded-lg transition-colors duration-200 cursor-pointer"
            >
              Enroll for Free
            </button>
          ) : isInCart ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/cart");
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-center rounded-lg transition-colors duration-200 cursor-pointer flex items-center justify-center space-x-2"
            >
              <FaShoppingCart />
              <span>Go to Cart</span>
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              disabled={addToCartMutation.isPending}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-center rounded-lg transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {addToCartMutation.isPending ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <FaShoppingCart />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          )}

          {!course.isFree && !isEnrolled && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleBuyNow();
              }}
              disabled={addToCartMutation.isPending}
              className="w-full py-3 border border-gray-800 hover:bg-gray-50 text-gray-900 font-bold text-center rounded-lg transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>
          )}
        </div>

        {/* Money-back guarantee */}
        <div className="text-center text-sm text-gray-600 mb-6">
          30-Day Money-Back Guarantee
        </div>

        {/* Course Includes */}
        <div className="space-y-3 mb-6">
          <h4 className="font-semibold text-gray-900">This course includes:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <FaTv className="text-gray-500 flex-shrink-0" />
              <span>
                {formatDuration(course.totalDuration)} on-demand video
              </span>
            </div>
            <div className="flex items-center gap-3">
              <FaDownload className="text-gray-500 flex-shrink-0" />
              <span>Downloadable resources</span>
            </div>
            <div className="flex items-center gap-3">
              <FaInfinity className="text-gray-500 flex-shrink-0" />
              <span>Full lifetime access</span>
            </div>
            <div className="flex items-center gap-3">
              <FaMobile className="text-gray-500 flex-shrink-0" />
              <span>Access on mobile and TV</span>
            </div>
            {course.certificateProvided && (
              <div className="flex items-center gap-3">
                <FaAward className="text-gray-500 flex-shrink-0" />
                <span>Certificate of completion</span>
              </div>
            )}
          </div>
        </div>

        {/* Share Section */}
        <div className="flex justify-center pt-6 border-t border-gray-200">
          {/* Enhanced Share Button */}
          <motion.button
            className="group relative flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all duration-300 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
            }}
          >
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ duration: 0.2 }}
            >
              <FaShare className="group-hover:text-purple-500 transition-colors" />
            </motion.div>
            <span className="text-sm">Share Course</span>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Copy link
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

const InstructorInfo: React.FC<{ course: Course }> = ({ course }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-6">
        <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-3xl">
            {course.instructor.firstName[0]}
            {course.instructor.lastName[0]}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {course.instructor.firstName} {course.instructor.lastName}
          </h3>
          <p className="text-gray-600 mb-4">Expert Instructor</p>
          <p className="text-gray-700 leading-relaxed">
            Experienced professional with expertise in {course.category}.
            Passionate about teaching and helping students achieve their
            learning goals.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">
            Teaching Experience
          </h4>
          <p className="text-gray-600">5+ years of industry experience</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Students Taught</h4>
          <p className="text-gray-600">
            {course.studentsEnrolled.length.toLocaleString()}+ students
          </p>
        </div>
      </div>
    </div>
  );
};

const CourseDetails = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "curriculum" | "instructor" | "reviews"
  >("overview");
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const { isAuthenticated } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const { isInWishlist } = useIsInWishlist(courseId || "");
  const { toggleWishlist } = useToggleWishlist();
  const { data: isInCartData } = useIsInCart(courseId || "");
  const { data: userCoursesData } = useUserCourses();
  const addToCartMutation = useAddToCart();

  const isInCart = isInCartData?.data?.isInCart || false;
  const userCourses = userCoursesData?.data || [];
  const isEnrolled = userCourses.some((c: any) => c.id === courseId);

  const handleWishlistToggle = () => {
    if (courseId && isAuthenticated) {
      toggleWishlist(courseId, isInWishlist);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }

    if (!courseId) return;

    try {
      await addToCartMutation.mutateAsync(courseId);
      enqueueSnackbar("Course added to cart successfully!", {
        variant: "success",
        autoHideDuration: 3000,
      });
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to add to cart";
      enqueueSnackbar(message, {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }

    if (!courseId) return;

    try {
      // Add to cart first if not already in cart
      if (!isInCart) {
        await addToCartMutation.mutateAsync(courseId);
      }
      // Navigate to cart
      navigate("/cart");
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to add to cart";
      enqueueSnackbar(message, {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  };

  const {
    data: courseResponse,
    isLoading,
    error,
  } = useCourse(courseId || "", {
    enabled: !!courseId,
  });

  if (isLoading) {
    return <CourseDetailsLoader />;
  }

  if (error || !courseResponse?.data) {
    return <CourseNotFound error={error} />;
  }

  const course = courseResponse.data;

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newExpanded = prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId];

      return newExpanded;
    });
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i - 0.5 <= rating) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    return stars;
  };

  const calculateDiscountPercentage = () => {
    if (course.discountPrice && course.discountPrice < course.originalPrice) {
      return Math.round(
        ((course.originalPrice - course.discountPrice) / course.originalPrice) *
          100
      );
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-purple-200 mb-4">
              <button
                onClick={() => navigate("/courses")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Courses
              </button>
              <span>›</span>
              <span className="text-purple-300">{course.category}</span>
              {course.subcategory && (
                <>
                  <span>›</span>
                  <span className="text-purple-200">{course.subcategory}</span>
                </>
              )}
            </nav>

            {/* Course Title & Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
                {course.title}
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed mb-6 max-w-3xl">
                {course.shortDescription ||
                  course.description.slice(0, 200) + "..."}
              </p>
            </motion.div>

            {/* Course Meta Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-wrap items-center gap-6 mb-6"
            >
              {/* Rating */}
              <div className="flex items-center gap-2">
                <span className="text-orange-400 font-bold text-lg">
                  {course.rating.toFixed(1)}
                </span>
                <div className="flex items-center gap-1">
                  {renderStars(course.rating)}
                </div>
                <span className="text-orange-300 text-sm underline cursor-pointer">
                  ({course.ratingsCount.toLocaleString()} ratings)
                </span>
              </div>

              {/* Students */}
              <div className="text-gray-300">
                {course.studentsEnrolled.length.toLocaleString()} students
              </div>

              {/* Level */}
              <div className="px-3 py-1 bg-yellow-500 text-yellow-900 text-sm font-medium rounded">
                {course.level}
              </div>
            </motion.div>

            {/* Instructor & Last Updated */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap items-center gap-6 text-sm text-gray-300"
            >
              <div className="flex items-center gap-2">
                <span>Created by</span>
                <span className="text-purple-300 underline cursor-pointer">
                  {course.instructor.firstName} {course.instructor.lastName}
                </span>
              </div>
              <div>
                Last updated {new Date(course.lastUpdated).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <FaGlobe />
                <span>{course.language}</span>
              </div>
              {course.certificateProvided && (
                <div className="flex items-center gap-1">
                  <FaAward className="text-yellow-400" />
                  <span>Certificate</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left Column - Course Content */}
          <div className="lg:col-span-2">
            {/* Course Preview Card (Mobile Only) */}
            <div className="lg:hidden mb-8">
              <CoursePreviewCard
                course={course}
                calculateDiscountPercentage={calculateDiscountPercentage}
                formatDuration={formatDuration}
                isWishlisted={isInWishlist}
                onWishlistToggle={handleWishlistToggle}
                setIsVideoModalOpen={setIsVideoModalOpen}
                isAuthenticated={isAuthenticated}
                isInCart={isInCart}
                isEnrolled={isEnrolled}
                handleAddToCart={handleAddToCart}
                handleBuyNow={handleBuyNow}
                addToCartMutation={addToCartMutation}
                navigate={navigate}
              />
            </div>

            {/* Course Content */}
            <div className="bg-white border border-gray-200 rounded-lg">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex">
                  {[
                    { id: "overview", label: "Overview" },
                    { id: "curriculum", label: "Curriculum" },
                    { id: "instructor", label: "Instructor" },
                    { id: "reviews", label: "Reviews" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                        activeTab === tab.id
                          ? "border-purple-600 text-purple-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {tab.label}
                      {tab.id === "reviews" && (
                        <span className="ml-1 text-xs">
                          ({course.ratingsCount})
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6 lg:p-8">
                <AnimatePresence mode="wait">
                  {activeTab === "overview" && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CourseOverview course={course} />
                    </motion.div>
                  )}
                  {activeTab === "curriculum" && (
                    <motion.div
                      key="curriculum"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CourseCurriculum
                        course={course}
                        expandedSections={expandedSections}
                        toggleSection={toggleSection}
                        formatDuration={formatDuration}
                      />
                    </motion.div>
                  )}
                  {activeTab === "instructor" && (
                    <motion.div
                      key="instructor"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <InstructorInfo course={course} />
                    </motion.div>
                  )}
                  {activeTab === "reviews" && (
                    <motion.div
                      key="reviews"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CourseReviews
                        course={course}
                        renderStars={renderStars}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Column - Course Preview (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-8">
              <CoursePreviewCard
                course={course}
                calculateDiscountPercentage={calculateDiscountPercentage}
                formatDuration={formatDuration}
                isWishlisted={isInWishlist}
                onWishlistToggle={handleWishlistToggle}
                setIsVideoModalOpen={setIsVideoModalOpen}
                isAuthenticated={isAuthenticated}
                isInCart={isInCart}
                isEnrolled={isEnrolled}
                handleAddToCart={handleAddToCart}
                handleBuyNow={handleBuyNow}
                addToCartMutation={addToCartMutation}
                navigate={navigate}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoModalOpen && course.videoPromo && (
          <VideoModal
            videoUrl={course.videoPromo}
            onClose={() => setIsVideoModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const CourseOverview: React.FC<{ course: Course }> = ({ course }) => {
  return (
    <div className="space-y-8">
      {/* Course Description */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          About this course
        </h3>
        <div className="prose prose-lg max-w-none text-gray-700">
          {course.description.split("\n").map((paragraph, index) => (
            <p key={index} className="mb-4 last:mb-0 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* What you'll learn */}
      {course.learningObjectives.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            What you'll learn
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {course.learningObjectives.map((objective, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3"
              >
                <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                <span className="text-gray-700 leading-relaxed">
                  {objective}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Requirements */}
      {course.requirements.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Requirements</h3>
          <ul className="space-y-3">
            {course.requirements.map((requirement, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-700">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span className="leading-relaxed">{requirement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Target Audience */}
      {course.targetAudience.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Who this course is for
          </h3>
          <ul className="space-y-3">
            {course.targetAudience.map((audience, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-700">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span className="leading-relaxed">{audience}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const CourseCurriculum: React.FC<{
  course: Course;
  expandedSections: string[];
  toggleSection: (sectionId: string) => void;
  formatDuration: (seconds: number) => string;
}> = ({ course, expandedSections, toggleSection, formatDuration }) => {
  return (
    <div className="space-y-6">
      {/* Header with Course Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Course content</h3>
        <div className="text-sm text-gray-600 flex flex-wrap gap-4">
          <span>{course.sections.length} sections</span>
          <span>•</span>
          <span>{course.totalLessons} lectures</span>
          <span>•</span>
          <span>{formatDuration(course.totalDuration)} total length</span>
        </div>
      </div>

      {/* Sections */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {course.sections.map((section, sectionIndex) => {
          const sectionKey = section.id || `section-${sectionIndex}`;

          return (
            <div
              key={sectionKey}
              className="border-b border-gray-200 last:border-b-0 "
            >
              {/* Section Header */}
              <button
                onClick={() => {
                  toggleSection(sectionKey);
                }}
                className="w-full px-6 py-5 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
              >
                <div className="flex-1 min-w-0 cursor-pointer">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-medium text-gray-500">
                      Section {sectionIndex + 1}:
                    </span>
                    <span className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {section.title}
                    </span>
                  </div>
                  {section.description && (
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      {section.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <div className="text-right text-sm text-gray-500">
                    <div>{section.lessons.length} lectures</div>
                    <div className="font-medium">
                      {formatDuration(
                        section.lessons.reduce(
                          (acc, lesson) => acc + lesson.duration,
                          0
                        )
                      )}
                    </div>
                  </div>
                  <div className="transition-transform duration-200 group-hover:scale-110">
                    {expandedSections.includes(sectionKey) ? (
                      <FaChevronUp className="text-gray-400" />
                    ) : (
                      <FaChevronDown className="text-gray-400" />
                    )}
                  </div>
                </div>
              </button>

              {/* Section Content */}
              <AnimatePresence initial={false}>
                {expandedSections.includes(sectionKey) && (
                  <motion.div
                    key={`content-${sectionKey}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gray-50 px-6 py-4">
                      <div className="space-y-2">
                        {section.lessons.map((lesson, lessonIndex) => (
                          <LessonItem
                            key={
                              lesson.id ||
                              `lesson-${sectionIndex}-${lessonIndex}`
                            }
                            lesson={lesson}
                            lessonIndex={lessonIndex}
                            formatDuration={formatDuration}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const LessonItem: React.FC<{
  lesson: Lesson;
  lessonIndex: number;
  formatDuration: (seconds: number) => string;
}> = ({ lesson, lessonIndex, formatDuration }) => {
  return (
    <div className="flex items-center gap-4 py-3 hover:bg-white rounded-lg px-4 transition-colors group cursor-pointer">
      {/* Lesson Icon */}
      <div className="flex-shrink-0">
        {lesson.isPreview ? (
          <div className="w-6 h-6 flex items-center justify-center">
            <FaPlayCircle className="text-purple-600 text-lg group-hover:scale-110 transition-transform" />
          </div>
        ) : (
          <div className="w-6 h-6 flex items-center justify-center">
            <FaLock className="text-gray-400 text-sm" />
          </div>
        )}
      </div>

      {/* Lesson Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
            {lessonIndex + 1}. {lesson.title}
          </span>
          {lesson.isPreview && (
            <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
              Preview
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <FaClock />
            <span>{formatDuration(lesson.duration)}</span>
          </div>

          {lesson.resources.length > 0 && (
            <div className="flex items-center gap-1">
              <FaDownload />
              <span>{lesson.resources.length} resources</span>
            </div>
          )}

          {lesson.quiz.length > 0 && (
            <div className="flex items-center gap-1">
              <FaQuestionCircle />
              <span>{lesson.quiz.length} quiz</span>
            </div>
          )}
        </div>
      </div>

      {/* Duration */}
      <div className="text-sm text-gray-500 font-medium">
        {formatDuration(lesson.duration)}
      </div>
    </div>
  );
};

const CourseReviews: React.FC<{
  course: Course;
  renderStars: (rating: number) => React.ReactElement[];
}> = ({ course, renderStars }) => {
  return (
    <div className="space-y-8">
      {/* Rating Overview */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-3">
              {course.rating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {renderStars(course.rating)}
            </div>
            <div className="text-sm text-gray-600">Course Rating</div>
          </div>

          {/* Rating Bars */}
          <div className="md:col-span-2 space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = course.reviews.filter(
                (r) => Math.floor(r.rating) === rating
              ).length;
              const percentage =
                course.ratingsCount > 0
                  ? (count / course.ratingsCount) * 100
                  : 0;

              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-700 w-20">
                    {rating} <FaStar className="text-yellow-400 text-xs" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: (5 - rating) * 0.1 }}
                      className="h-full bg-yellow-400 rounded-full"
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Reviews</h3>

        {course.reviews.length > 0 ? (
          <div className="space-y-6">
            {course.reviews.map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-b border-gray-200 pb-6 last:border-b-0"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium">
                      {review.user.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-semibold text-gray-900">
                        Anonymous User
                      </span>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaStar className="text-2xl text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">
              No reviews yet
            </h4>
            <p className="text-gray-500 mb-6">
              Be the first to review this course and help other students!
            </p>
            <button className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
              Write a Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const CourseDetailsLoader = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Skeleton */}
      <div className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-6 bg-gray-700 rounded w-2/3 mb-6"></div>
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-700 rounded w-24"></div>
                  <div className="h-4 bg-gray-700 rounded w-24"></div>
                  <div className="h-4 bg-gray-700 rounded w-24"></div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="animate-pulse bg-white rounded-lg overflow-hidden">
                <div className="aspect-video bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-12 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseNotFound: React.FC<{ error: any }> = ({ error }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaExclamationTriangle className="text-3xl text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Course Not Found
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          {error?.message ||
            "The course you're looking for doesn't exist or has been removed."}
        </p>
        <div className="space-x-4">
          <button
            onClick={() => navigate("/courses")}
            className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            Browse Courses
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

const VideoModal: React.FC<{ videoUrl: string; onClose: () => void }> = ({
  videoUrl,
  onClose,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="bg-white rounded-lg overflow-hidden max-w-4xl w-full aspect-video shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-full">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <span className="text-lg font-bold">×</span>
          </button>

          {/* Video Player */}
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full object-cover"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CourseDetails;

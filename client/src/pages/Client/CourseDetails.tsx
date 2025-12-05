import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { HTMLRenderer } from "../../utils/htmlRenderer";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaGlobe,
  FaAward,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useCourse } from "../../hooks/useCourseHooks";
import { useGetCourseReviews } from "../../hooks/useReviews";
import { getVideoUrl } from "../../utils/mediaHelpers";
import { useToggleWishlist, useIsInWishlist } from "../../hooks/useWishlist";
import { useAuthContext } from "../../context/AuthContext";
import { useAddToCart, useIsInCart } from "../../hooks/useCart";
import {
  useEnrollInFreeCourse,
  useUserEnrollments,
} from "../../hooks/useEnrollment";
import type { Course } from "../../types/course.type";
import { useToast } from "../../components/UI/ToastProvider";
import { cartToasts, generalToasts } from "../../utils/toastUtils";
import { trackCourseView } from "../../services/course.service";
import InstructorInfo from "../../components/CourseDetails/InstructorInfo";
import CourseCurriculum from "../../components/CourseDetails/CourseCurriculum";
import CoursePreviewCard from "../../components/CourseDetails/CoursePreviewCard";

const CourseDetails = () => {
  const { t } = useTranslation();
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "curriculum" | "instructor" | "reviews"
  >("overview");
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const { isAuthenticated } = useAuthContext();

  const { isInWishlist } = useIsInWishlist(courseId || "");
  const { toggleWishlist } = useToggleWishlist();
  const { data: isInCartData } = useIsInCart(courseId || "");
  const addToCartMutation = useAddToCart();
  const enrollInFreeCourseMutation = useEnrollInFreeCourse();

  const isInCart = isInCartData?.data?.isInCart || false;
  const { data: enrollmentsData } = useUserEnrollments();

  const userCourses = enrollmentsData?.data?.enrollments || [];
  const isEnrolled = userCourses?.some((c: any) => c.course?.id === courseId);

  const { showToast } = useToast();

  const handleWishlistToggle = () => {
    if (courseId && isAuthenticated) {
      toggleWishlist(courseId, isInWishlist);
    }
  };

  const handleFreeEnrollment = async () => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }

    if (!courseId) return;

    try {
      await enrollInFreeCourseMutation.mutateAsync(courseId);
      // The mutation success handler will show the success message
      // and invalidate the queries to update the enrollment status
    } catch (error: any) {
      // Error is handled in the mutation's onError handler
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }

    if (!courseId) return;

    try {
      if (!isInCart) {
        await addToCartMutation.mutateAsync(courseId);
      }
      navigate("/cart");
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to add to cart";
      showToast(generalToasts.error("Failed to add to cart", message));
    }
  };

  const {
    data: courseResponse,
    isLoading,
    error,
  } = useCourse(courseId || "", {
    enabled: !!courseId,
  });

  // Get course reviews
  const { data: reviewsData, isLoading: reviewsLoading } = useGetCourseReviews(
    courseId || "",
    1,
    10
  );

  // Track course view when course loads
  useEffect(() => {
    if (courseId && courseResponse?.data) {
      trackCourseView(courseId);
    }
  }, [courseId, courseResponse?.data]);
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

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }

    if (!courseId) return;

    try {
      await addToCartMutation.mutateAsync(courseId);
      showToast(cartToasts.added(course.title));
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to add to cart";
      showToast(generalToasts.error("Failed to add to cart", message));
    }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-4xl">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-purple-200 mb-4">
              <button
                onClick={() => navigate("/courses")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                {t("courseDetails.courses")}
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
              className="mb-4 sm:mb-6"
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3 sm:mb-4">
                {course.title}
              </h1>
              <div className="text-lg sm:text-xl text-gray-300 leading-relaxed mb-4 sm:mb-6 max-w-3xl">
                {course.shortDescription ? (
                  <HTMLRenderer
                    content={course.shortDescription}
                    className="text-gray-600"
                    maxLength={200}
                  />
                ) : (
                  <HTMLRenderer
                    content={course.description}
                    className="text-gray-600"
                    maxLength={200}
                  />
                )}
              </div>
            </motion.div>

            {/* Course Meta Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-wrap items-center gap-3 sm:gap-6 mb-4 sm:mb-6"
            >
              {/* Rating */}
              <div className="flex items-center gap-2">
                <span className="text-orange-400 font-bold text-base sm:text-lg">
                  {course.rating.toFixed(1)}
                </span>
                <div className="flex items-center gap-1">
                  {renderStars(course.rating)}
                </div>
                <span className="text-orange-300 text-xs sm:text-sm underline cursor-pointer">
                  ({course.ratingsCount.toLocaleString()}{" "}
                  {t("courseDetails.ratings")})
                </span>
              </div>

              {/* Students */}
              <div className="text-gray-300 text-sm sm:text-base">
                {course.studentsEnrolled.length.toLocaleString()}{" "}
                {t("courseDetails.students")}
              </div>

              {/* Level */}
              <div className="px-2 sm:px-3 py-1 bg-yellow-500 text-yellow-900 text-xs sm:text-sm font-medium rounded">
                {course.level}
              </div>
            </motion.div>

            {/* Instructor & Last Updated */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-300"
            >
              <div className="flex items-center gap-2">
                <span>{t("courseDetails.createdBy")}</span>
                <span className="text-purple-300 underline cursor-pointer">
                  {course.instructor.firstName} {course.instructor.lastName}
                </span>
              </div>
              <div>
                {t("courseDetails.lastUpdated", {
                  date: new Date(course.lastUpdated).toLocaleDateString(),
                })}
              </div>
              <div className="flex items-center gap-1">
                <FaGlobe />
                <span>{course.language}</span>
              </div>
              {course.certificateProvided && (
                <div className="flex items-center gap-1">
                  <FaAward className="text-yellow-400" />
                  <span>{t("courseDetails.certificate")}</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Course Content */}
          <div className="xl:col-span-2 order-2 xl:order-1">
            {/* Course Preview Card (Mobile/Tablet) - Hidden on XL+ */}
            <div className="xl:hidden mb-6 lg:mb-8">
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
                handleFreeEnrollment={handleFreeEnrollment}
                addToCartMutation={addToCartMutation}
                enrollInFreeCourseMutation={enrollInFreeCourseMutation}
                navigate={navigate}
              />
            </div>

            {/* Course Content */}
            <div className="bg-white border border-gray-200 rounded-lg">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto scrollbar-hide">
                  {[
                    { id: "overview", label: t("courseDetails.tabs.overview") },
                    {
                      id: "curriculum",
                      label: t("courseDetails.tabs.curriculum"),
                    },
                    {
                      id: "instructor",
                      label: t("courseDetails.tabs.instructor"),
                    },
                    { id: "reviews", label: t("courseDetails.tabs.reviews") },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-3 sm:px-6 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 transition-colors cursor-pointer ${
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
              <div className="p-4 sm:p-6 lg:p-8">
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
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-2xl font-bold text-gray-900">
                            {t("courseDetails.studentReviews")}
                          </h3>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {renderStars(course.rating)}
                            </div>
                            <span className="font-bold text-lg">
                              {course.rating.toFixed(1)}
                            </span>
                            <span className="text-gray-600">
                              ({course.ratingsCount}{" "}
                              {t("courseDetails.reviews")})
                            </span>
                          </div>
                        </div>

                        {reviewsLoading ? (
                          <div className="text-center py-16">
                            <div className="relative">
                              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl animate-pulse"></div>
                            </div>
                            <p className="text-slate-600 mt-4 font-medium">
                              Loading reviews...
                            </p>
                          </div>
                        ) : (reviewsData?.reviews?.length || 0) > 0 ? (
                          <div className="">
                            {reviewsData?.reviews.map((review: any) => {
                              console.log("review: ", review);
                              return (
                                <div
                                  key={review.id}
                                  className="group relative overflow-hidden"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-white to-purple-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 "></div>
                                  <div className="relative backdrop-blur-sm bg-white/80 border border-white/60 rounded-2xl px-5 pb-5 pt-2 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group-hover:border-blue-200/60 ">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center space-x-4 ">
                                        <div className="relative">
                                          <div className="w-13 h-13 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
                                            <span className="text-white font-bold text-lg">
                                              {(
                                                review.user?.firstName?.charAt(
                                                  0
                                                ) ||
                                                review.user?.name?.charAt(0) ||
                                                "U"
                                              ).toUpperCase()}
                                            </span>
                                          </div>
                                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                                        </div>
                                        <div>
                                          <h4 className="font-bold text-slate-900 text-lg mb-1">
                                            {review.user?.firstName}{" "}
                                            {review.user?.lastName || ""}
                                          </h4>
                                          <div className="flex pt-1 flex-col gap-2 items-center space-x-3 mb-2">
                                            <div className="flex items-center space-x-1">
                                              {renderStars(review.rating)}
                                            </div>
                                            <div className="text-right">
                                              <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200/60 rounded-xl px-3 py-[0.1rem] mb-2">
                                                <span className="text-[0.8rem] text-slate-600 font-semibold">
                                                  {new Date(
                                                    review.date
                                                  ).toLocaleDateString(
                                                    "en-US",
                                                    {
                                                      month: "short",
                                                      day: "numeric",
                                                      year: "numeric",
                                                    }
                                                  )}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="relative">
                                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                      <p className="relative text-slate-700 leading-relaxed text-base font-medium bg-gradient-to-r from-slate-50/80 to-white/80 rounded-xl py-2 px-4 border border-slate-200/40">
                                        "{review.comment}"
                                      </p>
                                    </div>
                                    {/* Decorative elements */}
                                    <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-16">
                            <div className="relative mb-6">
                              <div className="w-24 h-24 bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50 border border-slate-200/60 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                                <svg
                                  className="w-10 h-10 text-slate-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                  />
                                </svg>
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-3xl blur-2xl"></div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">
                              No Reviews Yet
                            </h3>
                            <p className="text-slate-600 font-medium mb-6 max-w-md mx-auto">
                              Be the first to share your experience and help
                              others discover this amazing course!
                            </p>
                            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/60 rounded-2xl px-6 py-3">
                              <svg
                                className="w-5 h-5 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                />
                              </svg>
                              <span className="text-blue-700 font-semibold text-sm">
                                Write the first review
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Column - Course Preview */}
          <div className="xl:col-span-1 order-1 xl:order-2">
            <div className="sticky top-4 lg:top-8">
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
                handleFreeEnrollment={handleFreeEnrollment}
                addToCartMutation={addToCartMutation}
                enrollInFreeCourseMutation={enrollInFreeCourseMutation}
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
            videoUrl={getVideoUrl(course.videoPromo)}
            onClose={() => setIsVideoModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const CourseOverview: React.FC<{ course: Course }> = ({ course }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Course Description */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          {t("courseDetails.description")}
        </h3>
        <div className="prose prose-lg max-w-none text-gray-700">
          <HTMLRenderer
            content={course.description}
            className="text-gray-700 prose-lg max-w-none"
          />
        </div>
      </div>

      {/* What you'll learn */}
      {course.learningObjectives.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            {t("courseDetails.whatYoullLearn")}
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
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {t("courseDetails.requirements")}
          </h3>
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
            {t("courseDetails.whoThisCourseIsFor")}
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
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaExclamationTriangle className="text-3xl text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {t("courseDetails.courseNotFound")}
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          {error?.message || t("courseDetails.courseNotFoundDesc")}
        </p>
        <div className="space-x-4">
          <button
            onClick={() => navigate("/courses")}
            className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            {t("courseDetails.browseCourses")}
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t("courseDetails.goBack")}
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

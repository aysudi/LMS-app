import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useCourse } from "../../hooks/useCourseHooks";
import { getVideoUrl } from "../../utils/mediaHelpers";
import { useToggleWishlist, useIsInWishlist } from "../../hooks/useWishlist";
import { useAuthContext } from "../../context/AuthContext";
import { useAddToCart, useIsInCart } from "../../hooks/useCart";
import {
  useEnrollInFreeCourse,
  useUserEnrollments,
} from "../../hooks/useEnrollment";
import { useToast } from "../../components/UI/ToastProvider";
import { cartToasts, generalToasts } from "../../utils/toastUtils";
import { trackCourseView } from "../../services/course.service";
import InstructorInfo from "../../components/CourseDetails/InstructorInfo";
import CourseCurriculum from "../../components/CourseDetails/CourseCurriculum";
import CoursePreviewCard from "../../components/CourseDetails/CoursePreviewCard";
import CourseDetailsLoader from "../../components/CourseDetails/CourseDetailsLoader";
import CourseNotFound from "../../components/CourseDetails/CourseNotFound";
import CourseOverview from "../../components/CourseDetails/CourseOverview";
import VideoModal from "../../components/CourseDetails/VideoModal";
import HeroSection from "../../components/CourseDetails/HeroSection";
import ReviewsTab from "../../components/CourseDetails/ReviewsTab";

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
      <HeroSection course={course} />

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
                    <ReviewsTab course={course} courseId={courseId} />
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

export default CourseDetails;

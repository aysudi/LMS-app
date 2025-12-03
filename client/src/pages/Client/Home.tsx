import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { useAddToCart, useCartHelpers } from "../../hooks/useCart";
import { useAddToCartModal } from "../../hooks/useAddToCartModal";
import { useToast } from "../../components/UI/ToastProvider";
import { useCategories } from "../../hooks/useCategories";
import type { Course } from "../../types/course.type";
import { generalToasts } from "../../utils/toastUtils";
// @ts-ignore
import { useTranslation } from "react-i18next";

// Components
import Loading from "../../components/Common/Loading";
import HeroSection from "../../components/Home/HeroSection";
import CategoriesSection from "../../components/Home/CategoriesSection";
import RecommendedCoursesSection from "../../components/Home/RecommendedCoursesSection";
import FreeCoursesSection from "../../components/Home/FreeCoursesSection";
import TrendingCourseSection from "../../components/Home/TrendingCourseSection";
import CategoryCoursesSection from "../../components/Home/CategoryCoursesSection";
import AddToCartModal from "../../components/Client/Cart/AddToCartModal";

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

  // Data fetching hooks
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

  // Data processing
  const allCourses = allCoursesData?.data || [];
  const featuredCourses = featuredCoursesData?.data || [];
  const freeCourses = freeCoursesData?.data || [];
  const trendingCourse = trendingCoursesData?.data?.[0];
  const userCourses = userCoursesData?.data || [];

  // Custom hooks
  const categories = useCategories(allCourses);

  const {
    isModalOpen,
    addedCourse,
    recommendedCourses: modalRecommendedCourses,
    openModal,
    closeModal,
  } = useAddToCartModal(allCourses);

  // Utility functions
  const checkIfEnrolled = (courseId: string): boolean => {
    return userCourses.some((course: any) => course.id === courseId);
  };

  // Event handlers
  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === "all") {
      navigate("/courses");
    } else {
      navigate(`/courses?category=${encodeURIComponent(categoryId)}`);
    }
  };

  const handleCourseClick = (courseId: number | string) => {
    if (isAuthenticated) {
      addViewedCourse(courseId.toString());
    }
    navigate(`/course/${courseId}`);
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
      setTimeout(() => {
        setProcessingWishlist((prev) => {
          const newSet = new Set(prev);
          newSet.delete(course.id);
          return newSet;
        });
      }, 500);
    }
  };

  const handleCartToggle = async (e: React.MouseEvent, course: Course) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }

    setProcessingCart((prev) => new Set([...prev, course.id]));

    try {
      if (checkIfInCartLocal(course.id)) {
        showToast({
          title: t("home.toasts.alreadyInCart"),
          message: t("home.toasts.courseAlreadyInCart", {
            title: course.title,
          }),
          type: "info",
          duration: 3000,
        });
        return;
      }

      await addToCartMutation.mutateAsync(course.id);
      openModal(course);
    } catch (error: any) {
      console.error("Cart error:", error);
      showToast({
        title: t("home.toasts.failedToAdd"),
        message: error.message || t("home.toasts.failedToAddCourse"),
        type: "error",
        duration: 4000,
      });
    } finally {
      setTimeout(() => {
        setProcessingCart((prev) => {
          const newSet = new Set(prev);
          newSet.delete(course.id);
          return newSet;
        });
      }, 500);
    }
  };

  const handleAddAllToCart = async (courses: Course[]) => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }

    if (courses.length === 0) {
      showToast({
        title: t("home.toasts.noCoursesAvailable"),
        message: t("home.toasts.allCoursesInCart"),
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
          title: t("home.toasts.coursesAddedSuccess"),
          message: t("home.toasts.coursesAddedToCart", {
            count: successCount,
            courses:
              successCount > 1 ? t("common.courses") : t("common.course"),
          }),
          type: "success",
          duration: 3200,
        });
      }

      if (errorCount > 0) {
        showToast({
          title: t("home.toasts.partialSuccess"),
          message: t("home.toasts.someCoursesNotAdded", {
            count: errorCount,
            courses: errorCount > 1 ? t("common.courses") : t("common.course"),
          }),
          type: "warning",
          duration: 4000,
        });
      }

      closeModal();
    } catch (error) {
      showToast({
        title: t("home.toasts.operationFailed"),
        message: t("home.toasts.failedToAddCourses"),
        type: "error",
        duration: 4000,
      });
    }
  };

  // Loading state
  if (allCoursesLoading && featuredLoading && freeLoading && trendingLoading) {
    return <Loading variant="page" message="Loading courses..." />;
  }

  // Determine courses to display
  const displayRecommendedCourses =
    recommendations.recommended.length > 0
      ? recommendations.recommended
      : featuredCourses;

  const freeCoursesToShow =
    recommendations.free.length > 0 ? recommendations.free : freeCourses;

  const trendingCourseToShow = trendingCourse || featuredCourses[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
          {/* Categories */}
          <CategoriesSection
            categories={categories}
            onCategoryClick={handleCategoryClick}
          />

          {/* Personalized Sections for Authenticated Users */}
          {isAuthenticated && (
            <>
              {/* Recommended for You */}
              {(displayRecommendedCourses.length > 0 || featuredLoading) && (
                <RecommendedCoursesSection
                  courses={displayRecommendedCourses}
                  isLoading={featuredLoading}
                  onWishlistToggle={handleWishlistToggle}
                  onCartToggle={handleCartToggle}
                  checkIfInWishlist={checkIfInWishlist}
                  checkIfInCart={checkIfInCartLocal}
                  checkIfEnrolled={checkIfEnrolled}
                  processingWishlist={processingWishlist}
                  processingCart={processingCart}
                />
              )}

              {/* Free Courses */}
              {(freeCoursesToShow.length > 0 || freeLoading) && (
                <FreeCoursesSection
                  courses={freeCoursesToShow}
                  isLoading={freeLoading}
                  onWishlistToggle={handleWishlistToggle}
                  onCartToggle={handleCartToggle}
                  onCourseClick={handleCourseClick}
                  checkIfInWishlist={checkIfInWishlist}
                  checkIfInCart={checkIfInCartLocal}
                  processingWishlist={processingWishlist}
                  processingCart={processingCart}
                />
              )}
            </>
          )}

          {/* Trending Now - Available for all users */}
          {(trendingCourseToShow || trendingLoading) && (
            <TrendingCourseSection
              course={trendingCourseToShow}
              isLoading={trendingLoading}
              onWishlistToggle={handleWishlistToggle}
              onCartToggle={handleCartToggle}
              onCourseClick={handleCourseClick}
              onEnrollClick={handleEnroll}
              checkIfInWishlist={checkIfInWishlist}
              checkIfInCart={checkIfInCartLocal}
              processingWishlist={processingWishlist}
              processingCart={processingCart}
            />
          )}

          {/* Category Sections */}
          <CategoryCoursesSection
            allCourses={allCourses}
            recommendations={recommendations}
            onCategoryClick={handleCategoryClick}
            onWishlistToggle={handleWishlistToggle}
            onCartToggle={handleCartToggle}
            checkIfInWishlist={checkIfInWishlist}
            checkIfInCart={checkIfInCartLocal}
            checkIfEnrolled={checkIfEnrolled}
            processingWishlist={processingWishlist}
            processingCart={processingCart}
          />
        </div>
      </section>

      {/* Add to Cart Modal */}
      <AddToCartModal
        isOpen={isModalOpen}
        onClose={closeModal}
        addedCourse={addedCourse}
        recommendedCourses={modalRecommendedCourses}
        onAddAllToCart={handleAddAllToCart}
        checkIfInCart={checkIfInCartLocal}
      />
    </div>
  );
};

export default Home;

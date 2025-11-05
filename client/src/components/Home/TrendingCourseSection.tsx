import { motion } from "framer-motion";
import {
  FaFire,
  FaStar,
  FaUsers,
  FaHeart,
  FaShoppingCart,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { ANIMATION_CONFIG } from "../../constants/homePageConstants";
import type { Course } from "../../types/course.type";
import { HTMLRenderer } from "../../utils/htmlRenderer";
import Loading from "../Common/Loading";

interface TrendingCourseSectionProps {
  course: Course | null;
  isLoading: boolean;
  onWishlistToggle: (e: React.MouseEvent, course: Course) => void;
  onCartToggle: (e: React.MouseEvent, course: Course) => void;
  onCourseClick: (courseId: string | number) => void;
  onEnrollClick: () => void;
  checkIfInWishlist: (courseId: string) => boolean;
  checkIfInCart: (courseId: string) => boolean;
  processingWishlist: Set<string>;
  processingCart: Set<string>;
}

const TrendingCourseSection: React.FC<TrendingCourseSectionProps> = ({
  course,
  isLoading,
  onWishlistToggle,
  onCartToggle,
  onCourseClick,
  onEnrollClick,
  checkIfInWishlist,
  checkIfInCart,
  processingWishlist,
  processingCart,
}) => {
  const { t } = useTranslation();

  if (!course && !isLoading) {
    return null;
  }

  return (
    <motion.div
      initial={ANIMATION_CONFIG.trending.initial}
      animate={ANIMATION_CONFIG.trending.animate}
      transition={ANIMATION_CONFIG.trending.transition}
      className="mb-16 sm:mb-20 md:mb-24"
    >
      <div className="text-center mb-12 sm:mb-16 px-4">
        <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-full mb-4 sm:mb-6">
          <FaFire className="text-orange-500 mr-2 animate-pulse text-sm sm:text-base" />
          <span className="text-xs sm:text-sm font-semibold text-orange-600">
            {t("home.trending.hotTrending")}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
          {t("home.trending.thisWeeks")}{" "}
          <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            {t("home.trending.hottestCourse")}
          </span>
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {t("home.trending.joinThousands")}
        </p>
      </div>

      {isLoading ? (
        <div className="max-w-6xl mx-auto">
          <Loading
            variant="card"
            size="lg"
            message="Loading trending course..."
          />
        </div>
      ) : course ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="relative max-w-6xl mx-auto"
          whileHover={{ scale: 1.02 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl sm:rounded-3xl opacity-20 blur-2xl transform scale-105"></div>
          <div
            className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-orange-100 overflow-hidden group cursor-pointer backdrop-blur-sm mx-4 sm:mx-0"
            onClick={() => onCourseClick(course.id)}
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
            <div className="absolute top-4 sm:top-6 md:top-8 left-4 sm:left-6 md:left-8 z-10">
              <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm">
                <FaFire className="animate-pulse text-sm sm:text-base md:text-lg" />
                <span className="font-bold text-xs sm:text-sm tracking-wide">
                  {t("home.trending.trendingBadge")}
                </span>
                <div className="absolute -top-1 -right-1 w-2 sm:w-3 h-2 sm:h-3 bg-yellow-400 rounded-full animate-ping"></div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-0">
              {/* Course Image */}
              <div className="relative overflow-hidden md:order-2">
                <img
                  src={
                    course.image.url ||
                    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop"
                  }
                  alt={course.title}
                  className="w-full h-48 sm:h-64 md:h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Action Buttons */}
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex space-x-1 sm:space-x-2 z-10">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => onWishlistToggle(e, course)}
                    disabled={processingWishlist.has(course.id)}
                    className={`p-2 sm:p-3 bg-white/90 rounded-full custom-icon-shadow transition-all duration-200 cursor-pointer ${
                      processingWishlist.has(course.id)
                        ? "text-purple-500 opacity-70"
                        : checkIfInWishlist(course.id)
                        ? "text-red-500 hover:bg-red-50"
                        : "text-gray-500 hover:bg-gray-50 hover:text-red-500"
                    }`}
                    title={
                      processingWishlist.has(course.id)
                        ? t("common.processing")
                        : checkIfInWishlist(course.id)
                        ? t("common.removeFromWishlist")
                        : t("common.addToWishlist")
                    }
                    animate={
                      processingWishlist.has(course.id)
                        ? { scale: [1, 1.1, 1] }
                        : {}
                    }
                    transition={
                      processingWishlist.has(course.id)
                        ? {
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }
                        : {}
                    }
                  >
                    <FaHeart
                      className={`text-lg sm:text-xl ${
                        checkIfInWishlist(course.id) ? "fill-current" : ""
                      }`}
                    />
                  </motion.button>

                  {!course.isFree && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => onCartToggle(e, course)}
                      disabled={processingCart.has(course.id)}
                      className={`p-2 sm:p-3 bg-white/90 rounded-full custom-icon-shadow transition-all duration-200 ${
                        processingCart.has(course.id)
                          ? "text-orange-500 opacity-70 cursor-pointer"
                          : checkIfInCart(course.id)
                          ? "text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer"
                          : "text-green-600 hover:bg-green-50 cursor-pointer"
                      }`}
                      title={
                        processingCart.has(course.id)
                          ? t("common.addingToCart")
                          : checkIfInCart(course.id)
                          ? t("common.alreadyInCart")
                          : t("common.addToCart")
                      }
                      animate={
                        processingCart.has(course.id)
                          ? { scale: [1, 1.1, 1] }
                          : {}
                      }
                      transition={
                        processingCart.has(course.id)
                          ? {
                              duration: 0.8,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }
                          : {}
                      }
                    >
                      <FaShoppingCart className="text-lg sm:text-xl" />
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
                    {course.category}
                  </span>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors">
                  {course.title}
                </h3>

                <div className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg leading-relaxed">
                  <HTMLRenderer
                    content={course.description}
                    className="text-gray-600"
                    maxLength={200}
                  />
                </div>

                <div className="text-sm sm:text-base md:text-lg text-gray-700 mb-4 sm:mb-6">
                  {t("course.by")}{" "}
                  <span className="font-semibold text-gray-900">
                    {course.instructor?.firstName} {course.instructor?.lastName}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-6 sm:mb-8">
                  <div className="flex items-center gap-2">
                    <FaStar className="text-yellow-400 text-sm sm:text-base md:text-lg" />
                    <span className="font-bold text-sm sm:text-base md:text-lg">
                      {course.rating || 0}
                    </span>
                    <span className="text-gray-500 text-xs sm:text-sm">
                      ({course.ratingsCount || 0} {t("course.reviews")})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaUsers className="text-indigo-500 text-sm sm:text-base" />
                    <span className="font-semibold text-sm sm:text-base">
                      {Number(course.enrollmentCount || 0).toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-xs sm:text-sm">
                      {t("course.students")}
                    </span>
                  </div>
                </div>

                {/* Price and CTA */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                      {course.isFree || course.originalPrice === 0
                        ? t("course.free")
                        : `$${course.discountPrice || course.originalPrice}`}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      onEnrollClick();
                      e.stopPropagation();
                    }}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer text-sm sm:text-base"
                  >
                    {t("course.enrollNow")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </motion.div>
  );
};

export default TrendingCourseSection;

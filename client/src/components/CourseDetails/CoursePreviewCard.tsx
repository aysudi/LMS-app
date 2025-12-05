import { motion } from "framer-motion";
import type { Course } from "../../types/course.type";
import { useTranslation } from "react-i18next";
import { getImageUrl } from "../../utils/mediaHelpers";
import {
  FaAward,
  FaBook,
  FaDownload,
  FaHeart,
  FaInfinity,
  FaMobile,
  FaPlay,
  FaRegHeart,
  FaShare,
  FaShoppingCart,
  FaTv,
} from "react-icons/fa";

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
  handleFreeEnrollment: () => void;
  addToCartMutation: any;
  enrollInFreeCourseMutation: any;
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
  handleFreeEnrollment,
  addToCartMutation,
  enrollInFreeCourseMutation,
  navigate,
}) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden max-w-sm xl:max-w-none mx-auto xl:mx-0">
      {/* Video Preview */}
      <div className="relative aspect-video bg-gray-100">
        {course.image ? (
          <img
            src={getImageUrl(course.image)}
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
        {course.videoPromo && course.videoPromo.url.length > 0 && (
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
            {t("courseDetails.previewThisCourse")}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Price Section */}
        <div className="mb-4 sm:mb-6">
          {course.isFree ? (
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              {t("courseDetails.free")}
            </div>
          ) : (
            <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                ${course.currentPrice || course.originalPrice}
              </span>
              {calculateDiscountPercentage() > 0 && (
                <>
                  <span className="text-base sm:text-lg text-gray-500 line-through">
                    ${course.originalPrice}
                  </span>
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs sm:text-sm font-medium rounded">
                    {calculateDiscountPercentage()}% {t("courseDetails.off")}
                  </span>
                </>
              )}
            </div>
          )}

          {!course.isFree && calculateDiscountPercentage() > 0 && (
            <p className="text-red-600 text-sm font-medium mt-2">
              🔥 {t("courseDetails.daysLeftAtThisPrice")}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-4 sm:mb-6">
          {isEnrolled ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/course/${course.id}/learn`);
              }}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-center rounded-lg transition-colors duration-200 cursor-pointer flex items-center justify-center space-x-2"
            >
              <FaPlay />
              <span>{t("courseDetails.continueLearning")}</span>
            </button>
          ) : course.isFree ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFreeEnrollment();
              }}
              disabled={enrollInFreeCourseMutation.isPending}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-center rounded-lg transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {enrollInFreeCourseMutation.isPending ? (
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
                  <span>{t("courseDetails.enrolling")}</span>
                </>
              ) : (
                <>
                  <FaPlay />
                  <span>{t("courseDetails.enrollForFree")}</span>
                </>
              )}
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
              <span>{t("courseDetails.goToCart")}</span>
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
                  <span>{t("courseDetails.adding")}</span>
                </>
              ) : (
                <>
                  <FaShoppingCart />
                  <span>{t("courseDetails.addToCart")}</span>
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
              {t("courseDetails.buyNow")}
            </button>
          )}
        </div>

        {/* Money-back guarantee */}
        <div className="text-center text-sm text-gray-600 mb-6">
          {t("courseDetails.moneyBackGuarantee")}
        </div>

        {/* Course Includes */}
        <div className="space-y-3 mb-6">
          <h4 className="font-semibold text-gray-900">
            {t("courseDetails.thisCourseIncludes")}
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <FaTv className="text-gray-500 flex-shrink-0" />
              <span>
                {formatDuration(course.totalDuration)}{" "}
                {t("courseDetails.onDemandVideo")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <FaDownload className="text-gray-500 flex-shrink-0" />
              <span>{t("courseDetails.downloadableResources")}</span>
            </div>
            <div className="flex items-center gap-3">
              <FaInfinity className="text-gray-500 flex-shrink-0" />
              <span>{t("courseDetails.fullLifetimeAccess")}</span>
            </div>
            <div className="flex items-center gap-3">
              <FaMobile className="text-gray-500 flex-shrink-0" />
              <span>{t("courseDetails.accessOnMobileAndTV")}</span>
            </div>
            {course.certificateProvided && (
              <div className="flex items-center gap-3">
                <FaAward className="text-gray-500 flex-shrink-0" />
                <span>{t("courseDetails.certificateOfCompletion")}</span>
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
            onClick={async () => {
              const shareData = {
                title: course.title,
                text:
                  course.shortDescription ||
                  course.description.substring(0, 100) + "...",
                url: window.location.href,
              };

              // Try Web Share API first
              if (navigator.share) {
                try {
                  await navigator.share(shareData);
                  return;
                } catch (err) {
                  // User cancelled or error occurred, fall back to clipboard
                }
              }

              // Fallback to clipboard
              try {
                await navigator.clipboard.writeText(window.location.href);
                // You might want to show a toast notification here
                console.log("Link copied to clipboard!");
              } catch (err) {
                // Fallback for older browsers
                const textArea = document.createElement("textarea");
                textArea.value = window.location.href;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand("copy");
                document.body.removeChild(textArea);
                console.log("Link copied to clipboard!");
              }
            }}
          >
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ duration: 0.2 }}
            >
              <FaShare className="group-hover:text-purple-500 transition-colors" />
            </motion.div>
            <span className="text-sm">{t("courseDetails.shareCourse")}</span>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              {"share" in navigator
                ? t("courseDetails.shareOrCopy")
                : t("courseDetails.copyLink")}
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default CoursePreviewCard;

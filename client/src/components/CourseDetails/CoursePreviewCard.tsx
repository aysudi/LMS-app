import React from "react";
import { motion } from "framer-motion";
import {
  FaPlay,
  FaBook,
  FaHeart,
  FaRegHeart,
  FaShare,
  FaTv,
  FaDownload,
  FaInfinity,
  FaMobile,
  FaAward,
  FaShoppingCart,
} from "react-icons/fa";
import { getImageUrl } from "../../utils/mediaHelpers";
import type { Course } from "../../types/course.type";

interface CoursePreviewCardProps {
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
}

const CoursePreviewCard: React.FC<CoursePreviewCardProps> = ({
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
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
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
                navigate(`/course/${course.id}/learn`);
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
                  <span>Enrolling...</span>
                </>
              ) : (
                <>
                  <FaPlay />
                  <span>Enroll for Free</span>
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

export default CoursePreviewCard;

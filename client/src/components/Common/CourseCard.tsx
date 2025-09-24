import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaStar,
  FaUsers,
  FaArrowRight,
  FaHeart,
  FaShoppingCart,
} from "react-icons/fa";
import { useAuthContext } from "../../context/AuthContext";
import { usePersonalization } from "../../hooks/usePersonalization";
import { useToggleWishlist, useWishlistHelpers } from "../../hooks/useWishlist";
import { useSnackbar } from "notistack";
import type { Course } from "../../types/course.type";

interface CourseCardProps {
  course: Course;
  index: number;
  showWishlistButton?: boolean;
  showRemoveButton?: boolean;
  onRemoveFromWishlist?: (courseId: string, courseTitle: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  index,
  showWishlistButton = true,
  showRemoveButton = false,
  onRemoveFromWishlist,
}) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthenticated } = useAuthContext();
  const { addViewedCourse } = usePersonalization();
  const { toggleWishlist, isLoading: isToggling } = useToggleWishlist();
  const { checkIfInWishlist } = useWishlistHelpers();

  const handleCourseClick = (courseId: string | number) => {
    if (isAuthenticated) {
      addViewedCourse(courseId.toString());
    }
    navigate(`/course/${courseId}`);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }

    try {
      const wasInWishlist = checkIfInWishlist(course.id);
      await toggleWishlist(course.id, wasInWishlist);

      enqueueSnackbar(
        wasInWishlist
          ? `"${course.title}" removed from wishlist`
          : `"${course.title}" added to wishlist`,
        { variant: "success", autoHideDuration: 3000 }
      );
    } catch (error) {
      enqueueSnackbar("Failed to update wishlist", {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemoveFromWishlist) {
      onRemoveFromWishlist(course.id, course.title);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(
      `${window.location.origin}/course/${course.id}`
    );
    enqueueSnackbar("Course link copied!", { variant: "success" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.25, 0, 1],
      }}
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1 cursor-pointer"
      onClick={() => handleCourseClick(course.id)}
    >
      {/* Image Container with Enhanced Overlay */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={
            course.image ||
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop"
          }
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Course Level Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold rounded-full shadow-lg">
            {course.level}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex space-x-2">
          {showRemoveButton ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRemove}
              className="p-2 bg-white/90 hover:bg-red-50 text-red-500 rounded-full shadow-sm transition-all duration-200 cursor-pointer"
              title="Remove from wishlist"
            >
              <FaHeart className="text-md" />
            </motion.button>
          ) : showWishlistButton ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleWishlistToggle}
              disabled={isToggling}
              className={`p-2 bg-white/90 rounded-full shadow-sm transition-all duration-200 cursor-pointer ${
                checkIfInWishlist(course.id)
                  ? "text-red-500 hover:bg-red-50"
                  : "text-gray-500 hover:bg-gray-50 hover:text-red-500"
              }`}
              title={
                checkIfInWishlist(course.id)
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
            >
              <FaHeart
                className={`text-md ${
                  checkIfInWishlist(course.id) ? "fill-current" : ""
                }`}
              />
            </motion.button>
          ) : null}

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="p-2 bg-white/90 hover:bg-green-50 text-green-600 rounded-full shadow-sm transition-all duration-200 cursor-pointer"
            title="Add to cart"
          >
            <FaShoppingCart className="text-md" />
          </motion.button>
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-3 right-3">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-full shadow-lg">
            <span className="text-sm font-bold">
              {course.isFree || course.originalPrice === 0
                ? "FREE"
                : `$${course.discountPrice || course.originalPrice}`}
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Category Tag */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100">
            {course.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300">
          {course.title}
        </h3>

        {/* Instructor */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {course.instructor?.firstName?.charAt(0) || "I"}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {course.instructor?.firstName
              ? `${course.instructor.firstName} ${course.instructor.lastName}`
              : "Expert Instructor"}
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <FaStar className="text-yellow-400" />
              <span className="font-semibold text-gray-700">
                {course.rating || 0}
              </span>
              <span className="text-gray-500 text-xs">
                ({course.ratingsCount || 0})
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <FaUsers className="text-indigo-500" />
              <span className="text-gray-600 text-xs">
                {Number(course.enrollmentCount || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          <button
            onClick={() => {
              navigate(`/course/${course.id}`);
            }}
            className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span className="text-sm">Enroll Now</span>
            <FaArrowRight className="text-sm" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaStar, FaUsers } from "react-icons/fa";
import type { Course } from "../../types/course.type";
import { useCardHover } from "../../hooks/useCardHover";
import { getImageUrl } from "../../utils/mediaHelpers";
import HoverPanel from "../Common/HoverPanel";
import CourseFeatures from "../Common/CourseFeatures";
import ActionButtons from "../Common/ActionButtons";

interface ModernCourseCardProps {
  course: Course;
  index: number;
  onWishlistToggle?: (e: React.MouseEvent, course: Course) => void;
  onCartToggle?: (e: React.MouseEvent, course: Course) => void;
  checkIfInWishlist?: (courseId: string) => boolean;
  checkIfInCart?: (courseId: string) => boolean;
  checkIfEnrolled?: (courseId: string) => boolean;
  processingWishlist?: Set<string>;
  processingCart?: Set<string>;
  showCartButton?: boolean;
}

const ModernCourseCard: React.FC<ModernCourseCardProps> = ({
  course,
  index,
  onWishlistToggle,
  onCartToggle,
  checkIfInWishlist = () => false,
  checkIfInCart = () => false,
  checkIfEnrolled = () => false,
  processingWishlist = new Set(),
  processingCart = new Set(),
  showCartButton = true,
}) => {
  const navigate = useNavigate();
  const { isHovered, showOnLeft, cardRef, handleMouseEnter, handleMouseLeave } =
    useCardHover();

  const handleCourseClick = () => {
    navigate(`/course/${course.id}`);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.25, 0, 1],
      }}
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Card */}
      <motion.div
        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1 cursor-pointer"
        onClick={handleCourseClick}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={
              getImageUrl(course.image) ||
              "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop"
            }
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

          {/* Course Level Badge */}
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold rounded-full custom-icon-shadow capitalize">
              {course.level || "Beginner"}
            </span>
          </div>

          {/* Price Badge */}
          <div className="absolute bottom-3 right-3">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-1 rounded-full shadow-lg">
              <span className="text-md font-bold">
                {course.isFree || course.originalPrice === 0
                  ? "FREE"
                  : `$${course.discountPrice || course.originalPrice}`}
              </span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-1 group-hover:text-indigo-600 transition-colors duration-300">
            {course.title}
          </h3>

          {/* Instructor */}
          <p className="text-sm text-gray-600">
            {course.instructor?.firstName
              ? `${course.instructor.firstName} ${course.instructor.lastName}`
              : "Expert Instructor"}
          </p>

          {/* Stats Row */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <FaStar className="text-yellow-400 text-xs" />
              <span className="font-semibold text-gray-700">
                {course.rating || 4.5}
              </span>
              <span className="text-gray-500 text-xs">
                ({Number(course.ratingsCount || 0).toLocaleString()})
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <FaUsers className="text-gray-400 text-xs" />
              <span className="text-gray-600 text-xs">
                {Number(course.enrollmentCount || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Category */}
          <div>
            <span className="inline-flex items-center px-4 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-xl mt-1">
              {course.category}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Hover Details Panel */}
      <HoverPanel course={course} isVisible={isHovered} showOnLeft={showOnLeft}>
        <CourseFeatures course={course} />
        <ActionButtons
          course={course}
          onWishlistToggle={onWishlistToggle}
          onCartToggle={onCartToggle}
          checkIfInWishlist={checkIfInWishlist}
          checkIfInCart={checkIfInCart}
          checkIfEnrolled={checkIfEnrolled}
          processingWishlist={processingWishlist}
          processingCart={processingCart}
          showCartButton={showCartButton}
        />
      </HoverPanel>
    </motion.div>
  );
};

export default ModernCourseCard;

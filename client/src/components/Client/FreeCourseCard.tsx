import { motion } from "framer-motion";
import { FaStar, FaShoppingCart } from "react-icons/fa";
import type { Course } from "../../types/course.type";
import { useCardHover } from "../../hooks/useCardHover";
import { getImageUrl } from "../../utils/mediaHelpers";
import HoverPanel from "../Common/HoverPanel";
import CourseFeatures from "../Common/CourseFeatures";
import FreeCourseActionButtons from "../Common/FreeCourseActionButtons";

interface FreeCourseCardProps {
  course: Course;
  index: number;
  onWishlistToggle: (e: React.MouseEvent, course: Course) => void;
  onCartToggle?: (e: React.MouseEvent, course: Course) => void;
  checkIfInWishlist: (courseId: string) => boolean;
  checkIfInCart?: (courseId: string) => boolean;
  processingWishlist: Set<string>;
  processingCart?: Set<string>;
  onClick: () => void;
}

const FreeCourseCard: React.FC<FreeCourseCardProps> = ({
  course,
  index,
  onWishlistToggle,
  onCartToggle,
  checkIfInWishlist,
  checkIfInCart,
  processingWishlist,
  processingCart,
  onClick,
}) => {
  const { isHovered, showOnLeft, cardRef, handleMouseEnter, handleMouseLeave } =
    useCardHover();

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Card */}
      <motion.div
        className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md border border-green-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative">
          <img
            src={
              getImageUrl(course.image) ||
              "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop"
            }
            alt={course.title}
            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
              FREE
            </span>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-2 right-2 flex space-x-2">
            {!course.isFree &&
              onCartToggle &&
              checkIfInCart &&
              processingCart && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCartToggle(e, course);
                  }}
                  disabled={processingCart.has(course.id)}
                  className={`p-3 bg-white/90 rounded-full custom-icon-shadow transition-all duration-200 ${
                    processingCart.has(course.id)
                      ? "text-orange-500 opacity-70 cursor-pointer"
                      : checkIfInCart(course.id)
                      ? "text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer"
                      : "text-green-600 hover:bg-green-50 cursor-pointer"
                  }`}
                  title={
                    processingCart.has(course.id)
                      ? "Adding to cart..."
                      : checkIfInCart(course.id)
                      ? "Already in cart"
                      : "Add to cart"
                  }
                  animate={
                    processingCart.has(course.id) ? { scale: [1, 1.1, 1] } : {}
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
                  <FaShoppingCart className="text-lg" />
                </motion.button>
              )}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            by {course.instructor?.firstName} {course.instructor?.lastName}
          </p>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <FaStar className="text-yellow-400 text-sm" />
              <span className="text-sm font-medium">{course.rating}</span>
            </div>
            <span className="text-gray-300">•</span>
            <span className="text-sm text-gray-600">
              {course.enrollmentCount} students
            </span>
          </div>
        </div>
      </motion.div>

      {/* Hover Details Panel */}
      <HoverPanel course={course} isVisible={isHovered} showOnLeft={showOnLeft}>
        <CourseFeatures course={course} />
        <FreeCourseActionButtons
          course={course}
          onWishlistToggle={onWishlistToggle}
          checkIfInWishlist={checkIfInWishlist}
          processingWishlist={processingWishlist}
        />
      </HoverPanel>
    </motion.div>
  );
};

export default FreeCourseCard;

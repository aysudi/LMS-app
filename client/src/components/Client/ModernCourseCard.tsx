import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaStar,
  FaUsers,
  FaClock,
  FaHeart,
  FaShoppingCart,
  FaPlayCircle,
  FaCheck,
  FaMobile,
  FaCheckCircle,
} from "react-icons/fa";
import type { Course } from "../../types/course.type";

interface ModernCourseCardProps {
  course: Course;
  index: number;
  onWishlistToggle?: (e: React.MouseEvent, course: Course) => void;
  onCartToggle?: (e: React.MouseEvent, course: Course) => void;
  checkIfInWishlist?: (courseId: string) => boolean;
  checkIfInCart?: (courseId: string) => boolean;
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
  processingWishlist = new Set(),
  processingCart = new Set(),
  showCartButton = true,
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showOnLeft, setShowOnLeft] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    const timeout = setTimeout(() => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        const panelWidth = 320; // 80 * 4 = 320px (w-80)

        if (rect.right + panelWidth > screenWidth - 20) {
          setShowOnLeft(true);
        } else {
          setShowOnLeft(false);
        }
      }
      setIsHovered(true);
    }, 200); // 200ms delay before showing hover panel
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsHovered(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const handleCourseClick = () => {
    navigate(`/course/${course.id}`);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const courseFeatures = [
    {
      icon: FaClock,
      text: `${formatDuration(course.totalDuration / 60 || 120)} total`,
    },
    { icon: FaPlayCircle, text: `${course.totalLessons || 15} lectures` },
    { icon: FaCheckCircle, text: "Lifetime access" },
    { icon: FaMobile, text: "Mobile & TV access" },
  ];

  const whatYoullLearn =
    course.description || "Master the fundamentals and advanced concepts";

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
              course.image ||
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
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{
              opacity: 0,
              x: showOnLeft ? 10 : -10,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              x: showOnLeft ? 10 : -10,
              scale: 0.95,
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute -top-2 w-85 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden ${
              showOnLeft ? "right-full mr-2" : "left-full ml-2"
            }`}
            style={{
              maxHeight: "590px",
              minHeight: "420px",
            }}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <h4 className="font-bold text-gray-900 text-lg mb-2 leading-tight">
                {course.title}
              </h4>
              <div className="flex items-center space-x-2 ">
                <div className="flex items-center space-x-1">
                  <FaStar className="text-yellow-400 text-sm" />
                  <span className="font-semibold text-gray-700">
                    {course.rating || 4.5}
                  </span>
                  <span className="text-gray-500 text-sm">
                    ({Number(course.ratingsCount || 0).toLocaleString()}{" "}
                    ratings)
                  </span>
                </div>
              </div>
            </div>

            {/* What You'll Learn */}
            <div className="p-4 border-b border-gray-100">
              <h5 className="font-semibold text-gray-900 mb-2">
                What you'll learn
              </h5>
              <p className="text-sm text-gray-600 line-clamp-3">
                {whatYoullLearn}
              </p>
            </div>

            {/* Course Features */}
            <div className="p-4 border-b border-gray-100">
              <h5 className="font-semibold text-gray-900 mb-3">
                This course includes:
              </h5>
              <div className="space-y-2">
                {courseFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <feature.icon className="text-gray-400 text-sm flex-shrink-0" />
                    <span className="text-sm text-gray-600">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructor */}
            {/* <div className="p-4 border-b border-gray-100">
              <h5 className="font-semibold text-gray-900 mb-2">Instructor</h5>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {course.instructor?.firstName?.charAt(0) || "I"}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {course.instructor?.firstName
                      ? `${course.instructor.firstName} ${course.instructor.lastName}`
                      : "Expert Instructor"}
                  </p>
                  <p className="text-sm text-gray-600">Professional Educator</p>
                </div>
              </div>
            </div> */}

            {/* Action Buttons */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between mb-3">
                <div className="text-2xl font-bold text-gray-900">
                  {course.isFree || course.originalPrice === 0
                    ? "Free"
                    : `$${course.discountPrice || course.originalPrice}`}
                </div>
              </div>

              {/* Buttons Row */}
              <div className="flex space-x-3">
                {/* Cart Button */}
                {showCartButton && !course.isFree && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (checkIfInCart(course.id)) {
                        navigate("/cart");
                      } else {
                        onCartToggle?.(e, course);
                      }
                    }}
                    disabled={processingCart.has(course.id)}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer ${
                      processingCart.has(course.id)
                        ? "bg-orange-100 text-orange-600 cursor-not-allowed"
                        : checkIfInCart(course.id)
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    {processingCart.has(course.id) ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full"
                        />
                        <span>Adding...</span>
                      </>
                    ) : checkIfInCart(course.id) ? (
                      <>
                        <FaCheck className="text-sm" />
                        <span>Go to cart</span>
                      </>
                    ) : (
                      <>
                        <FaShoppingCart className="text-sm" />
                        <span>Add to cart</span>
                      </>
                    )}
                  </motion.button>
                )}

                {/* Wishlist Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onWishlistToggle?.(e, course);
                  }}
                  disabled={processingWishlist.has(course.id)}
                  className={`${
                    showCartButton && !course.isFree ? "w-12" : "flex-1"
                  } py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 border cursor-pointer ${
                    processingWishlist.has(course.id)
                      ? "border-purple-200 text-purple-500 opacity-70 cursor-not-allowed"
                      : checkIfInWishlist(course.id)
                      ? "border-red-300 text-red-600 bg-red-50 hover:bg-red-100"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-red-300 hover:text-red-600"
                  }`}
                  title={
                    processingWishlist.has(course.id)
                      ? "Processing..."
                      : checkIfInWishlist(course.id)
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                >
                  {processingWishlist.has(course.id) ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"
                      />
                      {(!showCartButton || course.isFree) && (
                        <span>Processing...</span>
                      )}
                    </>
                  ) : (
                    <>
                      <FaHeart
                        className={`text-sm ${
                          checkIfInWishlist(course.id) ? "fill-current" : ""
                        }`}
                      />
                      {(!showCartButton || course.isFree) && (
                        <span>
                          {checkIfInWishlist(course.id)
                            ? "Remove from wishlist"
                            : "Add to wishlist"}
                        </span>
                      )}
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ModernCourseCard;

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaShoppingCart, FaCheck } from "react-icons/fa";
import type { Course } from "../../types/course.type";

interface ActionButtonsProps {
  course: Course;
  onWishlistToggle?: (e: React.MouseEvent, course: Course) => void;
  onCartToggle?: (e: React.MouseEvent, course: Course) => void;
  checkIfInWishlist?: (courseId: string) => boolean;
  checkIfInCart?: (courseId: string) => boolean;
  processingWishlist?: Set<string>;
  processingCart?: Set<string>;
  showCartButton?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  course,
  onWishlistToggle,
  onCartToggle,
  checkIfInWishlist = () => false,
  checkIfInCart = () => false,
  processingWishlist = new Set(),
  processingCart = new Set(),
  showCartButton = true,
}) => {
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-3">
        <div className="text-2xl font-bold text-gray-900">
          {course.isFree || course.originalPrice === 0
            ? course.isFree
              ? "Free"
              : "Free"
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
              {(!showCartButton || course.isFree) && <span>Processing...</span>}
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
  );
};

export default ActionButtons;

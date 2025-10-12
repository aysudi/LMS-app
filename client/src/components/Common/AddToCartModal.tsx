import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaStar, FaShoppingCart, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import type { Course } from "../../types/course.type";

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  addedCourse: Course | null;
  recommendedCourses: Course[];
  onAddAllToCart: (courses: Course[]) => void;
  checkIfInCart: (courseId: string) => boolean;
}

const AddToCartModal: React.FC<AddToCartModalProps> = ({
  isOpen,
  onClose,
  addedCourse,
  recommendedCourses,
  onAddAllToCart,
  checkIfInCart,
}) => {
  const navigate = useNavigate();

  if (!addedCourse) return null;

  const handleGoToCart = () => {
    onClose();
    navigate("/cart");
  };

  const handleContinueShopping = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FaShoppingCart className="text-green-600 text-lg" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Added to Cart!
                    </h2>
                    <p className="text-sm text-gray-600">
                      Course successfully added to your cart
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>

              <div className="p-6">
                {/* Added Course */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={
                        (addedCourse.image as any)?.url ||
                        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=120&h=80&fit=crop"
                      }
                      alt={addedCourse.title}
                      className="w-16 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">
                        {addedCourse.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                        by{" "}
                        {addedCourse.instructor?.firstName
                          ? `${addedCourse.instructor.firstName} ${addedCourse.instructor.lastName}`
                          : "Expert Instructor"}
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <FaStar className="text-yellow-400 text-sm" />
                          <span className="text-sm font-medium text-gray-700">
                            {addedCourse.rating || 4.5}
                          </span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-600">
                          {addedCourse.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-gray-900">
                        $
                        {addedCourse.discountPrice || addedCourse.originalPrice}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommended Courses */}
                {recommendedCourses.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Students who bought this course also bought
                    </h3>
                    <div className="space-y-3">
                      {recommendedCourses.slice(0, 3).map((course) => (
                        <div
                          key={course.id}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-purple-200 hover:bg-purple-50 transition-all duration-200"
                        >
                          <div className="flex items-start space-x-3">
                            <img
                              src={
                                (course.image as any)?.url ||
                                "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=120&h=80&fit=crop"
                              }
                              alt={course.title}
                              className="w-16 h-12 object-cover rounded-md flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-sm line-clamp-1 mb-1">
                                {course.title}
                              </h4>
                              <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                                by{" "}
                                {course.instructor?.firstName
                                  ? `${course.instructor.firstName} ${course.instructor.lastName}`
                                  : "Expert Instructor"}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1">
                                  <FaStar className="text-yellow-400 text-xs" />
                                  <span className="text-xs font-medium text-gray-700">
                                    {course.rating || 4.5}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    ({course.ratingsCount || 0})
                                  </span>
                                </div>
                                <span className="text-sm font-bold text-gray-900">
                                  {course.isFree
                                    ? "Free"
                                    : `$${
                                        course.discountPrice ||
                                        course.originalPrice
                                      }`}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add All to Cart Button */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() =>
                          onAddAllToCart(
                            recommendedCourses.filter(
                              (course) =>
                                !course.isFree && !checkIfInCart(course.id)
                            )
                          )
                        }
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <FaShoppingCart className="text-sm" />
                        <span>Add All to Cart</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleGoToCart}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <FaShoppingCart className="text-sm" />
                    <span>Go to Cart</span>
                  </button>
                  <button
                    onClick={handleContinueShopping}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <FaArrowRight className="text-sm" />
                    <span>Continue Shopping</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddToCartModal;

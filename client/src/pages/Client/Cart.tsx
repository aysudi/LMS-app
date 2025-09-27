import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaTrash,
  FaShoppingCart,
  FaArrowLeft,
  FaCreditCard,
  FaTag,
  FaClock,
  FaStar,
  FaUsers,
  FaHeart,
  FaGift,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useSnackbar } from "notistack";
import {
  useCartHelpers,
  useRemoveFromCart,
  useClearCart,
} from "../../hooks/useCart";
import { useToggleWishlist, useWishlistHelpers } from "../../hooks/useWishlist";
import { useAuthContext } from "../../context/AuthContext";
import EmptyCartAnimation from "../../components/Client/EmptyCartAnimation";
import CartLoadingAnimation from "../../components/Client/CartLoadingAnimation";
import CartStats from "../../components/Client/CartStats";
import type { Course } from "../../types/course.type";

const Cart = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthenticated } = useAuthContext();

  const { cartItems, cartCount, isLoadingCart, cartError } = useCartHelpers();

  const { mutateAsync: removeFromCart, isPending: isRemoving } =
    useRemoveFromCart();
  const { mutateAsync: clearCart, isPending: isClearing } = useClearCart();

  const { toggleWishlist } = useToggleWishlist();
  const { checkIfInWishlist } = useWishlistHelpers();

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/login");
    }
  }, [isAuthenticated, navigate]);

  const selectedItemsArray = cartItems.filter((item) =>
    selectedItems.has(item.id)
  );
  const subtotal = selectedItemsArray.reduce(
    (sum, item) => sum + (item.discountPrice || item.originalPrice),
    0
  );
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;

  const handleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map((item) => item.id)));
    }
  };

  const handleSelectItem = (courseId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId);
    } else {
      newSelected.add(courseId);
    }
    setSelectedItems(newSelected);
  };

  const handleRemoveItem = async (courseId: string, courseTitle: string) => {
    try {
      await removeFromCart(courseId);
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
      enqueueSnackbar(`"${courseTitle}" removed from cart! 🗑️`, {
        variant: "success",
        autoHideDuration: 3000,
      });
    } catch (error) {
      enqueueSnackbar("Failed to remove item from cart", {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      setSelectedItems(new Set());
      enqueueSnackbar("Cart cleared successfully! 🧹", {
        variant: "success",
        autoHideDuration: 3000,
      });
    } catch (error) {
      enqueueSnackbar("Failed to clear cart", {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  };

  const handleMoveToWishlist = async (
    courseId: string,
    courseTitle: string
  ) => {
    try {
      await Promise.all([
        toggleWishlist(courseId, false),
        removeFromCart(courseId),
      ]);
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
      enqueueSnackbar(`"${courseTitle}" moved to wishlist! ❤️`, {
        variant: "success",
        autoHideDuration: 3000,
      });
    } catch (error) {
      enqueueSnackbar("Failed to move item to wishlist", {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  };

  const handleApplyPromo = () => {
    // Simple promo code logic - you can enhance this
    const promoCodes: Record<string, number> = {
      SAVE10: 10,
      WELCOME20: 20,
      STUDENT15: 15,
    };

    const discountPercent = promoCodes[promoCode.toUpperCase()];
    if (discountPercent) {
      setDiscount(discountPercent);
      enqueueSnackbar(`Promo code applied! ${discountPercent}% discount 🎉`, {
        variant: "success",
        autoHideDuration: 3000,
      });
    } else {
      enqueueSnackbar("Invalid promo code", {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  };

  const handleCheckout = () => {
    if (selectedItems.size === 0) {
      enqueueSnackbar("Please select items to checkout", {
        variant: "warning",
        autoHideDuration: 3000,
      });
      return;
    }
    navigate("/checkout", {
      state: { selectedItems: Array.from(selectedItems) },
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoadingCart) {
    return <CartLoadingAnimation />;
  }

  if (cartError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <FaExclamationTriangle className="text-6xl text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              We couldn't load your cart. Please try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaArrowLeft className="text-lg" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
                  <FaShoppingCart className="text-blue-600" />
                  <span>Shopping Cart</span>
                </h1>
                <p className="text-gray-600 mt-1">
                  {cartCount} {cartCount === 1 ? "course" : "courses"} in your
                  cart
                </p>
              </div>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={handleClearCart}
                disabled={isClearing}
                className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                <FaTrash className="text-sm" />
                <span>Clear Cart</span>
              </button>
            )}
          </div>
        </motion.div>

        {cartItems.length === 0 ? (
          // Empty Cart State
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <EmptyCartAnimation />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-8">
                Discover amazing courses and start your learning journey today!
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/courses")}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
                >
                  Browse Courses
                </button>
                <button
                  onClick={() => navigate("/wishlist")}
                  className="w-full py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <FaHeart className="text-red-500" />
                  <span>View Wishlist</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              {/* Cart Statistics */}
              <CartStats courses={cartItems} />

              {/* Select All */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6 mb-6"
              >
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={
                        selectedItems.size === cartItems.length &&
                        cartItems.length > 0
                      }
                      onChange={handleSelectAll}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="font-semibold text-gray-800">
                      Select All ({cartItems.length} items)
                    </span>
                  </label>
                  <div className="text-sm text-gray-600">
                    {selectedItems.size} of {cartItems.length} selected
                  </div>
                </div>
              </motion.div>

              {/* Course Items */}
              <div className="space-y-4">
                <AnimatePresence>
                  {cartItems.map((course, index) => (
                    <CartItem
                      key={course.id}
                      course={course}
                      index={index}
                      isSelected={selectedItems.has(course.id)}
                      onSelect={() => handleSelectItem(course.id)}
                      onRemove={() => handleRemoveItem(course.id, course.title)}
                      onMoveToWishlist={() =>
                        handleMoveToWishlist(course.id, course.title)
                      }
                      isRemoving={isRemoving}
                      isInWishlist={checkIfInWishlist(course.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Checkout Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <CheckoutSidebar
                  selectedItems={selectedItemsArray}
                  subtotal={subtotal}
                  discount={discount}
                  discountAmount={discountAmount}
                  total={total}
                  promoCode={promoCode}
                  setPromoCode={setPromoCode}
                  showPromo={showPromo}
                  setShowPromo={setShowPromo}
                  onApplyPromo={handleApplyPromo}
                  onCheckout={handleCheckout}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface CartItemProps {
  course: Course;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onMoveToWishlist: () => void;
  isRemoving: boolean;
  isInWishlist: boolean;
}

const CartItem: React.FC<CartItemProps> = ({
  course,
  index,
  isSelected,
  onSelect,
  onRemove,
  onMoveToWishlist,
  isRemoving,
  isInWishlist,
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -300, height: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 ${
        isSelected
          ? "border-blue-500 ring-2 ring-blue-200"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* Checkbox */}
          <div className="pt-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </div>

          {/* Course Image */}
          <div className="flex-shrink-0">
            <img
              src={
                course.image ||
                "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop"
              }
              alt={course.title}
              className="w-24 h-16 md:w-32 md:h-20 object-cover rounded-lg"
            />
          </div>

          {/* Course Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3
                  className="font-bold text-gray-900 text-lg line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer"
                  onClick={() => navigate(`/course/${course.id}`)}
                >
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  By {course.instructor?.firstName}{" "}
                  {course.instructor?.lastName}
                </p>

                {/* Stats */}
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <FaStar className="text-yellow-400" />
                    <span>{course.rating || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FaUsers className="text-blue-500" />
                    <span>
                      {Number(course.enrollmentCount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FaClock className="text-green-500" />
                    <span>{Math.round(course.totalDuration / 60)} min</span>
                  </div>
                </div>

                {/* Level Badge */}
                <div className="mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {course.level}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  ${course.discountPrice || course.originalPrice}
                </div>
                {course.discountPrice &&
                  course.discountPrice < course.originalPrice && (
                    <div className="text-sm text-gray-500 line-through">
                      ${course.originalPrice}
                    </div>
                  )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                <button
                  onClick={onRemove}
                  disabled={isRemoving}
                  className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1 disabled:opacity-50 cursor-pointer"
                >
                  <FaTrash className="text-xs" />
                  <span>Remove</span>
                </button>
                {!isInWishlist && (
                  <button
                    onClick={onMoveToWishlist}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1 cursor-pointer"
                  >
                    <FaHeart className="text-xs" />
                    <span>Save for Later</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-green-600 font-medium flex items-center space-x-1">
                  <FaGift className="text-xs" />
                  <span>Lifetime access</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface CheckoutSidebarProps {
  selectedItems: Course[];
  subtotal: number;
  discount: number;
  discountAmount: number;
  total: number;
  promoCode: string;
  setPromoCode: (code: string) => void;
  showPromo: boolean;
  setShowPromo: (show: boolean) => void;
  onApplyPromo: () => void;
  onCheckout: () => void;
}

const CheckoutSidebar: React.FC<CheckoutSidebarProps> = ({
  selectedItems,
  subtotal,
  discount,
  discountAmount,
  total,
  promoCode,
  setPromoCode,
  showPromo,
  setShowPromo,
  onApplyPromo,
  onCheckout,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-xl p-6 border border-gray-200"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>

      {/* Selected Items Count */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Selected items:</span>
          <span>{selectedItems.length}</span>
        </div>
        {selectedItems.length > 0 && (
          <div className="text-xs text-blue-600">
            {selectedItems
              .map((item) => item.title)
              .join(", ")
              .substring(0, 100)}
            {selectedItems.map((item) => item.title).join(", ").length > 100 &&
              "..."}
          </div>
        )}
      </div>

      {/* Promo Code */}
      <div className="mb-6">
        {!showPromo ? (
          <button
            onClick={() => setShowPromo(true)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
          >
            <FaTag className="text-xs" />
            <span>Add promo code</span>
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-2"
          >
            <div className="flex space-x-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={onApplyPromo}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Apply
              </button>
            </div>
            <button
              onClick={() => {
                setShowPromo(false);
                setPromoCode("");
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between text-gray-600">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex items-center justify-between text-green-600">
            <span>Discount ({discount}%):</span>
            <span>-${discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-xl font-bold text-gray-900">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Benefits */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <FaCheckCircle className="text-xs" />
          <span>Lifetime access</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <FaCheckCircle className="text-xs" />
          <span>Mobile and TV access</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <FaCheckCircle className="text-xs" />
          <span>Certificate of completion</span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={onCheckout}
        disabled={selectedItems.length === 0}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        <FaCreditCard className="text-lg" />
        <span>
          {selectedItems.length === 0
            ? "Select items to checkout"
            : `Checkout ${selectedItems.length} course${
                selectedItems.length > 1 ? "s" : ""
              }`}
        </span>
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        30-Day Money-Back Guarantee
      </p>
    </motion.div>
  );
};

export default Cart;

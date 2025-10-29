import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaTrash,
  FaShoppingCart,
  FaArrowLeft,
  FaHeart,
  FaExclamationTriangle,
} from "react-icons/fa";
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
import { useToast } from "../../components/UI/ToastProvider";
import { cartToasts, generalToasts } from "../../utils/toastUtils";
// @ts-ignore
import { useTranslation } from "react-i18next";
import CartItem from "../../components/Client/CartItem";
import CheckoutSidebar from "../../components/Client/CheckoutSidebar";

const Cart = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuthContext();
  const { t } = useTranslation();

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
      showToast(cartToasts.removed(courseTitle));
    } catch (error) {
      showToast(
        generalToasts.error(t("common.error"), t("cart.failedToRemoveItem"))
      );
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      setSelectedItems(new Set());
      showToast(
        generalToasts.success(
          "🎉 " + t("common.congratulations"),
          t("cart.cartCleared")
        )
      );
    } catch (error) {
      showToast(
        generalToasts.error(t("common.error"), t("cart.failedToClearCart"))
      );
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
      showToast(cartToasts.wishlistAdded(courseTitle));
    } catch (error) {
      showToast(
        generalToasts.error(t("common.error"), t("cart.failedToMoveToWishlist"))
      );
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
      showToast(
        generalToasts.success(
          "🎉 " + t("common.congratulations"),
          t("cart.promoCodeApplied", { discount: discountPercent })
        )
      );
    } else {
      showToast(
        generalToasts.error(t("common.error"), t("cart.invalidPromoCode"))
      );
    }
  };

  const handleCheckout = () => {
    if (selectedItems.size === 0) {
      showToast(
        generalToasts.warning(t("common.warning"), t("cart.pleaseSelectItems"))
      );
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
              {t("common.somethingWentWrong")}
            </h2>
            <p className="text-gray-600 mb-4">{t("cart.couldNotLoadCart")}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t("common.retry")}
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
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <FaArrowLeft className="text-lg" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
                  <FaShoppingCart className="text-blue-600" />
                  <span>{t("navigation.cart")}</span>
                </h1>
                <p className="text-gray-600 mt-1">
                  {cartCount}{" "}
                  {cartCount === 1 ? t("common.course") : t("common.courses")}{" "}
                  {t("cart.inYourCart")}
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
                <span>{t("cart.clearCart")}</span>
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
                {t("cart.cartIsEmpty")}
              </h2>
              <p className="text-gray-600 mb-8">{t("cart.discoverCourses")}</p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/courses")}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
                >
                  {t("navigation.browse")}
                </button>
                <button
                  onClick={() => navigate("/wishlist")}
                  className="w-full py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <FaHeart className="text-red-500" />
                  <span>{t("navigation.wishlist")}</span>
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
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="font-semibold text-gray-800">
                      {t("cart.selectAll")} ({cartItems.length}{" "}
                      {t("cart.items")})
                    </span>
                  </label>
                  <div className="text-sm text-gray-600">
                    {selectedItems.size} {t("cart.of")} {cartItems.length}{" "}
                    {t("cart.selected")}
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

export default Cart;

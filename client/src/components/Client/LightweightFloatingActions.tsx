import { FaShoppingCart, FaHeart, FaArrowUp } from "react-icons/fa";
import { useCartHelpers } from "../../hooks/useCart";
import { useWishlistHelpers } from "../../hooks/useWishlist";
import { useNavigate } from "react-router-dom";
import { memo, useState, useEffect } from "react";

const LightweightFloatingActions = memo(() => {
  const navigate = useNavigate();
  const { cartCount } = useCartHelpers();
  const { wishlistCount } = useWishlistHelpers();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 200);
    };

    handleScroll(); // Check initial position
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3">
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="floating-action w-12 h-12 bg-gray-800 hover:bg-gray-900 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center opacity-90 hover:opacity-100 transform hover:scale-110 cursor-pointer"
          aria-label="Scroll to top"
        >
          <FaArrowUp className="text-sm" />
        </button>
      )}
      {/* Wishlist Button */}
      <button
        onClick={() => navigate("/wishlist")}
        className="floating-action w-14 h-14 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full shadow-lg hover:shadow-xl transition-colors duration-200 flex items-center justify-center relative cursor-pointer"
        aria-label="View Wishlist"
      >
        <FaHeart className="text-lg" />
        {wishlistCount > 0 && (
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {wishlistCount > 9 ? "9+" : wishlistCount}
          </span>
        )}
      </button>

      {/* Cart Button */}
      <button
        onClick={() => navigate("/cart")}
        className="floating-action w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-colors duration-200 flex items-center justify-center relative cursor-pointer"
        aria-label="View Shopping Cart"
      >
        <FaShoppingCart className="text-xl" />
        {cartCount > 0 && (
          <span
            key={cartCount}
            className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white text-sm font-bold rounded-full flex items-center justify-center"
          >
            {cartCount > 9 ? "9+" : cartCount}
          </span>
        )}
      </button>
    </div>
  );
});

LightweightFloatingActions.displayName = "LightweightFloatingActions";

export default LightweightFloatingActions;

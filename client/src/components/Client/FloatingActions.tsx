import { motion, AnimatePresence } from "framer-motion";
import { FaShoppingCart, FaHeart, FaArrowUp } from "react-icons/fa";
import { useCartHelpers } from "../../hooks/useCart";
import { useWishlistHelpers } from "../../hooks/useWishlist";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const FloatingActions = () => {
  const navigate = useNavigate();
  const { cartCount } = useCartHelpers();
  const { wishlistCount } = useWishlistHelpers();
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3">
      <AnimatePresence>
        {showScrollToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={scrollToTop}
            className="w-14 h-14 bg-gray-800 hover:bg-gray-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center group"
          >
            <FaArrowUp className="text-lg group-hover:animate-bounce" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Wishlist Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate("/wishlist")}
        className="w-14 h-14 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center relative group"
      >
        <FaHeart className="text-lg group-hover:animate-pulse" />
        {wishlistCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {wishlistCount > 9 ? "9+" : wishlistCount}
          </motion.span>
        )}
      </motion.button>

      {/* Cart Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate("/cart")}
        className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center relative group"
      >
        <FaShoppingCart className="text-xl group-hover:animate-bounce" />
        {cartCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            key={cartCount}
            className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white text-sm font-bold rounded-full flex items-center justify-center"
          >
            {cartCount > 9 ? "9+" : cartCount}
          </motion.span>
        )}
      </motion.button>
    </div>
  );
};

export default FloatingActions;

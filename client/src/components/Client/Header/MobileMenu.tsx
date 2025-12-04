import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBars,
  FaTimes,
  FaSearch,
  FaHeart,
  FaShoppingCart,
  FaBookOpen,
  FaChalkboardTeacher,
  FaBell,
  FaUserCircle,
  FaUser,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useWishlistHelpers } from "../../../hooks/useWishlist";
import { useCartHelpers } from "../../../hooks/useCart";

interface MobileMenuProps {
  isAuthenticated: boolean;
  user?: any;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isAuthenticated,
  user,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { wishlistCount } = useWishlistHelpers();
  const { cartCount } = useCartHelpers();
  const notifications = 3; // This should come from context or props

  const userDisplayData = user
    ? {
        isInstructor: () => user.role === "instructor",
      }
    : null;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsMobileMenuOpen(!isMobileMenuOpen);
        }}
        className="lg:hidden p-2 text-gray-700 hover:text-indigo-600 transition-colors duration-200"
      >
        {isMobileMenuOpen ? (
          <FaTimes className="text-xl" />
        ) : (
          <FaBars className="text-xl" />
        )}
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <div className="md:hidden">
                <form onSubmit={onSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={t("common.searchCoursesInstructors")}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                </form>
              </div>

              {/* User Actions (Mobile) */}
              {isAuthenticated && userDisplayData && (
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <Link
                    to="/wishlist"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 text-gray-700 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <FaHeart />
                      <span>{t("common.wishlist")}</span>
                    </div>
                    {wishlistCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {wishlistCount > 9 ? "9+" : wishlistCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/cart"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <FaShoppingCart />
                      <span>{t("common.shoppingCart")}</span>
                    </div>
                    {cartCount > 0 && (
                      <span className="bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount > 9 ? "9+" : cartCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/my-learning"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 p-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                  >
                    <FaBookOpen />
                    <span>{t("common.myLearning")}</span>
                  </Link>

                  {/* Become Instructor - Only for students */}
                  {!userDisplayData.isInstructor() && (
                    <Link
                      to="/become-instructor/apply"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 p-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
                    >
                      <FaChalkboardTeacher />
                      <span>{t("common.becomeInstructor")}</span>
                    </Link>
                  )}

                  <Link
                    to="/notifications"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <FaBell />
                      <span>{t("common.notifications")}</span>
                    </div>
                    {notifications > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {notifications > 9 ? "9+" : notifications}
                      </span>
                    )}
                  </Link>
                </div>
              )}

              {/* Auth Links (Mobile) */}
              {!isAuthenticated && (
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <Link
                    to="/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center p-3 text-gray-700 hover:text-indigo-600 font-medium border border-gray-300 rounded-lg transition-all duration-200"
                  >
                    <FaUserCircle className="mr-2 text-lg" />
                    {t("common.logIn")}
                  </Link>
                  <Link
                    to="/auth/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    <FaUser className="mr-2 text-lg" />
                    {t("common.signUp")}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileMenu;

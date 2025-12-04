import { motion } from "framer-motion";
import {
  FaHeart,
  FaShoppingCart,
  FaBookOpen,
  FaChalkboardTeacher,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../Common/LanguageSwitcher";
import { useWishlistHelpers } from "../../../hooks/useWishlist";
import { useCartHelpers } from "../../../hooks/useCart";

interface UserActionsProps {
  isInstructor?: boolean;
}

const UserActions: React.FC<UserActionsProps> = ({ isInstructor = false }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { wishlistCount } = useWishlistHelpers();
  const { cartCount } = useCartHelpers();

  return (
    <div className="hidden lg:flex items-center space-x-1 xl:space-x-3">
      {/* Favorites */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/wishlist")}
        className="relative p-2 text-gray-700 hover:text-red-500 transition-colors duration-200 group cursor-pointer"
        title={t("common.wishlist")}
      >
        <FaHeart className="text-lg" />
        {wishlistCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {wishlistCount > 9 ? "9+" : wishlistCount}
          </span>
        )}
      </motion.button>

      {/* Cart */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/cart")}
        className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors duration-200 group cursor-pointer"
        title={t("common.shoppingCart")}
      >
        <FaShoppingCart className="text-lg" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {cartCount > 9 ? "9+" : cartCount}
          </span>
        )}
      </motion.button>

      {/* My Learnings - Hidden on lg, shown on xl */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/my-learning")}
        className="hidden xl:flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 cursor-pointer"
        title={t("student.myLearning")}
      >
        <FaBookOpen className="text-sm" />
        <span className="font-medium">{t("student.myLearning")}</span>
      </motion.button>

      {/* Become Instructor - Only for students */}
      {!isInstructor && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/become-instructor/apply")}
          className="hidden xl:flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 cursor-pointer"
          title={t("common.becomeInstructor")}
        >
          <FaChalkboardTeacher className="text-sm" />
          <span className="font-medium">{t("common.teach")}</span>
        </motion.button>
      )}

      {/* Language Switcher */}
      <LanguageSwitcher />
    </div>
  );
};

export default UserActions;

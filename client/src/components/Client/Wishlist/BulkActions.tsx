import { useTranslation } from "react-i18next";
import { FaArrowLeft, FaCheckCircle, FaSpinner, FaTrash } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useToggleWishlist } from "../../../hooks/useWishlistMutations";
import { useWishlistToast } from "../../../hooks/useWishlistToast";

type BulkActionsProps = {
  setIsSelectionMode: (isSelectionMode: boolean) => void;
  setSelectedCourses: any;
  selectedCourses: Set<string>;
  filteredAndSortedCourses: Array<{ id: string }>;
  wishlistItems: Array<{ id: string; title: string }>;
  wishlistCount: number;
  isSelectionMode: boolean;
};

const BulkActions = ({
  setIsSelectionMode,
  setSelectedCourses,
  selectedCourses,
  filteredAndSortedCourses,
  wishlistItems,
  wishlistCount,
  isSelectionMode,
}: BulkActionsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { isLoading: isToggling } = useToggleWishlist();

  const { removeBulkFromWishlistWithToast } = useWishlistToast({
    onRemoveSuccess: (courseId) => {
      setSelectedCourses((prev: any) => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    },
  });

  const handleSelectAll = () => {
    if (selectedCourses.size === filteredAndSortedCourses.length) {
      setSelectedCourses(new Set());
    } else {
      setSelectedCourses(
        new Set(filteredAndSortedCourses.map((course) => course.id))
      );
    }
  };

  const handleRemoveSelected = async () => {
    const coursesToRemove = Array.from(selectedCourses).map((courseId) => {
      const course = wishlistItems.find((c) => c.id === courseId);
      return {
        id: courseId,
        title: course?.title || "Unknown Course",
      };
    });

    await removeBulkFromWishlistWithToast(coursesToRemove);

    setSelectedCourses(new Set());
    setIsSelectionMode(false);
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="p-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-sm transition-all duration-200"
        >
          <FaArrowLeft className="text-gray-600" />
        </motion.button>
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              {t("navigation.wishlist")}
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            {t("wishlist.coursesSavedForLater", { count: wishlistCount })}
          </p>
        </div>
      </div>

      {/* Bulk Actions */}
      {wishlistCount > 0 && (
        <div className="flex items-center space-x-3">
          {!isSelectionMode ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSelectionMode(true)}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 cursor-pointer"
            >
              <FaCheckCircle className="text-sm" />
              <span>{t("common.select")}</span>
            </motion.button>
          ) : (
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSelectAll}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all duration-200 cursor-pointer"
              >
                {selectedCourses.size === filteredAndSortedCourses.length
                  ? t("wishlist.deselectAll")
                  : t("wishlist.selectAll")}
              </motion.button>

              {selectedCourses.size > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRemoveSelected}
                  disabled={isToggling}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 cursor-pointer"
                >
                  {isToggling ? (
                    <FaSpinner className="text-sm animate-spin" />
                  ) : (
                    <FaTrash className="text-sm" />
                  )}
                  <span>
                    {t("wishlist.removeSelected", {
                      count: selectedCourses.size,
                    })}
                  </span>
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsSelectionMode(false);
                  setSelectedCourses(new Set());
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-all duration-200 cursor-pointer"
              >
                {t("common.cancel")}
              </motion.button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkActions;

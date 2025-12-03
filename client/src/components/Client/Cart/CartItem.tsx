import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Course } from "../../types/course.type";
import {
  FaClock,
  FaGift,
  FaHeart,
  FaStar,
  FaTrash,
  FaUsers,
} from "react-icons/fa";

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
  const { t } = useTranslation();

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
          <div className="pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {/* Course Image */}
          <div className="flex-shrink-0">
            <img
              src={
                course.image.url ||
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
                  {t("course.createdBy", {
                    instructor: `${course.instructor?.firstName} ${course.instructor?.lastName}`,
                  })}
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
                    <span>
                      {Math.round(course.totalDuration / 60) || 0}{" "}
                      {t("common.minutes")}
                    </span>
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
                  <span>{t("common.remove")}</span>
                </button>
                {!isInWishlist && (
                  <button
                    onClick={onMoveToWishlist}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1 cursor-pointer"
                  >
                    <FaHeart className="text-xs" />
                    <span>{t("cart.saveForLater")}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-green-600 font-medium flex items-center space-x-1">
                  <FaGift className="text-xs" />
                  <span>{t("course.lifetimeAccess")}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartItem;

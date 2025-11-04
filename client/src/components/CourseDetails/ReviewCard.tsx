import React from "react";
import { FaEdit, FaTrash, FaUser } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import type { Review } from "../../types/review.types";
import StarRating from "../UI/StarRating";
import { useAuthContext } from "../../context/AuthContext";

interface ReviewCardProps {
  review: Review;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  isDeleting?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onEdit,
  onDelete,
  isDeleting = false,
}) => {
  const { user } = useAuthContext();
  const isOwnReview = user?.id === review.user._id;

  const formatReviewDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "Unknown date";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
            {review.user.profilePicture ? (
              <img
                src={review.user.profilePicture}
                alt={review.user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <FaUser className="text-blue-600 text-lg" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 truncate">
                {review.user.name}
              </h4>
              {review.updatedAt && review.updatedAt !== review.date && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  edited
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mb-2">
              <StarRating rating={review.rating} readOnly size="sm" />
              <span className="text-sm text-gray-500">
                {formatReviewDate(review.date)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {isOwnReview && (
          <div className="flex items-center space-x-1">
            {onEdit && (
              <button
                onClick={() => onEdit(review)}
                className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="Edit review"
              >
                <FaEdit className="text-sm" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(review._id)}
                disabled={isDeleting}
                className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete review"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                ) : (
                  <FaTrash className="text-sm" />
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Comment */}
      <div className="text-gray-700 leading-relaxed pl-16">
        <p className="whitespace-pre-wrap">{review.comment}</p>
      </div>
    </div>
  );
};

export default ReviewCard;

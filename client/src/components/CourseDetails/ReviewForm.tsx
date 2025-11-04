import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import StarRating from "../UI/StarRating";
import type { Review } from "../../types/review.types";

interface ReviewFormProps {
  onSubmit: (data: { rating: number; comment: string }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  initialData?: Review | null;
  isEditing?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  initialData = null,
  isEditing = false,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>(
    {}
  );

  useEffect(() => {
    if (initialData) {
      setRating(initialData.rating);
      setComment(initialData.comment);
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: { rating?: string; comment?: string } = {};

    if (rating === 0) {
      newErrors.rating = "Please select a rating";
    }

    if (!comment.trim()) {
      newErrors.comment = "Please write a comment";
    } else if (comment.trim().length < 10) {
      newErrors.comment = "Comment must be at least 10 characters long";
    } else if (comment.trim().length > 500) {
      newErrors.comment = "Comment must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit({ rating, comment: comment.trim() });
    }
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    if (errors.rating) {
      setErrors({ ...errors, rating: undefined });
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
    if (errors.comment) {
      setErrors({ ...errors, comment: undefined });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {isEditing ? "Edit Your Review" : "Write a Review"}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Share your experience with other students
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white hover:bg-opacity-60 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            How would you rate this course? *
          </label>
          <div className="flex items-center space-x-4">
            <StarRating
              rating={rating}
              onRatingChange={handleRatingChange}
              size="lg"
              hoverRating={hoverRating}
              onHoverChange={setHoverRating}
            />
            {rating > 0 && (
              <span className="text-sm font-medium text-gray-700">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </span>
            )}
          </div>
          {errors.rating && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
              {errors.rating}
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-semibold text-gray-900 mb-3"
          >
            Tell us about your experience *
          </label>
          <textarea
            id="comment"
            rows={5}
            value={comment}
            onChange={handleCommentChange}
            placeholder="What did you like about this course? What could be improved? Share details that would help other students..."
            className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 ${
              errors.comment
                ? "border-red-300 bg-red-50"
                : "border-gray-200 hover:border-gray-300 focus:bg-white"
            }`}
            disabled={isSubmitting}
          />
          <div className="flex justify-between mt-2">
            {errors.comment ? (
              <p className="text-sm text-red-600 flex items-center">
                <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                {errors.comment}
              </p>
            ) : (
              <div />
            )}
            <p
              className={`text-sm font-medium ${
                comment.length > 450
                  ? "text-orange-600"
                  : comment.length > 400
                  ? "text-yellow-600"
                  : "text-gray-500"
              }`}
            >
              {comment.length}/500
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !rating || !comment.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{isEditing ? "Update Review" : "Submit Review"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;

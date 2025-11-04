import React, { useState } from "react";
import { FaPlus, FaChevronLeft, FaChevronRight, FaStar } from "react-icons/fa";
import Swal from "sweetalert2";
import {
  useGetCourseReviews,
  useAddReview,
  useUpdateReview,
  useDeleteReview,
  useReviewPagination,
} from "../../hooks/useReviews";
import { useAuthContext } from "../../context/AuthContext";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import StarRating from "../UI/StarRating";
import type { Review } from "../../types/review.types";

interface ReviewsListProps {
  courseId: string;
  hasUserEnrolled?: boolean;
}

const ReviewsList: React.FC<ReviewsListProps> = ({
  courseId,
  hasUserEnrolled = false,
}) => {
  const { user, isAuthenticated } = useAuthContext();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  const {
    data: reviewsData,
    isLoading,
    error,
  } = useGetCourseReviews(courseId, currentPage, reviewsPerPage);

  const addReviewMutation = useAddReview(courseId);
  const updateReviewMutation = useUpdateReview(
    courseId,
    editingReview?._id || ""
  );
  const deleteReviewMutation = useDeleteReview(courseId);

  const { goToPage } = useReviewPagination(
    reviewsData?.pagination?.totalPages || 1
  );

  // Check if user has already reviewed this course
  const userReview = reviewsData?.reviews?.find(
    (review: Review) => review.user._id === user?.id
  );

  const handleAddReview = (reviewData: { rating: number; comment: string }) => {
    addReviewMutation.mutate(reviewData, {
      onSuccess: () => {
        setShowReviewForm(false);
      },
    });
  };

  const handleUpdateReview = (reviewData: {
    rating: number;
    comment: string;
  }) => {
    if (editingReview) {
      updateReviewMutation.mutate(reviewData, {
        onSuccess: () => {
          setEditingReview(null);
          setShowReviewForm(false);
        },
      });
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    const result = await Swal.fire({
      title: "Delete Review?",
      text: "Are you sure you want to delete this review?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      deleteReviewMutation.mutate(reviewId);
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleCancelForm = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    goToPage(page);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">
          Failed to load reviews. Please try again.
        </p>
      </div>
    );
  }

  const reviews = reviewsData?.reviews || [];
  const stats = reviewsData?.stats;
  console.log("is Authenticated", isAuthenticated);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Student Reviews
            </h2>
            <p className="text-gray-600">
              {stats?.totalReviews || 0} review
              {(stats?.totalReviews || 0) !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Add Review Button */}
          {isAuthenticated &&
            hasUserEnrolled &&
            !userReview &&
            !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
              >
                <FaPlus className="text-sm" />
                <span>Write Review</span>
              </button>
            )}
        </div>

        {/* Rating Summary */}
        {stats && stats.totalReviews > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="grid md:grid-cols-3 gap-6 items-center">
              {/* Overall Rating */}
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900 mb-3">
                  {stats.averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center mb-2">
                  <StarRating
                    rating={Math.round(stats.averageRating * 10) / 10}
                    readOnly
                    size="lg"
                  />
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  Course Rating
                </p>
              </div>

              {/* Rating Breakdown */}
              <div className="md:col-span-2 space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count =
                    stats.ratingBreakdown[
                      rating as keyof typeof stats.ratingBreakdown
                    ];
                  const percentage =
                    stats.totalReviews > 0
                      ? (count / stats.totalReviews) * 100
                      : 0;

                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-sm font-medium text-gray-700 w-16">
                        <span>{rating}</span>
                        <FaStar className="text-yellow-400 text-xs" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-sm text-gray-600 w-8 text-right">
                        {count}
                      </div>
                      <div className="text-xs text-gray-500 w-12 text-right">
                        {percentage.toFixed(0)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <ReviewForm
          onSubmit={editingReview ? handleUpdateReview : handleAddReview}
          onCancel={handleCancelForm}
          isSubmitting={
            addReviewMutation.isPending || updateReviewMutation.isPending
          }
          initialData={editingReview}
          isEditing={!!editingReview}
        />
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaStar className="text-3xl text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No reviews yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {isAuthenticated && hasUserEnrolled
                ? "Be the first to share your experience with this course!"
                : "Reviews from students will appear here once they're submitted."}
            </p>
            {isAuthenticated && hasUserEnrolled && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <FaPlus className="text-sm" />
                <span>Write the First Review</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {reviews
              .filter((review: Review) => editingReview?._id !== review._id)
              .map((review: Review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  onEdit={handleEditReview}
                  onDelete={handleDeleteReview}
                  isDeleting={deleteReviewMutation.isPending}
                />
              ))}

            {/* Pagination */}
            {reviewsData?.pagination &&
              reviewsData.pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-3 mt-10 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!reviewsData.pagination.hasPrevious}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaChevronLeft className="w-3 h-3 mr-2" />
                    Previous
                  </button>

                  <div className="flex space-x-1">
                    {Array.from(
                      { length: reviewsData.pagination.totalPages },
                      (_, i) => i + 1
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                          page === currentPage
                            ? "bg-blue-600 text-white shadow-md"
                            : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!reviewsData.pagination.hasNext}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <FaChevronRight className="w-3 h-3 ml-2" />
                  </button>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsList;

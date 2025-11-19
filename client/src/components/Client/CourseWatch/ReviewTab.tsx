import { useState } from "react";
import { useCourse } from "../../../hooks/useCourseHooks";
import {
  useAddCourseReview,
  useEnrollmentReviews,
} from "../../../hooks/useEnrollment";

type Props = {
  course: any;
  enrollment: any;
  courseId: string | undefined;
};

const ReviewTab = ({ course, enrollment, courseId }: Props) => {
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);

  const addReviewMutation = useAddCourseReview();

  const { refetch: refetchCourse } = useCourse(courseId!);

  const { data: enrollmentReviewsResponse } = useEnrollmentReviews(
    enrollment?.id || ""
  );

  const enrollmentReviews = enrollmentReviewsResponse?.data?.reviews || [];

  const addReview = () => {
    if (!newReview.trim() || !enrollment || newRating < 1 || newRating > 5)
      return;

    addReviewMutation.mutate(
      {
        enrollmentId: enrollment.id,
        reviewData: {
          rating: newRating,
          review: newReview.trim(),
        },
      },
      {
        onSuccess: () => {
          setNewReview("");
          setNewRating(5);
          refetchCourse();
        },
      }
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Course Reviews</h3>
        {course?.rating && course?.ratingsCount ? (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-lg ${
                    star <= Math.round(course.rating)
                      ? "text-yellow-400"
                      : "text-gray-500"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-white font-semibold">
              {course.rating.toFixed(1)}
            </span>
            <span className="text-gray-400">
              ({course.ratingsCount} reviews)
            </span>
          </div>
        ) : (
          <span className="text-gray-400">No ratings yet</span>
        )}
      </div>

      {/* Add Review Form */}
      <div className="bg-gray-700 p-4 rounded-lg mb-6">
        <h4 className="font-semibold mb-3">Leave a Review</h4>

        {/* Rating Stars */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-sm text-gray-300">Rating:</span>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setNewRating(star)}
                className={`text-2xl ${
                  star <= newRating ? "text-yellow-400" : "text-gray-500"
                } hover:text-yellow-300 transition-colors`}
              >
                ★
              </button>
            ))}
          </div>
          <span className="text-sm text-gray-400">({newRating}/5)</span>
        </div>

        {/* Review Text */}
        <textarea
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          placeholder="Write your review..."
          className="w-full bg-gray-600 text-white p-3 rounded border border-gray-500 focus:border-purple-500 focus:outline-none resize-none mb-3"
          rows={4}
        />

        <button
          onClick={addReview}
          disabled={!newReview.trim()}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Submit Review
        </button>
      </div>

      {/* My Reviews Section */}
      {enrollmentReviews && enrollmentReviews.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3 text-purple-400">
            My Reviews for this Course
          </h4>
          <div className="space-y-3">
            {enrollmentReviews.map((review: any, index: number) => (
              <div
                key={index}
                className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-lg"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-sm ${
                            star <= review.rating
                              ? "text-yellow-400"
                              : "text-gray-500"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-purple-300 text-sm font-medium">
                      My Review
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-200">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Course Reviews */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold mb-3">All Course Reviews</h4>
        {!course?.reviews || course.reviews.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No reviews yet. Be the first to review this course!
          </p>
        ) : (
          course.reviews.map((review: any, index: number) => (
            <div
              key={review._id || index}
              className="bg-gray-700 p-4 rounded-lg"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {review.user?.firstName?.[0] || "U"}
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {review.user?.firstName || "Anonymous"}{" "}
                      {review.user?.lastName || "User"}
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-sm ${
                              star <= review.rating
                                ? "text-yellow-400"
                                : "text-gray-500"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-400">
                        {new Date(
                          review.date || review.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-200 mt-2">
                {review.comment || review.review}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewTab;

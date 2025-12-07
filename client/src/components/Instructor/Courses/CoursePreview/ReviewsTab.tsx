import { FaStar } from "react-icons/fa";

const ReviewsTab = ({ course }: { course: any }) => {
  return (
    <div>
      {course.reviews && course.reviews.length > 0 ? (
        <div className="space-y-4">
          {course.reviews.map((review: any) => (
            <div key={review._id} className="border-b border-gray-100 pb-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-indigo-600">
                    {review.user?.firstName?.charAt(0) || "?"}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {review.user?.firstName} {review.user?.lastName}
                    </span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`text-sm ${
                            i < review.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FaStar className="text-4xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No reviews yet</p>
        </div>
      )}
    </div>
  );
};

export default ReviewsTab;

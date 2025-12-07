import { motion } from "framer-motion";
import renderStars from "../../utils/renderStars";
import { useTranslation } from "react-i18next";
import { useGetCourseReviews } from "../../hooks/useReviews";

type Props = {
  course: any;
  courseId: string | undefined;
};

const ReviewsTab = ({ course, courseId }: Props) => {
  const { t } = useTranslation();
  const { data: reviewsData, isLoading: reviewsLoading } = useGetCourseReviews(
    courseId || "",
    1,
    10
  );

  return (
    <motion.div
      key="reviews"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">
            {t("courseDetails.studentReviews")}
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {renderStars(course.rating)}
            </div>
            <span className="font-bold text-lg">
              {course.rating.toFixed(1)}
            </span>
            <span className="text-gray-600">
              ({course.ratingsCount} {t("courseDetails.reviews")})
            </span>
          </div>
        </div>

        {reviewsLoading ? (
          <div className="text-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl animate-pulse"></div>
            </div>
            <p className="text-slate-600 mt-4 font-medium">
              Loading reviews...
            </p>
          </div>
        ) : (reviewsData?.reviews?.length || 0) > 0 ? (
          <div className="">
            {reviewsData?.reviews.map((review: any, idx: number) => {
              return (
                <div key={idx} className="group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-white to-purple-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 "></div>
                  <div className="relative backdrop-blur-sm bg-white/80 border border-white/60 rounded-2xl px-5 pb-5 pt-2 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group-hover:border-blue-200/60 ">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-4 ">
                        <div className="relative">
                          <div className="w-13 h-13 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
                            <span className="text-white font-bold text-lg">
                              {(
                                review.user?.firstName?.charAt(0) ||
                                review.user?.name?.charAt(0) ||
                                "U"
                              ).toUpperCase()}
                            </span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg mb-1">
                            {review.user?.firstName}{" "}
                            {review.user?.lastName || ""}
                          </h4>
                          <div className="flex pt-1 flex-col gap-2 items-center space-x-3 mb-2">
                            <div className="flex items-center space-x-1">
                              {renderStars(review.rating)}
                            </div>
                            <div className="text-right">
                              <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200/60 rounded-xl px-3 py-[0.1rem] mb-2">
                                <span className="text-[0.8rem] text-slate-600 font-semibold">
                                  {new Date(review.date).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    }
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <p className="relative text-slate-700 leading-relaxed text-base font-medium bg-gradient-to-r from-slate-50/80 to-white/80 rounded-xl py-2 px-4 border border-slate-200/40">
                        "{review.comment}"
                      </p>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50 border border-slate-200/60 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                <svg
                  className="w-10 h-10 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-3xl blur-2xl"></div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              No Reviews Yet
            </h3>
            <p className="text-slate-600 font-medium mb-6 max-w-md mx-auto">
              Be the first to share your experience and help others discover
              this amazing course!
            </p>
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/60 rounded-2xl px-6 py-3">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              <span className="text-blue-700 font-semibold text-sm">
                Write the first review
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ReviewsTab;

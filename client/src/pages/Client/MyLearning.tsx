import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaBook,
  FaPlay,
  FaCertificate,
  FaStar,
  FaClock,
  FaArrowRight,
  FaSpinner,
} from "react-icons/fa";
import {
  useUserEnrollments,
  useLearningStats,
} from "../../hooks/useEnrollment";

const MyLearning = () => {
  const navigate = useNavigate();

  const {
    data: enrollmentsData,
    isLoading: enrollmentsLoading,
    error: enrollmentsError,
  } = useUserEnrollments({
    status: "all",
    sortBy: "lastAccessedAt",
    sortOrder: "desc",
    limit: 50,
  });

  const { data: statsData, isLoading: statsLoading } = useLearningStats();

  const enrolledCourses = enrollmentsData?.data?.enrollments || [];
  const stats = statsData?.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
                <FaBook className="text-blue-600" />
                <span>My Learning</span>
              </h1>
              <p className="text-gray-600 mt-1">
                Continue your learning journey with {enrolledCourses.length}{" "}
                enrolled courses
              </p>
            </div>
            <button
              onClick={() => navigate("/courses")}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg cursor-pointer"
            >
              Browse More Courses
            </button>
          </div>
        </motion.div>

        {/* Learning Stats Summary */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaBook className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.totalEnrolledCourses}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FaCertificate className="text-green-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.totalCompletedCourses}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FaPlay className="text-orange-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.totalInProgressCourses}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FaClock className="text-purple-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Watch Time</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {Math.round(stats.totalWatchTime / 3600)}h{" "}
                    {Math.round((stats.totalWatchTime % 3600) / 60)}m
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {enrollmentsLoading || statsLoading ? (
          // Loading State
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-16"
          >
            <div className="flex items-center space-x-3 text-gray-600">
              <FaSpinner className="animate-spin text-2xl" />
              <span className="text-lg">Loading your courses...</span>
            </div>
          </motion.div>
        ) : enrollmentsError ? (
          // Error State
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <FaBook className="text-4xl text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Failed to Load Courses
              </h2>
              <p className="text-gray-600 mb-8">
                We couldn't load your enrolled courses. Please try refreshing
                the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Refresh Page
              </button>
            </div>
          </motion.div>
        ) : enrolledCourses.length === 0 ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <FaBook className="text-4xl text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Start Your Learning Journey
              </h2>
              <p className="text-gray-600 mb-8">
                You haven't enrolled in any courses yet. Discover amazing
                courses to get started!
              </p>
              <button
                onClick={() => navigate("/courses")}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
              >
                Browse Courses
              </button>
            </div>
          </motion.div>
        ) : (
          // Course Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((enrollment: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-gray-300 cursor-pointer group"
                onClick={() =>
                  navigate(`/course/${enrollment.course._id}/learn`)
                }
              >
                {/* Image with Progress Overlay */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={enrollment.course.image.url}
                    alt={enrollment.course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <FaPlay className="text-2xl text-blue-600 ml-1" />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/20">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-blue-500"
                      style={{ width: `${enrollment.progressPercentage}%` }}
                    />
                  </div>

                  {/* Progress Percentage */}
                  <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-sm font-bold">
                    {enrollment.progressPercentage}%
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {enrollment.course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      By {enrollment.course.instructor?.firstName}{" "}
                      {enrollment.course.instructor?.lastName}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <FaBook className="text-xs text-blue-500" />
                        <span>
                          {enrollment.completedLessons.length}/
                          {enrollment.course.totalLessons || 0} lessons
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FaStar className="text-xs text-yellow-400" />
                        <span>
                          {enrollment.rating ||
                            enrollment.course.rating ||
                            "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <FaClock className="text-xs" />
                      <span>
                        Last accessed:{" "}
                        {enrollment.lastAccessedAt
                          ? new Date(
                              enrollment.lastAccessedAt
                            ).toLocaleDateString()
                          : "Never"}
                      </span>
                    </div>
                  </div>

                  {/* Continue Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/course/${enrollment.course._id}/learn`);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <FaPlay className="text-sm" />
                    <span>Continue Learning</span>
                    <FaArrowRight className="text-sm" />
                  </button>

                  {/* Certificate Badge */}
                  {enrollment.progressPercentage === 100 && (
                    <div className="mt-3 flex items-center justify-center space-x-2 text-sm text-green-600 font-medium">
                      <FaCertificate />
                      <span>
                        {enrollment.certificateIssued
                          ? "Certificate Available"
                          : "Certificate Pending"}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLearning;

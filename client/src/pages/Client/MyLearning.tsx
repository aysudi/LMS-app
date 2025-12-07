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
// @ts-ignore
import { useTranslation } from "react-i18next";

const MyLearning = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center space-x-2 sm:space-x-3">
                <FaBook className="text-blue-600 text-xl sm:text-2xl flex-shrink-0" />
                <span className="break-words">{t("student.myLearning")}</span>
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                {t("student.continueLearning")} {enrolledCourses.length}{" "}
                {t("common.courses")}
              </p>
            </div>
            <button
              onClick={() => navigate("/courses")}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg cursor-pointer text-sm sm:text-base whitespace-nowrap"
            >
              {t("student.browseCategories")}
            </button>
          </div>
        </motion.div>

        {/* Learning Stats Summary */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
          >
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaBook className="text-blue-600 text-lg sm:text-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    {t("instructor.totalCourses")}
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-800">
                    {stats.totalEnrolledCourses}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaCertificate className="text-green-600 text-lg sm:text-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    {t("student.completed")}
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-800">
                    {stats.totalCompletedCourses}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaPlay className="text-orange-600 text-lg sm:text-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    {t("student.inProgress")}
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-800">
                    {stats.totalInProgressCourses}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaClock className="text-purple-600 text-lg sm:text-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    {t("student.watchTime")}
                  </p>
                  <p className="text-sm sm:text-2xl font-bold text-gray-800 leading-tight">
                    {Math.round(stats.totalWatchTime / 3600)}h{" "}
                    <span className="text-xs sm:text-lg">
                      {Math.round((stats.totalWatchTime % 3600) / 60)}m
                    </span>
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
            className="flex items-center justify-center py-12 sm:py-16"
          >
            <div className="flex items-center space-x-2 sm:space-x-3 text-gray-600">
              <FaSpinner className="animate-spin text-xl sm:text-2xl" />
              <span className="text-base sm:text-lg">
                {t("student.loadingCourses")}
              </span>
            </div>
          </motion.div>
        ) : enrollmentsError ? (
          // Error State
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 sm:py-16 px-4"
          >
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <FaBook className="text-3xl sm:text-4xl text-red-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
                {t("student.failedToLoadCourses")}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                {t("student.couldntLoadCourses")}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                {t("common.refreshPage")}
              </button>
            </div>
          </motion.div>
        ) : enrolledCourses.length === 0 ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 sm:py-16 px-4"
          >
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <FaBook className="text-3xl sm:text-4xl text-gray-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
                {t("student.startLearningJourney")}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                {t("student.notEnrolledYet")}
              </p>
              <button
                onClick={() => navigate("/courses")}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
              >
                {t("student.browseCourses")}
              </button>
            </div>
          </motion.div>
        ) : (
          // Course Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {enrolledCourses.map((enrollment: any, index: number) => {
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-gray-300 cursor-pointer group"
                  onClick={() =>
                    navigate(`/course/${enrollment.course._id}/learn`)
                  }
                >
                  {/* Image with Progress Overlay */}
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <img
                      src={enrollment.course.image.url}
                      alt={enrollment.course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/90 rounded-full flex items-center justify-center">
                        <FaPlay className="text-lg sm:text-2xl text-blue-600 ml-1" />
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
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs sm:text-sm font-bold">
                      {enrollment.progressPercentage}%
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-6">
                    <div className="mb-3 sm:mb-4">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                        {enrollment.course.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                        {t("course.by")}{" "}
                        {enrollment.course.instructor?.firstName}{" "}
                        {enrollment.course.instructor?.lastName}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center space-x-1 min-w-0 flex-1 mr-2">
                          <FaBook className="text-xs text-blue-500 flex-shrink-0" />
                          <span className="truncate">
                            {enrollment.completedLessons.length}/
                            {enrollment.course.totalLessons || 0}{" "}
                            {t("course.lessons")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <FaStar className="text-xs text-yellow-400" />
                          <span>
                            {enrollment.rating ||
                              enrollment.course.rating ||
                              "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-500">
                        <FaClock className="text-xs flex-shrink-0" />
                        <span className="truncate">
                          {t("student.lastAccessed")}{" "}
                          {enrollment.lastAccessedAt
                            ? new Date(
                                enrollment.lastAccessedAt
                              ).toLocaleDateString()
                            : t("student.never")}
                        </span>
                      </div>
                    </div>

                    {/* Continue Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/course/${enrollment.course._id}/learn`);
                      }}
                      className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-1 sm:space-x-2 cursor-pointer text-sm sm:text-base"
                    >
                      <FaPlay className="text-xs sm:text-sm flex-shrink-0" />
                      <span className="truncate">
                        {t("student.continueLearning")}
                      </span>
                      <FaArrowRight className="text-xs sm:text-sm flex-shrink-0" />
                    </button>

                    {/* Certificate Badge */}
                    {enrollment.course.originalPrice > 0 && (
                      <div className="mt-2 sm:mt-3 flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-green-600 font-medium">
                        <FaCertificate className="flex-shrink-0" />
                        <span className="text-center">
                          {enrollment.certificateIssued
                            ? t("student.certificateAvailable")
                            : t("student.certificatePending")}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLearning;

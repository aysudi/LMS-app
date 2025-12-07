import React from "react";
import { motion } from "framer-motion";
import {
  FaChartLine,
  FaGraduationCap,
  FaCheck,
  FaTrophy,
  FaCertificate,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useUserEnrollments } from "../../hooks/useEnrollment";

interface ProfileCoursesProps {
  stats: any;
}

const ProfileCourses: React.FC<ProfileCoursesProps> = ({ stats }) => {
  const { t } = useTranslation();
  const { data: enrollmentsData } = useUserEnrollments({
    status: "all",
    sortBy: "lastAccessedAt",
    sortOrder: "desc",
    limit: 50,
  });
  const enrolledCourses = enrollmentsData?.data?.enrollments || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Learning Progress */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaChartLine className="text-purple-600" />
          {t("profile.learning.progressOverview")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {stats?.totalEnrolledCourses || 0}
            </div>
            <div className="text-gray-600 text-sm">
              {t("profile.learning.coursesEnrolled")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600 mb-1">
              {stats?.totalCompletedCourses || 0}
            </div>
            <div className="text-gray-600 text-sm">
              {t("profile.learning.completed")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600 mb-1">
              {Math.floor((stats?.totalWatchTime || 0) / 3600) || 0}h
            </div>
            <div className="text-gray-600 text-sm">
              {t("profile.learning.totalHours")}
            </div>
          </div>
        </div>
      </div>

      {/* Current Courses */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("profile.learning.currentCourses")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {enrolledCourses
            .filter(
              (enrollment: any) =>
                enrollment.status === "active" &&
                enrollment.progressPercentage < 100
            )
            .slice(0, 4)
            .map((enrollment: any, index: number) => (
              <div
                key={enrollment.id || index}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-xl overflow-hidden">
                    {enrollment.course?.image?.url ? (
                      <img
                        src={enrollment.course.image.url}
                        alt={enrollment.course.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <FaGraduationCap />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {enrollment.course?.title || "Course"}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      by {enrollment.course?.instructor?.firstName}{" "}
                      {enrollment.course?.instructor?.lastName}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${enrollment.progressPercentage || 0}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {enrollment.progressPercentage || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

          {enrolledCourses.filter(
            (enrollment: any) =>
              enrollment.status === "active" &&
              enrollment.progressPercentage < 100
          ).length === 0 && (
            <div className="col-span-full text-center py-8">
              <FaGraduationCap className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {t("profile.learning.noCoursesInProgress")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Completed Courses */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("profile.learning.recentlyCompleted")}
        </h3>
        <div className="space-y-3">
          {enrolledCourses
            .filter((enrollment: any) => enrollment.status === "completed")
            .slice(0, 3)
            .map((enrollment: any, index: number) => {
              const completedDate = enrollment.completedAt
                ? new Date(enrollment.completedAt)
                : new Date(enrollment.enrolledAt);

              const timeAgo = Math.floor(
                (Date.now() - completedDate.getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={enrollment.id || index}
                  className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <FaCheck className="text-white text-sm" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {enrollment.course?.title || "Course"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {t("profile.learning.completed")}{" "}
                        {timeAgo === 0
                          ? t("common.today")
                          : `${timeAgo} ${t("common.daysAgo")}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <FaTrophy
                          key={i}
                          className={`text-sm ${
                            i < (enrollment.averageRating || 5)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    {enrollment.certificateIssued && (
                      <button className="ml-3 px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-full transition-colors">
                        <FaCertificate className="mr-1 inline" />
                        {t("common.certificate")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          {enrolledCourses.filter(
            (enrollment: any) => enrollment.status === "completed"
          ).length === 0 && (
            <div className="text-center py-8">
              <FaTrophy className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {t("profile.learning.noCompletedCourses")}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileCourses;

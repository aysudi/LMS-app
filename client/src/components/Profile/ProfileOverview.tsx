import React from "react";
import { motion } from "framer-motion";
import {
  FaUser,
  FaChartLine,
  FaEdit,
  FaCheck,
  FaGraduationCap,
} from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";

interface ProfileOverviewProps {
  user: any;
  stats: any;
}

const ProfileOverview: React.FC<ProfileOverviewProps> = ({ user, stats }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Quick Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Personal Info */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaUser className="text-purple-600" />
            {t("profile.personalInformation")}
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">
                {t("profile.fullName")}
              </label>
              <p className="text-gray-900 font-medium">
                {user.firstName} {user.lastName}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                {t("common.username")}
              </label>
              <p className="text-gray-900 font-medium">@{user.username}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                {t("common.email")}
              </label>
              <p className="text-gray-900 font-medium">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                {t("profile.role")}
              </label>
              <p className="text-gray-900 font-medium capitalize">
                {user.role}
              </p>
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaChartLine className="text-purple-600" />
            {t("profile.recentActivity")}
          </h3>
          <div className="space-y-3">
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity
                .slice(0, 3)
                .map((enrollment: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          enrollment.status === "completed"
                            ? "bg-green-100"
                            : enrollment.progressPercentage > 0
                            ? "bg-blue-100"
                            : "bg-purple-100"
                        }`}
                      >
                        {enrollment.status === "completed" ? (
                          <FaCheck className="text-green-600 text-sm" />
                        ) : enrollment.progressPercentage > 0 ? (
                          <FaChartLine className="text-blue-600 text-sm" />
                        ) : (
                          <FaGraduationCap className="text-purple-600 text-sm" />
                        )}
                      </div>
                      <div>
                        <span className="text-sm text-gray-900 block">
                          {enrollment.status === "completed"
                            ? t("profile.activity.courseCompleted")
                            : enrollment.progressPercentage > 0
                            ? t("profile.activity.courseInProgress")
                            : t("profile.activity.courseStarted")}
                        </span>
                        <span className="text-xs text-gray-500">
                          {enrollment.course?.title || t("common.course")}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(
                        new Date(
                          enrollment.lastAccessedAt || enrollment.enrolledAt
                        ),
                        { addSuffix: true }
                      )}
                    </span>
                  </div>
                ))
            ) : (
              <div className="text-center py-4">
                <FaChartLine className="text-2xl text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {t("profile.activity.noRecentActivity")}
                </p>
                <p className="text-xs text-gray-400">
                  {t("profile.activity.startLearningToSeeActivity")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaEdit className="text-purple-600" />
          {t("profile.aboutMe")}
        </h3>
        <p className="text-gray-700 leading-relaxed">
          {user.bio || t("profile.defaultBio")}
        </p>
      </div>
    </motion.div>
  );
};

export default ProfileOverview;

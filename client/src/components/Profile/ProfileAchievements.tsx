import React from "react";
import { motion } from "framer-motion";
import { FaTrophy } from "react-icons/fa";

interface ProfileAchievementsProps {
  achievements: any[];
  analytics: any;
  stats: any;
  nextAchievement: any;
  t: (key: string) => string;
}

const ProfileAchievements: React.FC<ProfileAchievementsProps> = ({
  achievements,
  analytics,
  stats,
  nextAchievement,
  t,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Achievement Stats */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaTrophy className="text-yellow-500" />
          {t("profile.achievements.overview")}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {achievements.length}
            </div>
            <div className="text-gray-600 text-sm">
              {t("profile.achievements.unlocked")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {analytics?.learningStreak || 0}
            </div>
            <div className="text-gray-600 text-sm">
              {t("profile.achievements.dayStreak")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {stats?.certificatesEarned || 0}
            </div>
            <div className="text-gray-600 text-sm">
              {t("profile.achievements.certificates")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {Math.floor((analytics?.totalWatchTime || 0) / 3600)}h
            </div>
            <div className="text-gray-600 text-sm">
              {t("profile.achievements.totalHours")}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("profile.achievements.recent")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.length > 0 ? (
            achievements.map((achievement, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  achievement.rarity === "gold"
                    ? "bg-yellow-50 border-yellow-300"
                    : achievement.rarity === "silver"
                    ? "bg-gray-50 border-gray-300"
                    : "bg-orange-50 border-orange-300"
                } hover:shadow-md transition-shadow`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {achievement.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {achievement.description}
                  </p>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      achievement.rarity === "gold"
                        ? "bg-yellow-200 text-yellow-800"
                        : achievement.rarity === "silver"
                        ? "bg-gray-200 text-gray-800"
                        : "bg-orange-200 text-orange-800"
                    }`}
                  >
                    {achievement.rarity.toUpperCase()}
                  </span>
                  <div className="text-xs text-gray-500 mt-2">
                    {t("profile.achievements.earned")} {achievement.earned}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <FaTrophy className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                {t("profile.achievements.noAchievements")}
              </p>
              <p className="text-sm text-gray-400">
                {t("profile.achievements.completeCoursesToUnlock")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Progress Towards Next Achievement */}
      {nextAchievement && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("profile.achievements.nextAchievement")}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{nextAchievement.icon}</div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {nextAchievement.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {nextAchievement.description}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-purple-600">
                {nextAchievement.progress}/{nextAchievement.target}
              </span>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-3">
              <div
                className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.round(
                    (nextAchievement.progress / nextAchievement.target) * 100
                  )}%`,
                }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {nextAchievement.target - nextAchievement.progress}{" "}
              {t("profile.achievements.more")}{" "}
              {nextAchievement.type === "courses"
                ? t("common.courses")
                : t("common.days")}{" "}
              {t("profile.achievements.toUnlock")}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProfileAchievements;

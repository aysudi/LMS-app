import { useTranslation } from "react-i18next";
import {
  FaCertificate,
  FaDownload,
  FaFire,
  FaGraduationCap,
  FaRocket,
  FaTrophy,
} from "react-icons/fa";

type RightSidebarProps = {
  analytics: any;
  achievements: any[];
};

const RightSidebar = ({ analytics, achievements }: RightSidebarProps) => {
  const { t } = useTranslation();

  return (
    <div className="lg:col-span-1 space-y-6 order-1 lg:order-2">
      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaRocket className="text-purple-600" />
          {t("profile.quickActions.title")}
        </h3>
        <div className="space-y-3">
          <button className="w-full p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center gap-2">
            <FaGraduationCap />
            {t("profile.quickActions.browseCourses")}
          </button>
          <button className="w-full p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center gap-2">
            <FaCertificate />
            {t("profile.quickActions.viewCertificates")}
          </button>
          <button className="w-full p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center gap-2">
            <FaDownload />
            {t("profile.quickActions.downloadProgress")}
          </button>
        </div>
      </div>

      {/* Learning Streak */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaFire className="text-orange-500" />
          {t("profile.learningStreak.title")}
        </h3>
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-500 mb-2">
            {analytics?.learningStreak || 0}
          </div>
          <p className="text-gray-600 text-sm">
            {t("profile.learningStreak.daysInRow")}
          </p>
          <div className="mt-4 bg-orange-50 rounded-xl p-3">
            <p className="text-orange-700 text-xs font-medium">
              {(analytics?.learningStreak || 0) > 0
                ? t("profile.learningStreak.keepItUp")
                : t("profile.learningStreak.startToday")}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaTrophy className="text-yellow-500" />
          {t("profile.recentAchievements.title")}
        </h3>
        <div className="space-y-3">
          {achievements.length > 0 ? (
            achievements.slice(0, 2).map((achievement, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  achievement.rarity === "gold"
                    ? "bg-yellow-50"
                    : achievement.rarity === "silver"
                    ? "bg-gray-50"
                    : "bg-orange-50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    achievement.rarity === "gold"
                      ? "bg-yellow-100"
                      : achievement.rarity === "silver"
                      ? "bg-gray-100"
                      : "bg-orange-100"
                  }`}
                >
                  <span className="text-sm">{achievement.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {achievement.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {achievement.description}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <FaTrophy className="text-2xl text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                {t("profile.recentAchievements.noAchievements")}
              </p>
              <p className="text-xs text-gray-400">
                {t("profile.recentAchievements.completeCoursesToUnlock")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;

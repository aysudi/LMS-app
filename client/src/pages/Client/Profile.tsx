import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaCog } from "react-icons/fa";
import { useAuthContext } from "../../context/AuthContext";
import { useUpdateProfile } from "../../hooks/useProfile";
import { useLearningStats } from "../../hooks/useEnrollment";
import { useLearningAnalytics } from "../../hooks/useUserProgress";
// @ts-ignore
import { useTranslation } from "react-i18next";
import ProfileSettings from "../../components/Profile/ProfileSettings";
import ProfileAchievements from "../../components/Profile/ProfileAchievements";
import ProfileCourses from "../../components/Profile/ProfileCourses";
import ProfileOverview from "../../components/Profile/ProfileOverview";
import HeroSection from "../../components/Profile/HeroSection";
import ProfileTabs from "../../components/Profile/ProfileTabs";
import RightSidebar from "../../components/Profile/RightSidebar";
import ModalContent from "../../components/Profile/ModalContent";

const Profile: React.FC = () => {
  const { user } = useAuthContext();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    username: user?.username || "",
    bio: user?.bio || "",
  });

  React.useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const updateProfileMutation = useUpdateProfile();

  const { data: statsData } = useLearningStats();
  const { data: analyticsData } = useLearningAnalytics();

  const stats = statsData?.data;
  const analytics = analyticsData?.data;

  const achievements = React.useMemo(() => {
    if (!stats || !analytics) return [];

    const userAchievements = [];

    if (stats.totalCompletedCourses >= 1) {
      userAchievements.push({
        name: t("profile.achievements.firstSteps"),
        description: t("profile.achievements.firstStepsDesc"),
        icon: "🎯",
        rarity: "bronze" as const,
        earned: t("profile.achievements.courseCompleted"),
        unlocked: true,
      });
    }

    if (stats.totalCompletedCourses >= 5) {
      userAchievements.push({
        name: t("profile.achievements.learningEnthusiast"),
        description: t("profile.achievements.learningEnthusiastDesc"),
        icon: "📚",
        rarity: "silver" as const,
        earned: t("profile.achievements.coursesCompleted", { count: 5 }),
        unlocked: true,
      });
    }

    if (stats.totalCompletedCourses >= 10) {
      userAchievements.push({
        name: t("profile.achievements.courseMaster"),
        description: t("profile.achievements.courseMasterDesc"),
        icon: "🏆",
        rarity: "gold" as const,
        earned: t("profile.achievements.coursesCompleted", {
          count: stats.totalCompletedCourses,
        }),
        unlocked: true,
      });
    }

    if (analytics.learningStreak >= 3) {
      userAchievements.push({
        name: t("profile.achievements.consistentLearner"),
        description: t("profile.achievements.consistentLearnerDesc"),
        icon: "🔥",
        rarity: "bronze" as const,
        earned: t("profile.achievements.daysStreak", {
          count: analytics.learningStreak,
        }),
        unlocked: true,
      });
    }

    if (analytics.learningStreak >= 7) {
      userAchievements.push({
        name: t("profile.achievements.weekWarrior"),
        description: t("profile.achievements.weekWarriorDesc"),
        icon: "⚡",
        rarity: "silver" as const,
        earned: t("profile.achievements.daysStreak", {
          count: analytics.learningStreak,
        }),
        unlocked: true,
      });
    }

    if (analytics.learningStreak >= 30) {
      userAchievements.push({
        name: t("profile.achievements.monthlyMaster"),
        description: t("profile.achievements.monthlyMasterDesc"),
        icon: "👑",
        rarity: "gold" as const,
        earned: t("profile.achievements.daysStreak", {
          count: analytics.learningStreak,
        }),
        unlocked: true,
      });
    }

    const totalHours = Math.floor(analytics.totalWatchTime / 3600);
    if (totalHours >= 10) {
      userAchievements.push({
        name: t("profile.achievements.dedicatedStudent"),
        description: t("profile.achievements.dedicatedStudentDesc"),
        icon: "⏱️",
        rarity: "bronze" as const,
        earned: t("profile.achievements.hoursWatched", { count: totalHours }),
        unlocked: true,
      });
    }

    if (totalHours >= 50) {
      userAchievements.push({
        name: t("profile.achievements.timeInvestor"),
        description: t("profile.achievements.timeInvestorDesc"),
        icon: "⏰",
        rarity: "silver" as const,
        earned: t("profile.achievements.hoursWatched", { count: totalHours }),
        unlocked: true,
      });
    }

    if (totalHours >= 100) {
      userAchievements.push({
        name: t("profile.achievements.learningMachine"),
        description: t("profile.achievements.learningMachineDesc"),
        icon: "🤖",
        rarity: "gold" as const,
        earned: t("profile.achievements.hoursWatched", { count: totalHours }),
        unlocked: true,
      });
    }

    if (stats.certificatesEarned >= 1) {
      userAchievements.push({
        name: t("profile.achievements.certified"),
        description: t("profile.achievements.certifiedDesc"),
        icon: "📜",
        rarity: "silver" as const,
        earned: t("profile.achievements.certificatesEarned", {
          count: stats.certificatesEarned,
        }),
        unlocked: true,
      });
    }

    if (stats.certificatesEarned >= 5) {
      userAchievements.push({
        name: t("profile.achievements.certificateCollector"),
        description: t("profile.achievements.certificateCollectorDesc"),
        icon: "🏅",
        rarity: "gold" as const,
        earned: t("profile.achievements.certificatesEarned", {
          count: stats.certificatesEarned,
        }),
        unlocked: true,
      });
    }

    if (analytics.totalLessonsCompleted >= 50) {
      userAchievements.push({
        name: t("profile.achievements.lessonMaster"),
        description: t("profile.achievements.lessonMasterDesc"),
        icon: "🎓",
        rarity: "silver" as const,
        earned: t("profile.achievements.lessonsCompleted", {
          count: analytics.totalLessonsCompleted,
        }),
        unlocked: true,
      });
    }

    if (analytics.totalLessonsCompleted >= 100) {
      userAchievements.push({
        name: t("profile.achievements.knowledgeSeeker"),
        description: t("profile.achievements.knowledgeSeekerDesc"),
        icon: "🧠",
        rarity: "gold" as const,
        earned: t("profile.achievements.lessonsCompleted", {
          count: analytics.totalLessonsCompleted,
        }),
        unlocked: true,
      });
    }

    return userAchievements.sort((a, b) => {
      const rarityOrder = { gold: 3, silver: 2, bronze: 1 };
      return rarityOrder[b.rarity] - rarityOrder[a.rarity];
    });
  }, [stats, analytics]);

  const nextAchievement = React.useMemo(() => {
    if (!stats || !analytics) return null;

    const currentCourses = stats.totalCompletedCourses;
    const currentStreak = analytics.learningStreak;

    if (currentCourses < 1) {
      return {
        name: t("profile.achievements.firstSteps"),
        description: t("profile.achievements.firstStepsDesc"),
        icon: "🎯",
        progress: 0,
        target: 1,
        type: "courses",
      };
    } else if (currentCourses < 5) {
      return {
        name: t("profile.achievements.learningEnthusiast"),
        description: t("profile.achievements.learningEnthusiastDesc"),
        icon: "📚",
        progress: currentCourses,
        target: 5,
        type: "courses",
      };
    } else if (currentCourses < 10) {
      return {
        name: t("profile.achievements.courseMaster"),
        description: t("profile.achievements.courseMasterDesc"),
        icon: "🏆",
        progress: currentCourses,
        target: 10,
        type: "courses",
      };
    } else if (currentCourses < 20) {
      return {
        name: t("profile.achievements.marathonLearner"),
        description: t("profile.achievements.marathonLearnerDesc"),
        icon: "🏃",
        progress: currentCourses,
        target: 20,
        type: "courses",
      };
    }

    if (currentStreak < 7) {
      return {
        name: t("profile.achievements.weekWarrior"),
        description: t("profile.achievements.weekWarriorGoal"),
        icon: "⚡",
        progress: currentStreak,
        target: 7,
        type: "streak",
      };
    } else if (currentStreak < 30) {
      return {
        name: t("profile.achievements.monthlyMaster"),
        description: t("profile.achievements.monthlyMasterGoal"),
        icon: "👑",
        progress: currentStreak,
        target: 30,
        type: "streak",
      };
    }

    return null;
  }, [stats, analytics]);

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProfileForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("profile.loadingProfile")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      {/* Hero Section - Enhanced Elegant Design */}
      <HeroSection
        fileInputRef={fileInputRef}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        user={user}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {/* Course Content */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              {/* Tabs - Mobile Responsive */}
              <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

              {/* Tab Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === "overview" && (
                    <ProfileOverview user={user} stats={stats} />
                  )}

                  {/* Other tabs content will be in Part 2 */}
                  {activeTab === "courses" && <ProfileCourses stats={stats} />}

                  {activeTab === "achievements" && (
                    <ProfileAchievements
                      achievements={achievements}
                      analytics={analytics}
                      stats={stats}
                      nextAchievement={nextAchievement}
                      t={t}
                    />
                  )}

                  {activeTab === "settings" && (
                    <ProfileSettings
                      user={user}
                      profileForm={profileForm}
                      handleProfileChange={handleProfileChange}
                      handleUpdateProfile={handleUpdateProfile}
                      updateProfileMutation={updateProfileMutation}
                    />
                  )}

                  {activeTab !== "overview" &&
                    activeTab !== "courses" &&
                    activeTab !== "achievements" &&
                    activeTab !== "settings" && (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">
                          <FaCog />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                          Coming Soon
                        </h3>
                        <p className="text-gray-500 text-center">
                          This section will be updated in Part 2 of the
                          redesign.
                        </p>
                      </div>
                    )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <RightSidebar analytics={analytics} achievements={achievements} />
        </div>
      </div>

      {/* Enhanced Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/39 flex items-center justify-center z-50 p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl sm:rounded-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  {t("profile.editProfile")}
                </h3>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form to original values
                    setProfileForm({
                      firstName: user?.firstName || "",
                      lastName: user?.lastName || "",
                      username: user?.username || "",
                      bio: user?.bio || "",
                    });
                  }}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span className="text-white text-lg">×</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <ModalContent
              user={user}
              profileForm={profileForm}
              handleProfileChange={handleProfileChange}
              fileInputRef={fileInputRef}
            />

            {/* Modal Footer */}
            <form onSubmit={handleUpdateProfile}>
              <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 rounded-b-xl sm:rounded-b-2xl flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form to original values
                    setProfileForm({
                      firstName: user?.firstName || "",
                      lastName: user?.lastName || "",
                      username: user?.username || "",
                      bio: user?.bio || "",
                    });
                  }}
                  className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:cursor-not-allowed cursor-pointer"
                >
                  <FaCheck className="text-sm" />
                  {updateProfileMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Profile;

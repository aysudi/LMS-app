import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaEdit,
  FaCamera,
  FaCalendarAlt,
  FaEnvelope,
  FaCheck,
  FaGraduationCap,
  FaTrophy,
  FaCog,
  FaChartLine,
  FaRocket,
  FaFire,
  FaCertificate,
  FaDownload,
  FaLock,
} from "react-icons/fa";
import { useAuthContext } from "../../context/AuthContext";
import {
  useUpdateProfile,
  useChangePassword,
  useUpdateAvatar,
} from "../../hooks/useProfile";
import {
  useUserEnrollments,
  useLearningStats,
} from "../../hooks/useEnrollment";
import { useLearningAnalytics } from "../../hooks/useUserProgress";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
// @ts-ignore
import { useTranslation } from "react-i18next";

const Profile: React.FC = () => {
  const { user } = useAuthContext();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
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

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const updateAvatarMutation = useUpdateAvatar();

  const { data: enrollmentsData } = useUserEnrollments({
    status: "all",
    sortBy: "lastAccessedAt",
    sortOrder: "desc",
    limit: 50,
  });
  const { data: statsData } = useLearningStats();
  const { data: analyticsData } = useLearningAnalytics();

  const enrolledCourses = enrollmentsData?.data?.enrollments || [];
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

  const userRank = React.useMemo(() => {
    if (!stats || !analytics) return t("profile.ranks.newLearner");

    const totalCourses = stats.totalCompletedCourses;
    const streak = analytics.learningStreak;
    const certificates = stats.certificatesEarned;
    const totalHours = Math.floor(analytics.totalWatchTime / 3600);

    if (totalCourses >= 20 && streak >= 30 && certificates >= 10) {
      return t("profile.ranks.masterLearner");
    } else if (totalCourses >= 10 && (streak >= 14 || certificates >= 5)) {
      return t("profile.ranks.expertLearner");
    } else if (totalCourses >= 5 && (streak >= 7 || certificates >= 2)) {
      return t("profile.ranks.advancedLearner");
    } else if (totalCourses >= 2 || streak >= 3 || totalHours >= 10) {
      return t("profile.ranks.activeLearner");
    } else if (totalCourses >= 1 || analytics.totalLessonsCompleted >= 10) {
      return t("profile.ranks.beginnerLearner");
    }

    return t("profile.ranks.newLearner");
  }, [stats, analytics, t]);

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProfileForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
    setIsEditing(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t("profile.errors.passwordsDontMatch"));
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
    setIsChangingPassword(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("profile.errors.invalidImageFile"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("profile.errors.imageTooLarge"));
      return;
    }

    updateAvatarMutation.mutate(file);
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
      <div className="relative bg-gradient-to-r from-white via-purple-50/30 to-indigo-50/40 border-b border-gray-100 overflow-hidden">
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.1),transparent_70%)] opacity-60"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(79,70,229,0.08),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/40 to-transparent"></div>
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-gradient-to-bl from-purple-200/30 via-indigo-100/20 to-transparent rounded-full blur-3xl transform rotate-12"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[350px] bg-gradient-to-tr from-blue-200/25 via-purple-100/15 to-transparent rounded-full blur-3xl transform -rotate-12"></div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-indigo-300/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-br from-blue-200/15 to-purple-200/20 rounded-full blur-xl animate-pulse delay-1000"></div>

        {/* Main Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Left Side - Avatar & Basic Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-shrink-0 text-center lg:text-left"
            >
              {/* Enhanced Avatar */}
              <div className="relative inline-block mb-6">
                {/* Avatar Ring */}
                <div className="w-36 h-36 rounded-3xl bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600 p-1 shadow-2xl ring-4 ring-white/50">
                  <div className="w-full h-full rounded-[22px] bg-white flex items-center justify-center text-purple-600 text-4xl font-bold overflow-hidden relative">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-full h-full object-cover rounded-[22px]"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-600">
                        {user.avatarOrInitials}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>

                {/* Enhanced Camera Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={updateAvatarMutation.isPending}
                  className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 cursor-pointer disabled:cursor-not-allowed ring-4 ring-white/30"
                >
                  <FaCamera className="text-sm" />
                </button>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              {/* Enhanced User Info */}
              <div className="mb-8">
                <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent mb-3 leading-tight">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-xl text-gray-600 mb-4 font-medium">
                  @{user.username}
                </p>

                {/* Enhanced Role Badge */}
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-100 via-purple-50 to-indigo-100 border border-purple-200/50 text-purple-800 rounded-2xl text-sm font-semibold shadow-lg backdrop-blur-sm">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-pulse shadow-md"></div>
                  <span className="text-purple-700">
                    {user.role === "instructor"
                      ? "🎓 Instructor"
                      : "📚 Student"}
                  </span>
                  {userRank && (
                    <>
                      <div className="w-1 h-4 bg-purple-300 rounded-full"></div>
                      <span className="text-indigo-700 text-xs font-medium">
                        {userRank}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Enhanced Edit Button */}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-700 hover:via-purple-800 hover:to-indigo-700 text-white font-semibold rounded-2xl flex items-center gap-3 shadow-xl transition-all duration-300 hover:shadow-2xl transform hover:scale-105 cursor-pointer mx-auto lg:mx-0 ring-2 ring-purple-200/50"
              >
                <FaEdit className="text-sm" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </motion.div>

            {/* Right Side - Stats & Meta Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-1 w-full"
            >
              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="group bg-gradient-to-br from-white/90 via-white/80 to-purple-50/80 backdrop-blur-sm rounded-2xl p-5 border border-purple-100 hover:border-purple-200 hover:shadow-xl transition-all duration-500 text-center transform hover:scale-105 cursor-pointer"
                >
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stats?.totalEnrolledCourses || 0}
                  </div>
                  <div className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                    {t("profile.stats.courses")}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="group bg-gradient-to-br from-white/90 via-white/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl p-5 border border-indigo-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-500 text-center transform hover:scale-105 cursor-pointer"
                >
                  <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stats?.averageProgress || 0}%
                  </div>
                  <div className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                    {t("profile.stats.progress")}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="group bg-gradient-to-br from-white/90 via-white/80 to-emerald-50/80 backdrop-blur-sm rounded-2xl p-5 border border-emerald-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-500 text-center transform hover:scale-105 cursor-pointer"
                >
                  <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stats?.certificatesEarned || 0}
                  </div>
                  <div className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                    {t("profile.stats.certificates")}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="group bg-gradient-to-br from-white/90 via-white/80 to-amber-50/80 backdrop-blur-sm rounded-2xl p-5 border border-amber-100 hover:border-amber-200 hover:shadow-xl transition-all duration-500 text-center transform hover:scale-105 cursor-pointer"
                >
                  <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                    {Math.floor((analytics?.totalWatchTime || 0) / 3600) || 0}h
                  </div>
                  <div className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                    {t("profile.stats.hours")}
                  </div>
                </motion.div>
              </div>

              {/* Meta Information */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FaCalendarAlt className="text-purple-600 text-sm" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">
                        {t("profile.joined")}
                      </div>
                      <div className="font-medium text-gray-900">
                        {new Date(user.createdAt || "").toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <FaEnvelope className="text-indigo-600 text-sm" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">
                        {t("common.email")}
                      </div>
                      <div className="font-medium text-gray-900 truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <FaCheck className="text-emerald-600 text-sm" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">
                        {t("common.status")}
                      </div>
                      <div className="font-medium text-emerald-700">
                        {user.isEmailVerified
                          ? t("profile.verified")
                          : t("profile.pending")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <FaTrophy className="text-amber-600 text-sm" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">
                        {t("profile.rank")}
                      </div>
                      <div className="font-medium text-gray-900">
                        {userRank}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    {t("profile.about")}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {user.bio || t("profile.noBioAvailable")}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {/* Course Content */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              {/* Tabs - Mobile Responsive */}
              <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 sm:scrollbar-none">
                  <div className="flex min-w-max px-2 sm:px-0">
                    {[
                      {
                        id: "overview",
                        label: t("profile.tabs.overview"),
                        shortLabel: "Overview",
                        icon: FaUser,
                      },
                      {
                        id: "courses",
                        label: t("profile.tabs.myLearning"),
                        shortLabel: "Courses",
                        icon: FaGraduationCap,
                      },
                      {
                        id: "achievements",
                        label: t("profile.tabs.achievements"),
                        shortLabel: "Awards",
                        icon: FaTrophy,
                      },
                      {
                        id: "settings",
                        label: t("profile.tabs.settings"),
                        shortLabel: "Settings",
                        icon: FaCog,
                      },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-3 sm:py-4 px-3 sm:px-6 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center gap-1 sm:gap-2 whitespace-nowrap min-w-0 ${
                          activeTab === tab.id
                            ? "border-purple-600 text-purple-700 bg-purple-50"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <tab.icon className="text-xs sm:text-sm flex-shrink-0" />
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden text-xs">
                          {tab.shortLabel}
                        </span>
                      </button>
                    ))}
                  </div>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === "overview" && (
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
                              <p className="text-gray-900 font-medium">
                                @{user.username}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                {t("common.email")}
                              </label>
                              <p className="text-gray-900 font-medium">
                                {user.email}
                              </p>
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
                            {stats?.recentActivity &&
                            stats.recentActivity.length > 0 ? (
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
                                        ) : enrollment.progressPercentage >
                                          0 ? (
                                          <FaChartLine className="text-blue-600 text-sm" />
                                        ) : (
                                          <FaGraduationCap className="text-purple-600 text-sm" />
                                        )}
                                      </div>
                                      <div>
                                        <span className="text-sm text-gray-900 block">
                                          {enrollment.status === "completed"
                                            ? t(
                                                "profile.activity.courseCompleted"
                                              )
                                            : enrollment.progressPercentage > 0
                                            ? t(
                                                "profile.activity.courseInProgress"
                                              )
                                            : t(
                                                "profile.activity.courseStarted"
                                              )}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {enrollment.course?.title ||
                                            t("common.course")}
                                        </span>
                                      </div>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {formatDistanceToNow(
                                        new Date(
                                          enrollment.lastAccessedAt ||
                                            enrollment.enrolledAt
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
                                  {t(
                                    "profile.activity.startLearningToSeeActivity"
                                  )}
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
                  )}

                  {/* Other tabs content will be in Part 2 */}
                  {activeTab === "courses" && (
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
                              {Math.floor(
                                (stats?.totalWatchTime || 0) / 3600
                              ) || 0}
                              h
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
                                      by{" "}
                                      {enrollment.course?.instructor?.firstName}{" "}
                                      {enrollment.course?.instructor?.lastName}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div
                                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                                          style={{
                                            width: `${
                                              enrollment.progressPercentage || 0
                                            }%`,
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
                            .filter(
                              (enrollment: any) =>
                                enrollment.status === "completed"
                            )
                            .slice(0, 3)
                            .map((enrollment: any, index: number) => {
                              const completedDate = enrollment.completedAt
                                ? new Date(enrollment.completedAt)
                                : new Date(enrollment.enrolledAt);

                              const timeAgo = Math.floor(
                                (Date.now() - completedDate.getTime()) /
                                  (1000 * 60 * 60 * 24)
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
                            (enrollment: any) =>
                              enrollment.status === "completed"
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
                  )}

                  {activeTab === "achievements" && (
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
                              {Math.floor(
                                (analytics?.totalWatchTime || 0) / 3600
                              )}
                              h
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
                                  <div className="text-3xl mb-2">
                                    {achievement.icon}
                                  </div>
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
                                    {t("profile.achievements.earned")}{" "}
                                    {achievement.earned}
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
                                {t(
                                  "profile.achievements.completeCoursesToUnlock"
                                )}
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
                                <div className="text-2xl">
                                  {nextAchievement.icon}
                                </div>
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
                                {nextAchievement.progress}/
                                {nextAchievement.target}
                              </span>
                            </div>
                            <div className="w-full bg-purple-200 rounded-full h-3">
                              <div
                                className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.round(
                                    (nextAchievement.progress /
                                      nextAchievement.target) *
                                      100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <p className="text-sm text-gray-600">
                              {nextAchievement.target -
                                nextAchievement.progress}{" "}
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
                  )}

                  {activeTab === "settings" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      {/* Profile Settings */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <FaUser className="text-purple-600" />
                          {t("profile.settings.profileSettings")}
                        </h3>
                        <form
                          onSubmit={handleUpdateProfile}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t("profile.settings.firstName")}
                              </label>
                              <input
                                type="text"
                                name="firstName"
                                value={profileForm.firstName}
                                onChange={handleProfileChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t("profile.settings.lastName")}
                              </label>
                              <input
                                type="text"
                                name="lastName"
                                value={profileForm.lastName}
                                onChange={handleProfileChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t("common.username")}
                            </label>
                            <input
                              type="text"
                              name="username"
                              value={profileForm.username}
                              onChange={handleProfileChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t("profile.settings.bio")}
                            </label>
                            <textarea
                              rows={3}
                              name="bio"
                              value={profileForm.bio}
                              onChange={handleProfileChange}
                              placeholder={t("profile.settings.bioPlaceholder")}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={updateProfileMutation.isPending}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-md transition-colors disabled:cursor-not-allowed cursor-pointer"
                          >
                            {updateProfileMutation.isPending
                              ? t("common.saving")
                              : t("profile.settings.saveChanges")}
                          </button>
                        </form>
                      </div>

                      {/* Account Settings */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <FaCog className="text-purple-600" />
                          {t("profile.settings.accountSettings")}
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t("profile.settings.emailAddress")}
                            </label>
                            <div className="flex gap-3">
                              <input
                                type="email"
                                defaultValue={user.email}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                              {user.isEmailVerified ? (
                                <span className="px-3 py-2 bg-green-100 text-green-800 text-sm rounded-md flex items-center gap-1">
                                  <FaCheck className="text-xs" />
                                  {t("profile.verified")}
                                </span>
                              ) : (
                                <button className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-md">
                                  {t("profile.settings.verify")}
                                </button>
                              )}
                            </div>
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() =>
                                setIsChangingPassword(!isChangingPassword)
                              }
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                            >
                              {t("profile.settings.changePassword")}
                            </button>
                          </div>

                          {/* Password Change Form */}
                          {isChangingPassword && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FaLock className="text-blue-600 text-sm" />
                                  </div>
                                  {t("profile.settings.changePassword")}
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => setIsChangingPassword(false)}
                                  className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  <span className="text-xl">×</span>
                                </button>
                              </div>

                              <form
                                onSubmit={handleChangePassword}
                                className="space-y-4"
                              >
                                <div className="grid grid-cols-1 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      {t("profile.settings.currentPassword")}
                                    </label>
                                    <input
                                      type="password"
                                      name="currentPassword"
                                      value={passwordForm.currentPassword}
                                      onChange={handlePasswordChange}
                                      required
                                      placeholder={t(
                                        "profile.settings.enterCurrentPassword"
                                      )}
                                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                                    />
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t("profile.settings.newPassword")}
                                      </label>
                                      <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordForm.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        minLength={6}
                                        placeholder={t(
                                          "profile.settings.enterNewPassword"
                                        )}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t("profile.settings.confirmPassword")}
                                      </label>
                                      <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordForm.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        minLength={6}
                                        placeholder={t(
                                          "profile.settings.confirmPasswordPlaceholder"
                                        )}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-blue-200">
                                  <button
                                    type="button"
                                    onClick={() => setIsChangingPassword(false)}
                                    className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-all duration-200 font-medium"
                                  >
                                    {t("common.cancel")}
                                  </button>
                                  <button
                                    type="submit"
                                    disabled={changePasswordMutation.isPending}
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 font-medium flex items-center gap-2 shadow-md"
                                  >
                                    {changePasswordMutation.isPending ? (
                                      <>
                                        <motion.div
                                          animate={{ rotate: 360 }}
                                          transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            ease: "linear",
                                          }}
                                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                        />
                                        {t("profile.settings.changing")}
                                      </>
                                    ) : (
                                      <>
                                        <FaCheck className="text-sm" />
                                        {t("profile.settings.changePassword")}
                                      </>
                                    )}
                                  </button>
                                </div>
                              </form>

                              {/* Password Requirements */}
                              <div className="mt-4 p-4 bg-white/60 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  {t("profile.settings.passwordRequirements")}
                                </p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  <li>
                                    • {t("profile.settings.atLeast6Characters")}
                                  </li>
                                  <li>
                                    • {t("profile.settings.useStrongPassword")}
                                  </li>
                                  <li>
                                    •{" "}
                                    {t(
                                      "profile.settings.considerPasswordManager"
                                    )}
                                  </li>
                                </ul>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* Notification Settings */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <FaEnvelope className="text-purple-600" />
                          {t("profile.settings.notificationPreferences")}
                        </h3>
                        <div className="space-y-4">
                          {[
                            {
                              label: t(
                                "profile.settings.notifications.courseUpdates.label"
                              ),
                              description: t(
                                "profile.settings.notifications.courseUpdates.description"
                              ),
                            },
                            {
                              label: t(
                                "profile.settings.notifications.achievements.label"
                              ),
                              description: t(
                                "profile.settings.notifications.achievements.description"
                              ),
                            },
                            {
                              label: t(
                                "profile.settings.notifications.reminders.label"
                              ),
                              description: t(
                                "profile.settings.notifications.reminders.description"
                              ),
                            },
                            {
                              label: t(
                                "profile.settings.notifications.marketing.label"
                              ),
                              description: t(
                                "profile.settings.notifications.marketing.description"
                              ),
                            },
                          ].map((setting, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {setting.label}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {setting.description}
                                </p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  defaultChecked={index < 2}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Danger Zone */}
                      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-red-900 mb-4">
                          {t("profile.settings.dangerZone")}
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-red-900">
                                {t("profile.settings.deleteAccount")}
                              </h4>
                              <p className="text-sm text-red-700">
                                {t("profile.settings.deleteAccountDescription")}
                              </p>
                            </div>
                            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors">
                              {t("profile.settings.deleteAccount")}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
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
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Avatar Section */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-lg sm:text-2xl font-bold mx-auto mb-4 overflow-hidden">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.avatarOrInitials
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={updateAvatarMutation.isPending}
                    className="absolute -bottom-1 -right-1 sm:bottom-4 sm:right-0 w-7 h-7 sm:w-8 sm:h-8 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-full flex items-center justify-center shadow-lg transition-colors disabled:cursor-not-allowed cursor-pointer"
                  >
                    <FaCamera className="text-xs sm:text-sm" />
                  </button>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                  Personal Information
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={profileForm.firstName}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={profileForm.lastName}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={profileForm.username}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <input
                        type="email"
                        defaultValue={user.email}
                        className="flex-1 px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                      />
                      {user.isEmailVerified ? (
                        <span className="px-3 py-2 bg-green-100 text-green-800 text-xs sm:text-sm rounded-lg flex items-center justify-center gap-1 whitespace-nowrap">
                          <FaCheck className="text-xs" />
                          Verified
                        </span>
                      ) : (
                        <button className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-xs sm:text-sm rounded-lg whitespace-nowrap">
                          Verify
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      rows={3}
                      name="bio"
                      value={profileForm.bio}
                      onChange={handleProfileChange}
                      placeholder="Tell us about yourself, your interests, and learning goals..."
                      className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
            </div>

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

import React, { type SetStateAction } from "react";
import toast from "react-hot-toast";
import {
  FaCalendarAlt,
  FaCamera,
  FaCheck,
  FaEdit,
  FaEnvelope,
  FaTrophy,
} from "react-icons/fa";
import { useLearningStats } from "../../hooks/useEnrollment";
import { useLearningAnalytics } from "../../hooks/useUserProgress";
import { useTranslation } from "react-i18next";
import { useUpdateAvatar } from "../../hooks/useProfile";
import { motion } from "framer-motion";

type HeroSectionProps = {
  user: any;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isEditing: boolean;
  setIsEditing: React.Dispatch<SetStateAction<boolean>>;
};

const HeroSection: React.FC<HeroSectionProps> = ({
  user,
  fileInputRef,
  isEditing,
  setIsEditing,
}) => {
  const { t } = useTranslation();
  const { data: statsData } = useLearningStats();
  const { data: analyticsData } = useLearningAnalytics();

  const stats = statsData?.data;
  const analytics = analyticsData?.data;

  const updateAvatarMutation = useUpdateAvatar();

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

  return (
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
                  {user.role === "instructor" ? "🎓 Instructor" : "📚 Student"}
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
                    <div className="font-medium text-gray-900">{userRank}</div>
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
  );
};

export default HeroSection;

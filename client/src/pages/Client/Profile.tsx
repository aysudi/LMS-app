import React, { useState } from "react";
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
} from "react-icons/fa";
import { useAuthContext } from "../../context/AuthContext";

const Profile: React.FC = () => {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Professional & Elegant Design */}
      <div className="relative bg-white border-b border-gray-200 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/30"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-100/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-indigo-100/20 to-transparent rounded-full blur-3xl"></div>

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
              {/* Avatar */}
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 p-1 shadow-xl">
                  <div className="w-full h-full rounded-xl bg-white flex items-center justify-center text-purple-600 text-4xl font-bold overflow-hidden">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      user.avatarOrInitials
                    )}
                  </div>
                </div>

                {/* Camera Button */}
                <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer">
                  <FaCamera className="text-sm" />
                </button>
              </div>

              {/* Basic User Info */}
              <div className="mb-6">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-lg text-gray-600 mb-3">@{user.username}</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  {user.role === "instructor" ? "Instructor" : "Student"}
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer mx-auto lg:mx-0"
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
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-300 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    12
                  </div>
                  <div className="text-gray-600 text-sm font-medium">
                    Courses
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-300 text-center">
                  <div className="text-2xl font-bold text-indigo-600 mb-1">
                    85%
                  </div>
                  <div className="text-gray-600 text-sm font-medium">
                    Progress
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-300 text-center">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">
                    24
                  </div>
                  <div className="text-gray-600 text-sm font-medium">
                    Certificates
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-300 text-center">
                  <div className="text-2xl font-bold text-amber-600 mb-1">
                    7d
                  </div>
                  <div className="text-gray-600 text-sm font-medium">
                    Streak
                  </div>
                </div>
              </div>

              {/* Meta Information */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FaCalendarAlt className="text-purple-600 text-sm" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Joined</div>
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
                      <div className="text-sm text-gray-500">Email</div>
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
                      <div className="text-sm text-gray-500">Status</div>
                      <div className="font-medium text-emerald-700">
                        {user.isEmailVerified ? "Verified" : "Pending"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <FaTrophy className="text-amber-600 text-sm" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Rank</div>
                      <div className="font-medium text-gray-900">
                        Advanced Learner
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    About
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Welcome to my learning journey! I'm passionate about
                    technology and continuous learning. Always excited to
                    explore new topics and share knowledge with the community.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Course Content */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex">
                  {[
                    { id: "overview", label: "Overview", icon: FaUser },
                    {
                      id: "courses",
                      label: "My Learning",
                      icon: FaGraduationCap,
                    },
                    {
                      id: "achievements",
                      label: "Achievements",
                      icon: FaTrophy,
                    },
                    { id: "settings", label: "Settings", icon: FaCog },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors cursor-pointer flex items-center gap-2 ${
                        activeTab === tab.id
                          ? "border-purple-600 text-purple-700 bg-purple-50"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <tab.icon className="text-sm" />
                      {tab.label}
                    </button>
                  ))}
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Info */}
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FaUser className="text-purple-600" />
                            Personal Information
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Full Name
                              </label>
                              <p className="text-gray-900 font-medium">
                                {user.firstName} {user.lastName}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Username
                              </label>
                              <p className="text-gray-900 font-medium">
                                @{user.username}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Email
                              </label>
                              <p className="text-gray-900 font-medium">
                                {user.email}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Role
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
                            Recent Activity
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <FaCheck className="text-green-600 text-sm" />
                                </div>
                                <span className="text-sm text-gray-900">
                                  Course Completed
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                2 days ago
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <FaTrophy className="text-indigo-600 text-sm" />
                                </div>
                                <span className="text-sm text-gray-900">
                                  Achievement Earned
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                1 week ago
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                  <FaGraduationCap className="text-purple-600 text-sm" />
                                </div>
                                <span className="text-sm text-gray-900">
                                  New Course Started
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                2 weeks ago
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bio Section */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <FaEdit className="text-purple-600" />
                          About Me
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          Welcome to my learning journey! I'm passionate about
                          technology and continuous learning.
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
                          Learning Progress Overview
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600 mb-1">
                              12
                            </div>
                            <div className="text-gray-600 text-sm">
                              Courses Enrolled
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-indigo-600 mb-1">
                              8
                            </div>
                            <div className="text-gray-600 text-sm">
                              Completed
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-emerald-600 mb-1">
                              147h
                            </div>
                            <div className="text-gray-600 text-sm">
                              Total Hours
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Current Courses */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Current Courses
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            {
                              name: "Advanced React Development",
                              progress: 75,
                              instructor: "John Doe",
                              thumbnail: "🚀",
                            },
                            {
                              name: "Machine Learning Fundamentals",
                              progress: 45,
                              instructor: "Jane Smith",
                              thumbnail: "🤖",
                            },
                            {
                              name: "Node.js Backend Development",
                              progress: 90,
                              instructor: "Mike Johnson",
                              thumbnail: "⚡",
                            },
                            {
                              name: "UI/UX Design Principles",
                              progress: 30,
                              instructor: "Sarah Wilson",
                              thumbnail: "🎨",
                            },
                          ].map((course, index) => (
                            <div
                              key={index}
                              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
                                  {course.thumbnail}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 mb-1">
                                    {course.name}
                                  </h4>
                                  <p className="text-sm text-gray-600 mb-2">
                                    by {course.instructor}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${course.progress}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-600">
                                      {course.progress}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Completed Courses */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Recently Completed
                        </h3>
                        <div className="space-y-3">
                          {[
                            {
                              name: "JavaScript Fundamentals",
                              completedDate: "2 weeks ago",
                              rating: 5,
                              certificate: true,
                            },
                            {
                              name: "CSS Grid & Flexbox",
                              completedDate: "1 month ago",
                              rating: 4,
                              certificate: true,
                            },
                            {
                              name: "Git Version Control",
                              completedDate: "2 months ago",
                              rating: 5,
                              certificate: true,
                            },
                          ].map((course, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                  <FaCheck className="text-white text-sm" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {course.name}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Completed {course.completedDate}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <FaTrophy
                                      key={i}
                                      className={`text-sm ${
                                        i < course.rating
                                          ? "text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                {course.certificate && (
                                  <button className="ml-3 px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-full transition-colors">
                                    <FaCertificate className="mr-1 inline" />
                                    Certificate
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
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
                          Achievement Overview
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600 mb-1">
                              24
                            </div>
                            <div className="text-gray-600 text-sm">
                              Total Badges
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600 mb-1">
                              8
                            </div>
                            <div className="text-gray-600 text-sm">
                              This Month
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600 mb-1">
                              3
                            </div>
                            <div className="text-gray-600 text-sm">
                              Rare Badges
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600 mb-1">
                              95%
                            </div>
                            <div className="text-gray-600 text-sm">
                              Completion Rate
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recent Achievements */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Recent Achievements
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[
                            {
                              name: "Course Master",
                              description: "Complete 10+ courses",
                              icon: "🏆",
                              rarity: "gold",
                              earned: "2 days ago",
                            },
                            {
                              name: "Week Warrior",
                              description: "7-day learning streak",
                              icon: "🔥",
                              rarity: "silver",
                              earned: "1 week ago",
                            },
                            {
                              name: "Speed Learner",
                              description: "Complete course in under 24h",
                              icon: "⚡",
                              rarity: "bronze",
                              earned: "2 weeks ago",
                            },
                            {
                              name: "Perfect Score",
                              description: "100% on all quizzes",
                              icon: "💯",
                              rarity: "gold",
                              earned: "3 weeks ago",
                            },
                            {
                              name: "Early Bird",
                              description: "Study before 8 AM",
                              icon: "🌅",
                              rarity: "bronze",
                              earned: "1 month ago",
                            },
                            {
                              name: "Knowledge Seeker",
                              description: "Take 50+ quizzes",
                              icon: "🧠",
                              rarity: "silver",
                              earned: "1 month ago",
                            },
                          ].map((achievement, index) => (
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
                                  Earned {achievement.earned}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Progress Towards Next Achievement */}
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Next Achievement
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">🎯</div>
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  Marathon Learner
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Complete 20 courses
                                </p>
                              </div>
                            </div>
                            <span className="text-sm font-medium text-purple-600">
                              12/20
                            </span>
                          </div>
                          <div className="w-full bg-purple-200 rounded-full h-3">
                            <div
                              className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                              style={{ width: "60%" }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-600">
                            8 more courses to unlock this achievement!
                          </p>
                        </div>
                      </div>
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
                          Profile Settings
                        </h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                First Name
                              </label>
                              <input
                                type="text"
                                defaultValue={user.firstName}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name
                              </label>
                              <input
                                type="text"
                                defaultValue={user.lastName}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Username
                            </label>
                            <input
                              type="text"
                              defaultValue={user.username}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Bio
                            </label>
                            <textarea
                              rows={3}
                              placeholder="Tell us about yourself..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors">
                            Save Changes
                          </button>
                        </div>
                      </div>

                      {/* Account Settings */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <FaCog className="text-purple-600" />
                          Account Settings
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email Address
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
                                  Verified
                                </span>
                              ) : (
                                <button className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-md">
                                  Verify
                                </button>
                              )}
                            </div>
                          </div>
                          <div>
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                              Change Password
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Notification Settings */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <FaEnvelope className="text-purple-600" />
                          Notification Preferences
                        </h3>
                        <div className="space-y-4">
                          {[
                            {
                              label: "Course Updates",
                              description:
                                "Get notified about new lessons and announcements",
                            },
                            {
                              label: "Achievement Notifications",
                              description:
                                "Receive notifications when you earn new badges",
                            },
                            {
                              label: "Learning Reminders",
                              description:
                                "Daily reminders to continue your learning",
                            },
                            {
                              label: "Marketing Emails",
                              description:
                                "Promotional emails about new courses and features",
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
                          Danger Zone
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-red-900">
                                Delete Account
                              </h4>
                              <p className="text-sm text-red-700">
                                Permanently delete your account and all data
                              </p>
                            </div>
                            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors">
                              Delete Account
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
          <div className="lg:col-span-1 space-y-6 mt-8 lg:mt-0">
            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaRocket className="text-purple-600" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center gap-2">
                  <FaGraduationCap />
                  Browse Courses
                </button>
                <button className="w-full p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center gap-2">
                  <FaCertificate />
                  View Certificates
                </button>
                <button className="w-full p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center gap-2">
                  <FaDownload />
                  Download Progress
                </button>
              </div>
            </div>

            {/* Learning Streak */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaFire className="text-orange-500" />
                Learning Streak
              </h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500 mb-2">7</div>
                <p className="text-gray-600 text-sm">Days in a row</p>
                <div className="mt-4 bg-orange-50 rounded-xl p-3">
                  <p className="text-orange-700 text-xs font-medium">
                    Keep it up! You're on fire! 🔥
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaTrophy className="text-yellow-500" />
                Recent Achievements
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <FaTrophy className="text-yellow-600 text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Course Master
                    </p>
                    <p className="text-xs text-gray-600">
                      Completed 10 courses
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <FaFire className="text-indigo-600 text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Week Warrior
                    </p>
                    <p className="text-xs text-gray-600">
                      7-day learning streak
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/39 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Edit Profile</h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <span className="text-white text-lg">×</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Avatar Section */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 overflow-hidden">
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
                  <button className="absolute bottom-4 right-0 w-8 h-8 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors">
                    <FaCamera className="text-sm" />
                  </button>
                </div>
                <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  Upload New Photo
                </button>
              </div>

              {/* Personal Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      defaultValue={user.firstName}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      defaultValue={user.lastName}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    defaultValue={user.username}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="email"
                      defaultValue={user.email}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    {user.isEmailVerified ? (
                      <span className="px-3 py-2 bg-green-100 text-green-800 text-sm rounded-lg flex items-center gap-1">
                        <FaCheck className="text-xs" />
                        Verified
                      </span>
                    ) : (
                      <button className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-lg">
                        Verify
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about yourself, your interests, and learning goals..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-300 flex items-center gap-2">
                <FaCheck className="text-sm" />
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Profile;

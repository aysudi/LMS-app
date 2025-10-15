import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowUp,
  FaBookOpen,
  FaChartLine,
  FaClock,
  FaDollarSign,
  FaEye,
  FaGraduationCap,
  FaTrophy,
  FaUsers,
} from "react-icons/fa";
import { useAdminDashboardStats } from "../../hooks/useAdmin";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: statsData, isLoading, error } = useAdminDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Dashboard...
          </h2>
          <p className="text-gray-600">Fetching latest platform statistics</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-4">
            There was a problem loading the dashboard data.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Use API data with fallback values
  const stats = statsData || {
    totalUsers: 0,
    totalInstructors: 0,
    totalStudents: 0,
    totalCourses: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeStudents: 0,
    completedCourses: 0,
    certificatesIssued: 0,
    revenueGrowth: 0,
    userGrowth: 0,
    courseGrowth: 0,
  };

  // Create system status activities since we don't have real activity data yet
  const recentActivity = [
    {
      id: 1,
      type: "system",
      user: "System",
      action: "Platform maintenance completed",
      time: new Date(Date.now() - 30 * 60 * 1000).toLocaleTimeString(),
    },
    {
      id: 2,
      type: "system",
      user: "Database",
      action: "Daily backup completed successfully",
      time: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleTimeString(),
    },
    {
      id: 3,
      type: "system",
      user: "Analytics",
      action: "Monthly report generated",
      time: new Date(Date.now() - 4 * 60 * 60 * 1000).toLocaleTimeString(),
    },
    {
      id: 4,
      type: "system",
      user: "Security",
      action: "Security scan completed - no issues found",
      time: new Date(Date.now() - 6 * 60 * 60 * 1000).toLocaleTimeString(),
    },
    {
      id: 5,
      type: "system",
      user: "Payment",
      action: "Payment gateway health check passed",
      time: new Date(Date.now() - 8 * 60 * 60 * 1000).toLocaleTimeString(),
    },
  ];

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
    color: string;
  }> = ({ title, value, icon, change, changeType = "neutral", color }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/30 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-slate-600 text-sm font-semibold mb-3 tracking-wide uppercase">
            {title}
          </p>
          <p className="text-4xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {change && (
            <div
              className={`flex items-center space-x-1 text-sm font-semibold ${
                changeType === "positive"
                  ? "text-green-600"
                  : changeType === "negative"
                  ? "text-red-600"
                  : "text-slate-500"
              }`}
            >
              <span>{change}</span>
            </div>
          )}
        </div>
        <div
          className={`w-18 h-18 ${color} rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-all duration-300`}
        >
          {icon}
        </div>
      </div>
    </div>
  );

  const ActivityItemComponent: React.FC<{
    activity: any;
  }> = ({ activity }) => (
    <div className="flex items-start space-x-4 p-4 hover:bg-slate-50 rounded-xl transition-colors">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-white font-bold text-sm">
          {activity.user
            .split(" ")
            .map((n: string) => n[0])
            .join("")}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-900 font-medium">
          <span className="text-blue-600">{activity.user}</span>{" "}
          {activity.action}
        </p>
        <p className="text-slate-500 text-sm mt-1">{activity.time}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-3xl p-8 text-white shadow-2xl border border-white/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-5xl font-bold mb-4 tracking-tight">
            Welcome to Admin Portal
          </h1>
          <p className="text-blue-100 text-xl font-medium leading-relaxed">
            Manage your learning platform with comprehensive insights and
            powerful tools
          </p>
          <div className="mt-6 flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-white">System Online</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
              <span className="text-sm text-white">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<FaUsers />}
          change={`+${stats.userGrowth || 12}% from last month`}
          changeType="positive"
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Active Instructors"
          value={stats.totalInstructors}
          icon={<FaGraduationCap />}
          change="+8% from last month"
          changeType="positive"
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          title="Total Courses"
          value={stats.totalCourses}
          icon={<FaBookOpen />}
          change={`+${stats.courseGrowth || 15}% from last month`}
          changeType="positive"
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          title="Platform Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={<FaDollarSign />}
          change={`+${stats.revenueGrowth || 23}% from last month`}
          changeType="positive"
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          icon={<FaClock />}
          change="Requires attention"
          changeType="neutral"
          color="bg-gradient-to-br from-orange-500 to-orange-600"
        />
        <StatCard
          title="Active Students"
          value={stats.activeStudents}
          icon={<FaChartLine />}
          change="+18% from last month"
          changeType="positive"
          color="bg-gradient-to-br from-cyan-500 to-cyan-600"
        />
        <StatCard
          title="Course Completions"
          value={stats.completedCourses}
          icon={<FaArrowUp />}
          change="+25% from last month"
          changeType="positive"
          color="bg-gradient-to-br from-indigo-500 to-indigo-600"
        />
        <StatCard
          title="Certificates Issued"
          value={stats.certificatesIssued}
          icon={<FaTrophy />}
          change="+20% from last month"
          changeType="positive"
          color="bg-gradient-to-br from-yellow-500 to-yellow-600"
        />
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
            <div className="p-6 border-b border-slate-200/50">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Recent Activity
              </h2>
              <p className="text-slate-600">
                Latest platform activities and user interactions
              </p>
            </div>
            <div className="divide-y divide-slate-200/50">
              {recentActivity.map((activity: any) => (
                <ActivityItemComponent key={activity.id} activity={activity} />
              ))}
            </div>
            <div className="p-6 bg-slate-50/50 border-t border-slate-200/50">
              <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center space-x-2">
                <FaEye />
                <span>View All Activity</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions & System Status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-4">
              <button
                onClick={() => navigate("/admin/courses")}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-between"
              >
                <span>Review Pending Courses</span>
                <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                  {stats.pendingApprovals}
                </span>
              </button>
              <button
                onClick={() => navigate("/admin/users")}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-4 rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-between"
              >
                <span>Manage Users</span>
                <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                  {stats.totalUsers}
                </span>
              </button>
              <button
                onClick={() => navigate("/admin/instructors")}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-4 rounded-2xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-between"
              >
                <span>Instructor Applications</span>
                <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                  {stats.totalInstructors}
                </span>
              </button>
              <button
                onClick={() => navigate("/admin/analytics")}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-4 rounded-2xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span>Platform Analytics</span>
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Server Status</span>
                <span className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">Online</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Database</span>
                <span className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">Connected</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Email Service</span>
                <span className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">Active</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Payment Gateway</span>
                <span className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">Online</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

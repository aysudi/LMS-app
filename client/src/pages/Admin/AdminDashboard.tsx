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
import {
  useAdminDashboardStats,
  useAdminAnalytics,
  useRecentActivity,
  useAdminCertificates,
} from "../../hooks/useAdmin";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: statsData, isLoading, error } = useAdminDashboardStats();
  const { data: analyticsData } = useAdminAnalytics();
  const { data: recentActivityData, isLoading: activityLoading } =
    useRecentActivity(5);
  const { data: certificatesData } = useAdminCertificates();

  const enhancedStatsData =
    analyticsData && statsData
      ? {
          ...statsData,
          totalRevenue: analyticsData.revenue?.total || 0,
          revenueGrowth: analyticsData.revenue?.growth || 0,
        }
      : statsData;

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

  const stats = enhancedStatsData || {
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

  const recentActivity =
    recentActivityData ||
    (activityLoading
      ? []
      : [
          {
            id: "loading1",
            type: "system",
            user: "System",
            action: "Loading recent activities...",
            time: new Date().toLocaleTimeString(),
          },
        ]);

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
    color: string;
  }> = ({ title, value, icon, change, changeType = "neutral", color }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-slate-600 text-xs font-semibold mb-1 tracking-wide uppercase">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
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
          className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-all duration-300`}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 space-y-8 p-8">
        {/* Header */}
        <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl p-8 shadow-2xl shadow-blue-500/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-3">
                  Admin Dashboard
                </h1>
                <p className="text-slate-600 text-lg font-medium">
                  Comprehensive platform insights and management tools
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 rounded-2xl px-4 py-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg shadow-green-400/30"></div>
                  <span className="text-green-700 font-semibold text-sm">
                    System Online
                  </span>
                </div>
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200/60 rounded-2xl px-4 py-2">
                  <span className="text-slate-700 font-semibold text-sm">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
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
            changeType="positive"
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            title="Active Instructors"
            value={stats.totalInstructors}
            icon={<FaGraduationCap />}
            changeType="positive"
            color="bg-gradient-to-br from-green-500 to-green-600"
          />
          <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={<FaBookOpen />}
            changeType="positive"
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatCard
            title="Platform Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon={<FaDollarSign />}
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
            changeType="neutral"
            color="bg-gradient-to-br from-orange-500 to-orange-600"
          />
          <StatCard
            title="Active Students"
            value={stats.activeStudents}
            icon={<FaChartLine />}
            changeType="positive"
            color="bg-gradient-to-br from-cyan-500 to-cyan-600"
          />
          <StatCard
            title="Course Completions"
            value={
              analyticsData?.enrollments.completionRate.toFixed(2) + "%" || "0%"
            }
            icon={<FaArrowUp />}
            changeType="positive"
            color="bg-gradient-to-br from-indigo-500 to-indigo-600"
          />
          <StatCard
            title="Certificates Issued"
            value={certificatesData?.data.certificates.length || 0}
            icon={<FaTrophy />}
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
                  <ActivityItemComponent
                    key={activity.id}
                    activity={activity}
                  />
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
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-between"
                >
                  <span>Review Pending Courses</span>
                  <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                    {stats.pendingApprovals}
                  </span>
                </button>
                <button
                  onClick={() => navigate("/admin/users")}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-between"
                >
                  <span>Manage Users</span>
                  <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                    {stats.totalUsers}
                  </span>
                </button>
                <button
                  onClick={() => navigate("/admin/instructors")}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-between"
                >
                  <span>Instructor Applications</span>
                  <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                    {stats.totalInstructors}
                  </span>
                </button>
                <button
                  onClick={() => navigate("/admin/analytics")}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
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
                    <span className="text-green-600 font-medium">
                      Connected
                    </span>
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
    </div>
  );
};

export default AdminDashboard;

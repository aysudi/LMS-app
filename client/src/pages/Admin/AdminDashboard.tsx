import React from "react";
import {
  FaUsers,
  FaGraduationCap,
  FaBookOpen,
  FaDollarSign,
  FaChartLine,
  FaArrowUp,
  FaClock,
  FaTrophy,
} from "react-icons/fa";

const AdminDashboard: React.FC = () => {
  // Mock data - replace with real API calls
  const stats = {
    totalUsers: 12547,
    totalInstructors: 342,
    totalCourses: 1876,
    totalRevenue: 89650,
    pendingApprovals: 23,
    activeStudents: 8965,
    completedCourses: 15432,
    certificatesIssued: 12890,
  };

  const recentActivity = [
    {
      id: 1,
      type: "new_user",
      user: "Sarah Johnson",
      action: "registered as a new student",
      time: "2 minutes ago",
    },
    {
      id: 2,
      type: "course_approval",
      user: "John Smith",
      action: "submitted course for approval",
      time: "15 minutes ago",
    },
    {
      id: 3,
      type: "instructor_application",
      user: "Emma Davis",
      action: "applied to become an instructor",
      time: "1 hour ago",
    },
    {
      id: 4,
      type: "course_completed",
      user: "Michael Brown",
      action: "completed React Fundamentals",
      time: "2 hours ago",
    },
    {
      id: 5,
      type: "payment",
      user: "Lisa Wilson",
      action: "purchased Advanced JavaScript",
      time: "3 hours ago",
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
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-slate-600 text-sm font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mb-1">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {change && (
            <p
              className={`text-sm font-medium ${
                changeType === "positive"
                  ? "text-green-600"
                  : changeType === "negative"
                  ? "text-red-600"
                  : "text-slate-500"
              }`}
            >
              {change}
            </p>
          )}
        </div>
        <div
          className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center text-white text-2xl`}
        >
          {icon}
        </div>
      </div>
    </div>
  );

  const ActivityItem: React.FC<{
    activity: typeof recentActivity[0];
  }> = ({ activity }) => (
    <div className="flex items-start space-x-4 p-4 hover:bg-slate-50 rounded-xl transition-colors">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-white font-bold text-sm">
          {activity.user.split(" ").map((n) => n[0]).join("")}
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
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-4">Welcome to Admin Dashboard</h1>
        <p className="text-blue-100 text-lg font-medium">
          Monitor and manage your learning platform with comprehensive insights
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<FaUsers />}
          change="+12% from last month"
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
          change="+15% from last month"
          changeType="positive"
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          title="Platform Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={<FaDollarSign />}
          change="+23% from last month"
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
              {recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
            <div className="p-6 bg-slate-50/50 border-t border-slate-200/50">
              <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                View All Activity →
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all">
                Review Pending Courses
              </button>
              <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all">
                Approve Instructors
              </button>
              <button className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 rounded-xl font-medium hover:from-orange-700 hover:to-red-700 transition-all">
                Handle Reports
              </button>
              <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all">
                Platform Analytics
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
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-yellow-600 font-medium">Testing</span>
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

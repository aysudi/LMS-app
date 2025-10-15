import React from "react";
import {
  FaUsers,
  FaChartLine,
  FaBookOpen,
  FaDollarSign,
  FaArrowUp,
  FaCalendar,
} from "react-icons/fa";

const AdminAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Platform Analytics
          </h1>
          <p className="text-slate-600">
            Comprehensive insights and performance metrics for your learning
            platform
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-2">
                Total Revenue
              </p>
              <p className="text-3xl font-bold text-slate-900">$45,231</p>
              <p className="text-green-600 text-sm font-medium">
                +12.5% this month
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl">
              <FaDollarSign />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-2">
                Course Enrollments
              </p>
              <p className="text-3xl font-bold text-slate-900">1,847</p>
              <p className="text-green-600 text-sm font-medium">
                +23.1% this month
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl">
              <FaBookOpen />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-2">
                Active Users
              </p>
              <p className="text-3xl font-bold text-slate-900">12,463</p>
              <p className="text-green-600 text-sm font-medium">
                +8.3% this month
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl">
              <FaUsers />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-2">
                Completion Rate
              </p>
              <p className="text-3xl font-bold text-slate-900">78.5%</p>
              <p className="text-green-600 text-sm font-medium">
                +5.2% this month
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white text-2xl">
              <FaArrowUp />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Revenue Overview
            </h2>
            <div className="flex items-center space-x-2">
              <FaChartLine className="text-green-600" />
              <span className="text-sm text-slate-600">Last 6 months</span>
            </div>
          </div>

          {/* Placeholder for chart */}
          <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center justify-center border-2 border-dashed border-green-200">
            <div className="text-center">
              <FaChartLine className="text-4xl text-green-400 mx-auto mb-2" />
              <p className="text-green-600 font-medium">Revenue Chart</p>
              <p className="text-sm text-green-500">
                Chart component will be integrated here
              </p>
            </div>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">User Growth</h2>
            <div className="flex items-center space-x-2">
              <FaUsers className="text-blue-600" />
              <span className="text-sm text-slate-600">Monthly growth</span>
            </div>
          </div>

          {/* Placeholder for chart */}
          <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center border-2 border-dashed border-blue-200">
            <div className="text-center">
              <FaUsers className="text-4xl text-blue-400 mx-auto mb-2" />
              <p className="text-blue-600 font-medium">User Growth Chart</p>
              <p className="text-sm text-blue-500">
                Chart component will be integrated here
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Courses & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Courses */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Top Performing Courses
          </h2>

          <div className="space-y-4">
            {[
              {
                title: "React Fundamentals",
                enrollments: 234,
                revenue: "$3,450",
              },
              {
                title: "Python for Beginners",
                enrollments: 187,
                revenue: "$2,805",
              },
              {
                title: "Web Design Masterclass",
                enrollments: 156,
                revenue: "$2,340",
              },
              {
                title: "JavaScript Advanced",
                enrollments: 143,
                revenue: "$2,145",
              },
              {
                title: "Data Science Basics",
                enrollments: 98,
                revenue: "$1,470",
              },
            ].map((course, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
              >
                <div>
                  <h3 className="font-medium text-slate-900">{course.title}</h3>
                  <p className="text-sm text-slate-600">
                    {course.enrollments} enrollments
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{course.revenue}</p>
                  <p className="text-xs text-slate-500">revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Recent Platform Activity
            </h2>
            <FaCalendar className="text-slate-400" />
          </div>

          <div className="space-y-4">
            {[
              {
                action: "New course submitted",
                user: "Sarah Johnson",
                time: "2 hours ago",
                type: "course",
              },
              {
                action: "Instructor application",
                user: "Michael Chen",
                time: "4 hours ago",
                type: "instructor",
              },
              {
                action: "Course completed",
                user: "Emma Davis",
                time: "6 hours ago",
                type: "completion",
              },
              {
                action: "Payment processed",
                user: "John Smith",
                time: "8 hours ago",
                type: "payment",
              },
              {
                action: "Support ticket created",
                user: "Lisa Wilson",
                time: "1 day ago",
                type: "support",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === "course"
                      ? "bg-blue-500"
                      : activity.type === "instructor"
                      ? "bg-purple-500"
                      : activity.type === "completion"
                      ? "bg-green-500"
                      : activity.type === "payment"
                      ? "bg-emerald-500"
                      : "bg-orange-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    <span className="text-blue-600">{activity.user}</span>{" "}
                    {activity.action}
                  </p>
                  <p className="text-xs text-slate-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
            View All Activity →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;

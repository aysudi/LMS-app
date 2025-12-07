import React from "react";
import { useAdminAnalytics } from "../../hooks/useAdmin";

const AdminAnalytics: React.FC = () => {
  const { data: analytics, isLoading, error } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md h-64"></div>
              <div className="bg-white p-6 rounded-lg shadow-md h-64"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Error Loading Analytics
            </h2>
            <p className="text-red-600">
              Failed to load analytics data. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">
              No Data Available
            </h2>
            <p className="text-yellow-600">
              Analytics data is not available at the moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Safely extract data with fallbacks
  const revenue = analytics.revenue || {
    total: 0,
    thisMonth: 0,
    lastMonth: 0,
    growth: 0,
    byMonth: [],
  };
  const users = analytics.users || {
    total: 0,
    thisMonth: 0,
    lastMonth: 0,
    growth: 0,
    byMonth: [],
  };
  const courses = analytics.courses || {
    total: 0,
    thisMonth: 0,
    lastMonth: 0,
    growth: 0,
    byCategory: [],
  };
  const enrollments = analytics.enrollments || {
    total: 0,
    thisMonth: 0,
    lastMonth: 0,
    growth: 0,
    completionRate: 0,
  };

  const statCards = [
    {
      title: "Total Users",
      value: formatNumber(users.total),
      change: users.growth,
      color: "blue",
      thisMonth: users.thisMonth,
      lastMonth: users.lastMonth,
    },
    {
      title: "Total Courses",
      value: formatNumber(courses.total),
      change: courses.growth,
      color: "purple",
      thisMonth: courses.thisMonth,
      lastMonth: courses.lastMonth,
    },
    {
      title: "Total Revenue",
      value: formatCurrency(revenue.total),
      change: revenue.growth,
      color: "green",
      thisMonth: revenue.thisMonth,
      lastMonth: revenue.lastMonth,
    },
    {
      title: "Total Enrollments",
      value: formatNumber(enrollments.total),
      change: enrollments.growth,
      color: "yellow",
      thisMonth: enrollments.thisMonth,
      lastMonth: enrollments.lastMonth,
    },
  ];

  const getChangeColor = (change: number): string => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg border border-white/20 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2 tracking-tight">
                  Analytics Dashboard
                </h1>
                <p className="text-blue-100 font-medium">
                  Real-time insights and platform statistics
                </p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="bg-white/20 rounded-full px-3 py-1 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">System Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                {stat.title}
              </h3>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              <div className={`text-sm ${getChangeColor(stat.change)} mt-1`}>
                {stat.change > 0 ? "+" : ""}
                {stat.change.toFixed(1)}% from last month
              </div>
              <div className="text-xs text-gray-500 mt-2">
                This month:{" "}
                {stat.title.includes("Revenue")
                  ? formatCurrency(stat.thisMonth)
                  : formatNumber(stat.thisMonth)}{" "}
                | Last month:{" "}
                {stat.title.includes("Revenue")
                  ? formatCurrency(stat.lastMonth)
                  : formatNumber(stat.lastMonth)}
              </div>
            </div>
          ))}
        </div>

        {/* Course Categories and Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Course Categories */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Courses by Category
            </h3>
            <div className="space-y-4">
              {courses.byCategory && courses.byCategory.length > 0 ? (
                courses.byCategory.map((category: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600 capitalize">
                      {category.category}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              (category.count /
                                Math.max(
                                  ...courses.byCategory.map((c: any) => c.count)
                                )) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-right">
                        {category.count}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No course category data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Additional Metrics
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${enrollments.completionRate}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {enrollments.completionRate.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">
                    {formatNumber(users.thisMonth)}
                  </div>
                  <div className="text-xs text-gray-600">
                    New Users This Month
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">
                    {formatNumber(courses.thisMonth)}
                  </div>
                  <div className="text-xs text-gray-600">
                    New Courses This Month
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">
                    {formatNumber(enrollments.thisMonth)}
                  </div>
                  <div className="text-xs text-gray-600">
                    New Enrollments This Month
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(revenue.thisMonth)}
                  </div>
                  <div className="text-xs text-gray-600">
                    Revenue This Month
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaDollarSign,
  FaDownload,
  FaCreditCard,
  FaChartBar,
  FaArrowUp,
  FaArrowDown,
  FaBook,
  FaUsers,
  FaPiggyBank,
  FaClock,
} from "react-icons/fa";

import { 
  useInstructorEarnings,
  useInstructorEarningsByCourse
} from "../../hooks/useInstructor";
import { useInstructorAnalytics } from "../../hooks/useInstructorHelpers";
import Loading from "../../components/Common/Loading";

const InstructorEarnings = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<"30d" | "90d" | "1y">(
    "30d"
  );

  const { formatCurrency } = useInstructorAnalytics();

  // Fetch real earnings data
  const { data: earningsData, isLoading: earningsLoading } = useInstructorEarnings();
  const { data: courseEarningsData, isLoading: courseEarningsLoading } = useInstructorEarningsByCourse();

  if (earningsLoading || courseEarningsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  const earnings = earningsData?.data || {
    totalEarnings: 0,
    monthlyEarnings: 0,
    pendingPayouts: 0,
    completedPayouts: 0,
    earningsThisMonth: 0,
    earningsLastMonth: 0,
    growthRate: 0,
    topPerformingCourse: {
      courseId: '',
      title: '',
      earnings: 0
    }
  };

  const courseEarnings = courseEarningsData?.data || [];

  const handleRequestPayout = () => {
    console.log("Requesting payout...");
    // TODO: Implement payout request functionality
  };

  const handleDownloadReport = () => {
    console.log("Downloading earnings report...");
    // TODO: Implement report download functionality
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
            <p className="text-gray-600 mt-2">
              Track your revenue and manage payouts
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Period Selector */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadReport}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium flex items-center space-x-2"
            >
              <FaDownload className="text-sm" />
              <span>Export</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRequestPayout}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium flex items-center space-x-2"
            >
              <FaCreditCard className="text-sm" />
              <span>Request Payout</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Earnings Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <EarningsCard
            icon={FaDollarSign}
            title="Total Earnings"
            value={formatCurrency(earnings.totalEarnings)}
            change={15.2}
            changeType="increase"
            color="bg-gradient-to-r from-green-500 to-emerald-600"
          />

          <EarningsCard
            icon={FaPiggyBank}
            title="Current Balance"
            value={formatCurrency(earnings.earningsThisMonth)}
            subtitle="Available for payout"
            color="bg-gradient-to-r from-blue-500 to-cyan-600"
          />

          <EarningsCard
            icon={FaClock}
            title="Pending Earnings"
            value={formatCurrency(earnings.pendingPayouts)}
            subtitle="Processing period"
            color="bg-gradient-to-r from-yellow-500 to-orange-600"
          />

          <EarningsCard
            icon={FaChartBar}
            title="Total Payouts"
            value={formatCurrency(earnings.completedPayouts)}
            subtitle="Lifetime payouts"
            color="bg-gradient-to-r from-purple-500 to-indigo-600"
          />
        </motion.div>

        {/* Monthly Earnings Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Monthly Earnings Trend
            </h2>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <span className="text-gray-600">Earnings</span>
              </div>
            </div>
          </div>

          <div className="h-80 flex items-end justify-between space-x-4 px-4">
            {                              // Generate mock monthly data from current earnings
                              Array.from({ length: 6 }, (_, i) => ({
                                month: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7),
                                amount: Math.round((earnings.monthlyEarnings || 0) * (0.8 + Math.random() * 0.4))
                              }))
              .map((data: any, index: number) => (
                <div
                  key={index}
                  className="flex flex-col items-center space-y-2 flex-1"
                >
                  <div className="flex items-end w-full h-64">
                    <div
                      className="bg-indigo-500 rounded-t-lg transition-all duration-500 hover:bg-indigo-600 cursor-pointer relative group w-full"
                      style={{
                        height: `${Math.max(
                          5,
                          (data.amount /
                            Math.max(
                              // Use the same mock data for bar chart
                              ...Array.from({ length: 6 }, (_, i) => ({
                                month: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7),
                                amount: Math.round((earnings.monthlyEarnings || 0) * (0.8 + Math.random() * 0.4))
                              })).map(
                                (d: any) => d.amount
                              )
                            )) *
                            100
                        )}%`,
                      }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 transition-opacity">
                        {formatCurrency(data.amount)}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {new Date(data.month).toLocaleDateString("en-US", {
                      month: "short",
                    })}
                  </span>
                </div>
              )) || []}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Earnings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Earnings by Course
            </h2>

            {courseEarnings.length === 0 ? (
              <div className="text-center py-12">
                <FaBook className="text-4xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No earnings data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {courseEarnings.map((course: any, index: number) => (
                  <div
                    key={course._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium text-sm ${
                          index < 3
                            ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                            : "bg-gray-400"
                        }`}
                      >
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 truncate max-w-48">
                          {course.title || `Course ${index + 1}`}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <FaUsers className="text-xs" />
                            <span>{course.totalStudents || 0} students</span>
                          </span>
                          <span>{course.totalSales || 0} sales</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(course.totalEarnings || 0)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {course.averageRating
                          ? `${course.averageRating}★`
                          : "No rating"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Payouts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Recent Payouts
            </h2>

            {earnings.completedPayouts === 0 ? (
              <div className="text-center py-12">
                <FaCreditCard className="text-4xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No payouts yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Payouts will appear here once processed
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {// Create mock recent payouts for demo
                Array.from({ length: 3 }, (_, i) => ({
                  amount: Math.round((earnings.completedPayouts || 0) * (0.2 + Math.random() * 0.3)),
                  date: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString(),
                  status: "completed"
                })).map((payout: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-3 rounded-lg ${
                            payout.status === "completed"
                              ? "bg-green-100 text-green-600"
                              : payout.status === "pending"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          <FaCreditCard className="text-sm" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatCurrency(payout.amount || 0)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {payout.date
                              ? new Date(payout.date).toLocaleDateString()
                              : "Unknown date"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payout.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : payout.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {payout.status || "Unknown"}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Payout Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 p-6 mt-8"
        >
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <FaDollarSign className="text-2xl text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Payout Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Payout Schedule
                  </h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Payouts are processed monthly</li>
                    <li>• Minimum payout amount: $50</li>
                    <li>• Processing time: 3-5 business days</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Revenue Share
                  </h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Instructor share: 70%</li>
                    <li>• Platform fee: 30%</li>
                    <li>• No hidden charges</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Earnings Card Component
interface EarningsCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  change?: number;
  changeType?: "increase" | "decrease";
  subtitle?: string;
  color: string;
}

const EarningsCard: React.FC<EarningsCardProps> = ({
  icon: Icon,
  title,
  value,
  change,
  changeType,
  subtitle,
  color,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon className="text-xl text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>

          {change !== undefined && (
            <div
              className={`flex items-center space-x-1 text-sm ${
                changeType === "increase" ? "text-green-600" : "text-red-600"
              }`}
            >
              {changeType === "increase" ? (
                <FaArrowUp className="text-xs" />
              ) : (
                <FaArrowDown className="text-xs" />
              )}
              <span>{Math.abs(change)}%</span>
              <span className="text-gray-500">vs last period</span>
            </div>
          )}

          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

export default InstructorEarnings;

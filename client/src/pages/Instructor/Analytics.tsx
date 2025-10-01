import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaDollarSign,
  FaUsers,
  FaEye,
  FaClock,
  FaStar,
  FaDownload,
  FaTrophy,
  FaGraduationCap,
} from "react-icons/fa";
import { useInstructorAnalytics } from "../../hooks/useInstructorHelpers";

// Sample data for charts
const revenueData = [
  { month: "Jan", revenue: 4200, students: 28 },
  { month: "Feb", revenue: 5800, students: 45 },
  { month: "Mar", revenue: 7200, students: 52 },
  { month: "Apr", revenue: 6400, students: 38 },
  { month: "May", revenue: 8900, students: 65 },
  { month: "Jun", revenue: 12400, students: 89 },
];

const coursePerformanceData = [
  {
    name: "JavaScript Fundamentals",
    students: 234,
    rating: 4.8,
    revenue: 18600,
  },
  { name: "React Masterclass", students: 189, rating: 4.9, revenue: 22800 },
  { name: "Node.js Backend", students: 156, rating: 4.7, revenue: 15600 },
  { name: "Python for Beginners", students: 298, rating: 4.6, revenue: 23800 },
  {
    name: "Full Stack Development",
    students: 145,
    rating: 4.8,
    revenue: 29000,
  },
];

const trafficSourceData = [
  { name: "Organic Search", value: 45, color: "#3B82F6" },
  { name: "Social Media", value: 28, color: "#10B981" },
  { name: "Direct", value: 15, color: "#F59E0B" },
  { name: "Referrals", value: 12, color: "#EF4444" },
];

const InstructorAnalytics = () => {
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d"
  );

  // Helper hooks
  const { formatCurrency } = useInstructorAnalytics();

  const handleExportReport = () => {
    console.log("Exporting analytics report...");
    // TODO: Implement export functionality
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
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-2">
              Track your performance and growth metrics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportReport}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium flex items-center space-x-2"
            >
              <FaDownload className="text-sm" />
              <span>Export Report</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <MetricCard
            icon={FaDollarSign}
            title="Total Revenue"
            value={formatCurrency(45800)}
            change={12.5}
            changeType="increase"
            color="bg-gradient-to-r from-green-500 to-emerald-600"
          />

          <MetricCard
            icon={FaUsers}
            title="Total Students"
            value="1,245"
            change={8.3}
            changeType="increase"
            color="bg-gradient-to-r from-blue-500 to-cyan-600"
          />

          <MetricCard
            icon={FaEye}
            title="Course Views"
            value="12,847"
            change={-2.1}
            changeType="decrease"
            color="bg-gradient-to-r from-purple-500 to-indigo-600"
          />

          <MetricCard
            icon={FaStar}
            title="Avg Rating"
            value="4.8"
            change={5.2}
            changeType="increase"
            color="bg-gradient-to-r from-yellow-500 to-orange-600"
          />
        </motion.div>

        {/* Revenue and Students Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Revenue & Enrollments
            </h2>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <span className="text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">New Students</span>
              </div>
            </div>
          </div>

          <div className="h-80 flex items-end justify-between space-x-4 px-4">
            {revenueData.map((data) => (
              <div
                key={data.month}
                className="flex flex-col items-center space-y-2 flex-1"
              >
                <div className="flex items-end space-x-1 w-full h-64">
                  <div
                    className="bg-indigo-500 rounded-t-lg transition-all duration-500 hover:bg-indigo-600 cursor-pointer relative group"
                    style={{
                      height: `${
                        (data.revenue /
                          Math.max(...revenueData.map((d) => d.revenue))) *
                        100
                      }%`,
                      width: "40%",
                    }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 transition-opacity">
                      {formatCurrency(data.revenue)}
                    </div>
                  </div>
                  <div
                    className="bg-green-500 rounded-t-lg transition-all duration-500 hover:bg-green-600 cursor-pointer relative group"
                    style={{
                      height: `${
                        (data.students /
                          Math.max(...revenueData.map((d) => d.students))) *
                        100
                      }%`,
                      width: "40%",
                    }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 transition-opacity">
                      {data.students} students
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-600 font-medium">
                  {data.month}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Course Performance */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Top Performing Courses
            </h2>
            <div className="space-y-4">
              {coursePerformanceData.map((course, index) => (
                <div
                  key={course.name}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                        index === 0
                          ? "bg-yellow-500"
                          : index === 1
                          ? "bg-gray-400"
                          : index === 2
                          ? "bg-orange-600"
                          : "bg-indigo-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 truncate max-w-48">
                        {course.name}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <FaUsers className="text-xs" />
                          <span>{course.students}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <FaStar className="text-xs text-yellow-400" />
                          <span>{course.rating}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(course.revenue)}
                    </p>
                    <p className="text-sm text-gray-500">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Traffic Sources */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Traffic Sources
            </h2>

            {/* Simple Bar Chart */}
            <div className="space-y-4 mb-6">
              {trafficSourceData.map((source) => (
                <div key={source.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: source.color }}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {source.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {source.value}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${source.value}%`,
                        backgroundColor: source.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Donut Chart Visual */}
            <div className="flex justify-center">
              <div className="relative w-40 h-40">
                <svg
                  viewBox="0 0 42 42"
                  className="w-full h-full transform -rotate-90"
                >
                  <circle
                    cx="21"
                    cy="21"
                    r="15.915"
                    fill="transparent"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  {trafficSourceData.map((source, index) => {
                    const strokeDasharray = `${source.value} ${
                      100 - source.value
                    }`;
                    const strokeDashoffset = trafficSourceData
                      .slice(0, index)
                      .reduce((acc, curr) => acc + curr.value, 0);

                    return (
                      <circle
                        key={source.name}
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="transparent"
                        stroke={source.color}
                        strokeWidth="3"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={-strokeDashoffset}
                        className="transition-all duration-500"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">Total</p>
                    <p className="text-xs text-gray-600">Traffic</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Completion Rate
              </h3>
              <FaTrophy className="text-2xl text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">78.5%</div>
            <p className="text-sm text-gray-600">Average across all courses</p>
            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: "78.5%" }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Avg. Watch Time
              </h3>
              <FaClock className="text-2xl text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">24.3m</div>
            <p className="text-sm text-gray-600">Per student session</p>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-green-600 font-medium">+12.4%</span>
              <span className="text-gray-600 ml-2">vs last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Certificates Issued
              </h3>
              <FaGraduationCap className="text-2xl text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">342</div>
            <p className="text-sm text-gray-600">This month</p>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-green-600 font-medium">+18.2%</span>
              <span className="text-gray-600 ml-2">vs last month</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Metric Card Component
interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  change?: number;
  changeType?: "increase" | "decrease";
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon: Icon,
  title,
  value,
  change,
  changeType,
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
              <span>
                {changeType === "increase" ? "+" : "-"}
                {Math.abs(change)}%
              </span>
              <span className="text-gray-500">vs last period</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorAnalytics;

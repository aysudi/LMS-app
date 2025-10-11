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
import {
  useInstructorOverview,
  useInstructorCoursesWithStats,
  useInstructorAnalytics,
} from "../../hooks/useInstructor";
import Loading from "../../components/Common/Loading";
import MetricCard from "../../components/Instructor/Analytics/MetricCard";
import RevenueChart from "../../components/Instructor/Analytics/RevenueChart";
import CoursePerformance from "../../components/Instructor/Analytics/CoursePerformance";
import TrafficSources from "../../components/Instructor/Analytics/TrafficSources";

const InstructorAnalytics = () => {
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d"
  );

  const { data: overview, isLoading: overviewLoading } =
    useInstructorOverview();
  const { data: coursesData, isLoading: coursesLoading } =
    useInstructorCoursesWithStats({
      page: 1,
      limit: 50,
      status: "published",
    });

  const { formatCurrency } = useInstructorAnalytics();

  if (overviewLoading || coursesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  const stats = overview?.data?.overview;
  const courses = coursesData?.data?.courses || [];
  const totalRevenue = stats?.totalRevenue || 0;
  const totalStudents = stats?.totalStudents || 0;

  const revenueData = [
    {
      month: "Jan",
      revenue: Math.round(totalRevenue * 0.1),
      students: Math.round(totalStudents * 0.1),
    },
    {
      month: "Feb",
      revenue: Math.round(totalRevenue * 0.12),
      students: Math.round(totalStudents * 0.12),
    },
    {
      month: "Mar",
      revenue: Math.round(totalRevenue * 0.15),
      students: Math.round(totalStudents * 0.15),
    },
    {
      month: "Apr",
      revenue: Math.round(totalRevenue * 0.13),
      students: Math.round(totalStudents * 0.13),
    },
    {
      month: "May",
      revenue: Math.round(totalRevenue * 0.18),
      students: Math.round(totalStudents * 0.18),
    },
    {
      month: "Jun",
      revenue: Math.round(totalRevenue * 0.2),
      students: Math.round(totalStudents * 0.2),
    },
  ];

  const coursePerformanceData = courses.slice(0, 5).map((course) => ({
    name: course.title,
    students: course.studentsEnrolled.length || 0,
    rating: course.rating || 0,
    revenue: course.originalPrice || 0,
  }));

  const trafficSourceData = [
    { name: "Organic Search", value: 45, color: "#3B82F6" },
    { name: "Social Media", value: 28, color: "#10B981" },
    { name: "Direct", value: 15, color: "#F59E0B" },
    { name: "Referrals", value: 12, color: "#EF4444" },
  ];

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
            value={formatCurrency(stats?.totalRevenue || 0)}
            change={12.5}
            changeType="increase"
            color="bg-gradient-to-r from-green-500 to-emerald-600"
          />

          <MetricCard
            icon={FaUsers}
            title="Total Students"
            value={stats?.totalStudents?.toLocaleString() || "0"}
            change={8.3}
            changeType="increase"
            color="bg-gradient-to-r from-blue-500 to-cyan-600"
          />

          <MetricCard
            icon={FaEye}
            title="Course Views"
            value={overview?.data?.performance?.views?.toLocaleString() || "0"}
            change={-2.1}
            changeType="decrease"
            color="bg-gradient-to-r from-purple-500 to-indigo-600"
          />

          <MetricCard
            icon={FaStar}
            title="Avg Rating"
            value={stats?.averageRating?.toFixed(1) || "0.0"}
            change={5.2}
            changeType="increase"
            color="bg-gradient-to-r from-yellow-500 to-orange-600"
          />
        </motion.div>

        {/* Revenue and Students Chart */}
        <RevenueChart data={revenueData} formatCurrency={formatCurrency} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Course Performance */}
          <CoursePerformance
            courses={coursePerformanceData}
            formatCurrency={formatCurrency}
          />

          {/* Traffic Sources */}
          <TrafficSources data={trafficSourceData} />
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

export default InstructorAnalytics;

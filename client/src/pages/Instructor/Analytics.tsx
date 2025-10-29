import { useState } from "react";
import { motion } from "framer-motion";
// @ts-ignore
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
    {
      name: t("instructor.analytics.organicSearch"),
      value: 45,
      color: "#3B82F6",
    },
    {
      name: t("instructor.analytics.socialMedia"),
      value: 28,
      color: "#10B981",
    },
    { name: t("instructor.analytics.direct"), value: 15, color: "#F59E0B" },
    { name: t("instructor.analytics.referrals"), value: 12, color: "#EF4444" },
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
            <h1 className="text-3xl font-bold text-gray-900">
              {t("navigation.analytics")}
            </h1>
            <p className="text-gray-600 mt-2">
              {t("instructor.trackPerformanceMetrics")}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="7d">{t("filters.last7Days")}</option>
              <option value="30d">{t("filters.last30Days")}</option>
              <option value="90d">{t("filters.last90Days")}</option>
              <option value="1y">{t("filters.lastYear")}</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportReport}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium flex items-center space-x-2"
            >
              <FaDownload className="text-sm" />
              <span>{t("instructor.exportReport")}</span>
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
            title={t("instructor.totalRevenue")}
            value={formatCurrency(stats?.totalRevenue || 0)}
            change={12.5}
            changeType="increase"
            color="bg-gradient-to-r from-green-500 to-emerald-600"
          />

          <MetricCard
            icon={FaUsers}
            title={t("instructor.totalStudents")}
            value={stats?.totalStudents?.toLocaleString() || "0"}
            change={8.3}
            changeType="increase"
            color="bg-gradient-to-r from-blue-500 to-cyan-600"
          />

          <MetricCard
            icon={FaEye}
            title={t("instructor.courseViews")}
            value={overview?.data?.performance?.views?.toLocaleString() || "0"}
            change={-2.1}
            changeType="decrease"
            color="bg-gradient-to-r from-purple-500 to-indigo-600"
          />

          <MetricCard
            icon={FaStar}
            title={t("instructor.averageRating")}
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
                {t("instructor.analytics.completionRate")}
              </h3>
              <FaTrophy className="text-2xl text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">78.5%</div>
            <p className="text-sm text-gray-600">
              {t("instructor.analytics.averageAcrossAllCourses")}
            </p>
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
                {t("instructor.analytics.avgWatchTime")}
              </h3>
              <FaClock className="text-2xl text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">24.3m</div>
            <p className="text-sm text-gray-600">
              {t("instructor.analytics.perStudentSession")}
            </p>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-green-600 font-medium">+12.4%</span>
              <span className="text-gray-600 ml-2">
                {t("instructor.analytics.vsLastMonth")}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("instructor.analytics.certificatesIssued")}
              </h3>
              <FaGraduationCap className="text-2xl text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">342</div>
            <p className="text-sm text-gray-600">
              {t("instructor.analytics.thisMonth")}
            </p>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-green-600 font-medium">+18.2%</span>
              <span className="text-gray-600 ml-2">
                {t("instructor.analytics.vsLastMonth")}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InstructorAnalytics;

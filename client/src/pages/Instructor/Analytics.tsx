import { useState } from "react";
import { motion } from "framer-motion";
// @ts-ignore
import { useTranslation } from "react-i18next";
import {
  FaDollarSign,
  FaUsers,
  FaEye,
  FaStar,
  FaDownload,
} from "react-icons/fa";
import {
  useInstructorOverview,
  useInstructorCoursesWithStats,
  useInstructorAnalytics,
  useMonthlyAnalytics,
} from "../../hooks/useInstructor";
import { exportAnalyticsReport } from "../../services/instructor.service";
import { useSnackbar } from "notistack";
import Loading from "../../components/Common/Loading";
import MetricCard from "../../components/Instructor/Analytics/MetricCard";
import RevenueChart from "../../components/Instructor/Analytics/RevenueChart";
import CoursePerformance from "../../components/Instructor/Analytics/CoursePerformance";
import TrafficSources from "../../components/Instructor/Analytics/TrafficSources";

const InstructorAnalytics = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [dateRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [isExporting, setIsExporting] = useState(false);

  const { data: overview, isLoading: overviewLoading } =
    useInstructorOverview();
  const { data: coursesData, isLoading: coursesLoading } =
    useInstructorCoursesWithStats({
      page: 1,
      limit: 50,
      status: "published",
    });
  const { data: monthlyAnalytics, isLoading: monthlyLoading } =
    useMonthlyAnalytics("6m");

  const { formatCurrency } = useInstructorAnalytics();

  const handleExportAnalytics = async () => {
    setIsExporting(true);
    try {
      const blob = await exportAnalyticsReport("csv", dateRange);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `analytics-report-${dateRange}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      enqueueSnackbar("Analytics report downloaded successfully!", {
        variant: "success",
      });
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to download report",
        {
          variant: "error",
        }
      );
    } finally {
      setIsExporting(false);
    }
  };

  if (overviewLoading || coursesLoading || monthlyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  const stats = overview?.data?.overview;
  const courses = coursesData?.data?.courses || [];

  const revenueData =
    monthlyAnalytics?.data && monthlyAnalytics.data.length > 0
      ? monthlyAnalytics.data.map((item: any) => ({
          month:
            item.month ||
            new Date(item.date).toLocaleDateString("en-US", { month: "short" }),
          revenue: item.revenue || item.earnings || 0,
          students: item.enrollments || item.students || 0,
        }))
      : [];

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

  const handleExportReport = async () => {
    await handleExportAnalytics();
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
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportReport}
              disabled={isExporting}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <FaDownload className="text-sm" />
              )}
              <span>
                {isExporting ? "Exporting..." : t("instructor.exportReport")}
              </span>
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
      </div>
    </div>
  );
};

export default InstructorAnalytics;

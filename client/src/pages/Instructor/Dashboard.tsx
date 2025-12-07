import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaDollarSign,
  FaUsers,
  FaBook,
  FaStar,
  FaEye,
  FaClock,
  FaChartLine,
  FaGraduationCap,
  FaComment,
  FaPlus,
} from "react-icons/fa";
import {
  useInstructorOverview,
  useInstructorCoursesWithStats,
  useInstructorMessages,
  useMessageStats,
  useInstructorAnalytics,
} from "../../hooks/useInstructor";
import Loading from "../../components/Common/Loading";
import StatCard from "../../components/Instructor/Dashboard/StatCard";
import QuickAction from "../../components/Instructor/Dashboard/QuickAction";
import TopCourses from "../../components/Instructor/Dashboard/TopCourses";
import RecentMessages from "../../components/Instructor/Dashboard/RecentMessages";
// @ts-ignore
import { useTranslation } from "react-i18next";

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: overview, isLoading: overviewLoading } =
    useInstructorOverview();
  const { data: courses, isLoading: coursesLoading } =
    useInstructorCoursesWithStats({
      status: "published",
    });
  const { data: messages } = useInstructorMessages({
    page: 1,
    limit: 5,
    status: "unread",
  });
  const { data: messageStats } = useMessageStats();

  const { formatCurrency, calculateGrowthRate } = useInstructorAnalytics();

  if (overviewLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!overview?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("errors.pageNotFound")}
          </h2>
          <p className="text-gray-600 mt-2">{t("errors.somethingWentWrong")}</p>
        </div>
      </div>
    );
  }

  const { overview: stats, performance } = overview.data;

  // Force refresh performance data to get latest view counts
  const refreshedPerformance = {
    views: performance.views || 0,
    enrollments: performance.enrollments || 0,
    watchTime: performance.watchTime || 0,
    conversionRate:
      performance.views > 0
        ? ((performance.enrollments / performance.views) * 100).toFixed(1)
        : 0,
  };

  const revenueGrowth = calculateGrowthRate(
    stats.monthlyRevenue,
    stats.totalRevenue * 0.1
  );
  const studentsGrowth = calculateGrowthRate(
    stats.totalStudents,
    stats.totalStudents * 0.9
  );

  const quickActions = [
    {
      icon: FaPlus,
      title: t("instructor.dashboard.createNewCourse"),
      description: t("instructor.dashboard.startBuildingCourse"),
      onClick: () => navigate("/instructor/courses/create"),
      color: "bg-gradient-to-r from-indigo-500 to-purple-600",
    },
    {
      icon: FaComment,
      title: t("instructor.dashboard.replyToMessages"),
      description: t("instructor.dashboard.unreadMessages", {
        count: messageStats?.data?.byStatus?.unread || 0,
      }),
      onClick: () => navigate("/instructor/messages"),
      color: "bg-gradient-to-r from-blue-500 to-cyan-600",
    },
    {
      icon: FaChartLine,
      title: t("instructor.dashboard.viewAnalytics"),
      description: t("instructor.dashboard.performanceInsights"),
      onClick: () => navigate("/instructor/analytics"),
      color: "bg-gradient-to-r from-green-500 to-teal-600",
    },
    {
      icon: FaDollarSign,
      title: t("instructor.dashboard.checkEarnings"),
      description: t("instructor.dashboard.reviewRevenue"),
      onClick: () => navigate("/instructor/earnings"),
      color: "bg-gradient-to-r from-yellow-500 to-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            {t("instructor.dashboard.title")}
          </h1>
          <p className="text-gray-600 mt-2">
            {t("instructor.dashboard.welcomeMessage")}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FaDollarSign}
            title={t("instructor.dashboard.totalRevenue")}
            value={formatCurrency(stats.totalRevenue)}
            change={revenueGrowth}
            changeType={revenueGrowth >= 0 ? "increase" : "decrease"}
            subtitle={t("instructor.dashboard.thisMonth", {
              amount: formatCurrency(stats.monthlyRevenue),
            })}
            color="bg-gradient-to-r from-green-500 to-emerald-600"
            delay={0.1}
          />

          <StatCard
            icon={FaUsers}
            title={t("instructor.dashboard.totalStudents")}
            value={stats.totalStudents.toLocaleString()}
            change={studentsGrowth}
            changeType={studentsGrowth >= 0 ? "increase" : "decrease"}
            subtitle={t("instructor.dashboard.recentEnrollments", {
              count: stats.recentEnrollments,
            })}
            color="bg-gradient-to-r from-blue-500 to-cyan-600"
            delay={0.2}
          />

          <StatCard
            icon={FaBook}
            title={t("instructor.dashboard.publishedCourses")}
            value={stats.totalCourses}
            subtitle={t("instructor.dashboard.completions", {
              count: stats.completions,
            })}
            color="bg-gradient-to-r from-indigo-500 to-purple-600"
            delay={0.3}
          />

          <StatCard
            icon={FaStar}
            title={t("instructor.dashboard.averageRating")}
            value={stats.averageRating.toFixed(1)}
            subtitle={t("instructor.dashboard.basedOnReviews")}
            color="bg-gradient-to-r from-yellow-500 to-orange-600"
            delay={0.4}
          />
        </div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaEye className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t("instructor.dashboard.courseViews")}
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {refreshedPerformance.views.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaGraduationCap className="text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t("instructor.dashboard.enrollments")}
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.recentEnrollments.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaClock className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t("instructor.dashboard.watchTime")}
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {refreshedPerformance.watchTime}h
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FaChartLine className="text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t("instructor.dashboard.conversion")}
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {refreshedPerformance.conversionRate}%
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {t("instructor.dashboard.quickActions")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <QuickAction key={action.title} {...action} />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent Messages */}
          <RecentMessages
            messages={messages?.data?.messages || []}
            isLoading={false}
          />
        </div>

        {/* Top Rated Courses */}
        <div className="mt-9">
          <TopCourses
            courses={courses?.data?.courses || []}
            formatCurrency={formatCurrency}
            isLoading={coursesLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;

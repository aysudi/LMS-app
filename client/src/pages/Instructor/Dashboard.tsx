import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaDollarSign,
  FaUsers,
  FaBook,
  FaStar,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaClock,
  FaChartLine,
  FaGraduationCap,
  FaComment,
  FaPlus,
  FaChevronRight,
} from "react-icons/fa";
import {
  useInstructorOverview,
  useInstructorCoursesWithStats,
  useInstructorMessages,
  useMessageStats,
} from "../../hooks/useInstructor";
import { useInstructorAnalytics } from "../../hooks/useInstructorHelpers";
import Loading from "../../components/Common/Loading";

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease";
  subtitle?: string;
  color: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  value,
  change,
  changeType,
  subtitle,
  color,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon className="text-xl text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {change !== undefined && (
                  <div
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      changeType === "increase"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {changeType === "increase" ? (
                      <FaArrowUp className="text-xs" />
                    ) : (
                      <FaArrowDown className="text-xs" />
                    )}
                    <span>{Math.abs(change)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );
};

interface QuickActionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
  color: string;
}

const QuickAction: React.FC<QuickActionProps> = ({
  icon: Icon,
  title,
  description,
  onClick,
  color,
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 text-left group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="text-xl text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
              {title}
            </h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        <FaChevronRight className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300" />
      </div>
    </motion.button>
  );
};

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d">(
    "30d"
  );

  // Fetch dashboard data
  const { data: overview, isLoading: overviewLoading } =
    useInstructorOverview();
  const { data: courses, isLoading: coursesLoading } =
    useInstructorCoursesWithStats({
      page: 1,
      limit: 5,
      status: "published",
    });
  const { data: messages } = useInstructorMessages({
    page: 1,
    limit: 5,
    status: "unread",
  });
  const { data: messageStats } = useMessageStats();

  // Helper hooks
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
            No data available
          </h2>
          <p className="text-gray-600 mt-2">Unable to load dashboard data</p>
        </div>
      </div>
    );
  }

  const { overview: stats, performance } = overview.data;

  // Calculate growth rates (mock data for demo)
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
      title: "Create New Course",
      description: "Start building your next course",
      onClick: () => navigate("/instructor/courses/create"),
      color: "bg-gradient-to-r from-indigo-500 to-purple-600",
    },
    {
      icon: FaComment,
      title: "Reply to Messages",
      description: `${
        messageStats?.data?.byStatus?.unread || 0
      } unread messages`,
      onClick: () => navigate("/instructor/messages"),
      color: "bg-gradient-to-r from-blue-500 to-cyan-600",
    },
    {
      icon: FaChartLine,
      title: "View Analytics",
      description: "Detailed performance insights",
      onClick: () => navigate("/instructor/analytics"),
      color: "bg-gradient-to-r from-green-500 to-teal-600",
    },
    {
      icon: FaDollarSign,
      title: "Check Earnings",
      description: "Review your revenue and payouts",
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's what's happening with your courses.
          </p>
        </motion.div>

        {/* Time Period Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex space-x-2 bg-white rounded-xl p-2 border border-gray-200 w-fit">
            {[
              { key: "7d", label: "Last 7 days" },
              { key: "30d", label: "Last 30 days" },
              { key: "90d", label: "Last 90 days" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedPeriod(key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedPeriod === key
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FaDollarSign}
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            change={revenueGrowth}
            changeType={revenueGrowth >= 0 ? "increase" : "decrease"}
            subtitle={`${formatCurrency(stats.monthlyRevenue)} this month`}
            color="bg-gradient-to-r from-green-500 to-emerald-600"
            delay={0.1}
          />

          <StatCard
            icon={FaUsers}
            title="Total Students"
            value={stats.totalStudents.toLocaleString()}
            change={studentsGrowth}
            changeType={studentsGrowth >= 0 ? "increase" : "decrease"}
            subtitle={`${stats.recentEnrollments} recent enrollments`}
            color="bg-gradient-to-r from-blue-500 to-cyan-600"
            delay={0.2}
          />

          <StatCard
            icon={FaBook}
            title="Published Courses"
            value={stats.totalCourses}
            subtitle={`${stats.completions} completions`}
            color="bg-gradient-to-r from-indigo-500 to-purple-600"
            delay={0.3}
          />

          <StatCard
            icon={FaStar}
            title="Average Rating"
            value={stats.averageRating.toFixed(1)}
            subtitle="Based on student reviews"
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
                <h3 className="font-semibold text-gray-900">Course Views</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {performance.views.toLocaleString()}
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
                <h3 className="font-semibold text-gray-900">Enrollments</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {performance.enrollments.toLocaleString()}
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
                <h3 className="font-semibold text-gray-900">Watch Time</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {performance.watchTime}h
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
                <h3 className="font-semibold text-gray-900">Conversion</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {performance.conversionRate}%
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
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <QuickAction key={action.title} {...action} />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent Messages */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Recent Messages
                </h2>
                <button
                  onClick={() => navigate("/instructor/messages")}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View All
                </button>
              </div>

              {messages?.data?.messages?.length === 0 ? (
                <div className="text-center py-8">
                  <FaComment className="text-4xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No messages yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages?.data?.messages?.slice(0, 5).map((message) => (
                    <div
                      key={message._id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                      onClick={() =>
                        navigate(`/instructor/messages/${message._id}`)
                      }
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900 truncate">
                              {message.student.firstName}{" "}
                              {message.student.lastName}
                            </h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                message.status === "unread"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {message.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {message.subject}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Courses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Your Courses</h2>
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate("/instructor/courses/create")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
                >
                  Create Course
                </button>
                <button
                  onClick={() => navigate("/instructor/courses")}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                >
                  View All
                </button>
              </div>
            </div>

            {coursesLoading ? (
              <div className="flex justify-center py-8">
                <Loading />
              </div>
            ) : courses?.data?.courses?.length === 0 ? (
              <div className="text-center py-12">
                <FaBook className="text-4xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No courses yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first course to get started
                </p>
                <button
                  onClick={() => navigate("/instructor/courses/create")}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
                >
                  Create Your First Course
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses?.data?.courses?.map((course) => (
                  <motion.div
                    key={course._id}
                    whileHover={{ scale: 1.02 }}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={() =>
                      navigate(`/instructor/courses/${course._id}`)
                    }
                  >
                    <div className="aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 relative">
                      {course.image ? (
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaBook className="text-4xl text-white opacity-50" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            course.isPublished
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {course.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {course.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{course.studentsEnrolled.length} students</span>
                        <span>
                          {formatCurrency(course.originalPrice)} revenue
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 mt-2">
                        <FaStar className="text-yellow-400 text-sm" />
                        <span className="text-sm text-gray-600">
                          {course.rating?.toFixed(1) || "No ratings"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InstructorDashboard;

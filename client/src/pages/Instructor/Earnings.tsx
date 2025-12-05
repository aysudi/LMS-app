import { useState } from "react";
import { motion } from "framer-motion";
// @ts-ignore
import { useTranslation } from "react-i18next";
import {
  FaDollarSign,
  FaDownload,
  FaCreditCard,
  FaChartBar,
  FaBook,
  FaUsers,
  FaPiggyBank,
  FaClock,
} from "react-icons/fa";
import Loading from "../../components/Common/Loading";
import {
  useInstructorAnalytics,
  useInstructorEarnings,
  useInstructorEarningsByCourse,
  useMonthlyAnalytics,
} from "../../hooks/useInstructor";
import { exportEarningsReport } from "../../services/instructor.service";
import EarningsCard from "../../components/Instructor/Earnings/EarningsCard";
import { useSnackbar } from "notistack";

const InstructorEarnings = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [selectedPeriod, setSelectedPeriod] = useState<"30d" | "90d" | "1y">(
    "30d"
  );
  const [isExporting, setIsExporting] = useState(false);
  const [isRequestingPayout, _] = useState(false);

  const { formatCurrency } = useInstructorAnalytics();

  // Fetch real earnings data
  const { data: earningsData, isLoading: earningsLoading } =
    useInstructorEarnings();
  const { data: courseEarningsData, isLoading: courseEarningsLoading } =
    useInstructorEarningsByCourse();
  const { data: monthlyData, isLoading: monthlyLoading } =
    useMonthlyAnalytics("6m");

  if (earningsLoading || courseEarningsLoading || monthlyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  const earnings = earningsData?.data || {
    totalGross: 0,
    totalPlatformFees: 0,
    totalInstructorShare: 0,
    totalPending: 0,
    totalPaid: 0,
    count: 0,
  };

  const courseEarnings = courseEarningsData?.data || [];

  const handleDownloadReport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportEarningsReport("csv", selectedPeriod);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `earnings-report-${selectedPeriod}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      enqueueSnackbar("Report downloaded successfully!", {
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
              {t("navigation.earnings")}
            </h1>
            <p className="text-gray-600 mt-2">
              {t("instructor.trackRevenueManagePayouts")}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Period Selector */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="30d">{t("filters.last30Days")}</option>
              <option value="90d">{t("filters.last90Days")}</option>
              <option value="1y">{t("filters.lastYear")}</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadReport}
              disabled={isExporting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
              ) : (
                <FaDownload className="text-sm" />
              )}
              <span>{isExporting ? "Exporting..." : t("common.export")}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadReport}
              disabled={
                isRequestingPayout || earnings.totalInstructorShare < 50
              }
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRequestingPayout ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <FaCreditCard className="text-sm" />
              )}
              <span>
                {isRequestingPayout
                  ? "Processing..."
                  : t("instructor.downloadReport")}
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Platform Fee Summary */}
        {earnings.totalGross > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 p-4 mb-6"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {t("instructor.earnings.platformFee")}:
              </span>
              <span className="font-medium text-gray-900">
                {formatCurrency(earnings.totalPlatformFees)}
              </span>
            </div>
          </motion.div>
        )}

        {/* Earnings Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <EarningsCard
            icon={FaDollarSign}
            title={t("instructor.earnings.totalEarnings")}
            value={formatCurrency(earnings.totalInstructorShare)}
            change={15.2}
            changeType="increase"
            color="bg-gradient-to-r from-green-500 to-emerald-600"
          />

          <EarningsCard
            icon={FaPiggyBank}
            title={t("instructor.earnings.grossRevenue")}
            value={formatCurrency(earnings.totalGross)}
            subtitle={t("instructor.earnings.beforePlatformFees")}
            color="bg-gradient-to-r from-blue-500 to-cyan-600"
          />

          <EarningsCard
            icon={FaClock}
            title={t("instructor.earnings.pendingEarnings")}
            value={formatCurrency(earnings.totalPending)}
            subtitle={t("instructor.earnings.processingPeriod")}
            color="bg-gradient-to-r from-yellow-500 to-orange-600"
          />

          <EarningsCard
            icon={FaChartBar}
            title={t("instructor.earnings.paidEarnings")}
            value={formatCurrency(earnings.totalPaid)}
            subtitle={t("instructor.earnings.completedPayouts")}
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
              {t("instructor.earnings.monthlyEarningsTrend")}
            </h2>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <span className="text-gray-600">
                  {t("instructor.earnings.earnings")}
                </span>
              </div>
            </div>
          </div>

          <div className="h-80 flex items-end justify-between space-x-4 px-4">
            {monthlyData?.data && monthlyData.data.length > 0 ? (
              monthlyData.data.map((data: any, index: number) => {
                const maxAmount = Math.max(
                  ...monthlyData.data.map((d: any) => d.earnings || 0)
                );
                return (
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
                            maxAmount > 0
                              ? ((data.earnings || 0) / maxAmount) * 100
                              : 5
                          )}%`,
                        }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 transition-opacity">
                          {formatCurrency(data.earnings || 0)}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      {data.month ||
                        new Date(
                          Date.now() -
                            (monthlyData.data.length - 1 - index) *
                              30 *
                              24 *
                              60 *
                              60 *
                              1000
                        ).toLocaleDateString("en-US", { month: "short" })}
                    </span>
                  </div>
                );
              })
            ) : (
              // Fallback display when no data
              <div className="flex items-center justify-center w-full h-64 text-gray-500">
                <div className="text-center">
                  <FaDollarSign className="text-4xl mx-auto mb-2 text-gray-300" />
                  <p>No earnings data available</p>
                </div>
              </div>
            )}
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
              {t("instructor.earnings.earningsByCourse")}
            </h2>

            {courseEarnings.length === 0 ? (
              <div className="text-center py-12">
                <FaBook className="text-4xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {t("instructor.earnings.noEarningsData")}
                </p>
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
                          {course.course?.title || `Course ${index + 1}`}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <FaUsers className="text-xs" />
                            <span>
                              {course.student?.firstName}{" "}
                              {course.student?.lastName}
                            </span>
                          </span>
                          <span>{course.payoutStatus}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(course.instructorShare || 0)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t("instructor.earnings.gross")}:{" "}
                        {formatCurrency(course.grossAmount || 0)}
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
              {t("instructor.earnings.recentPayouts")}
            </h2>

            {earnings.totalPaid === 0 ? (
              <div className="text-center py-12">
                <FaCreditCard className="text-4xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {t("instructor.earnings.noPayoutsYet")}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {t("instructor.earnings.payoutsWillAppear")}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {
                  // Create mock recent payouts for demo
                  Array.from({ length: 3 }, (_, i) => ({
                    amount: Math.round(
                      (earnings.totalPaid / 3 || 0) *
                        (0.8 + Math.random() * 0.4)
                    ),
                    date: new Date(
                      Date.now() - i * 30 * 24 * 60 * 60 * 1000
                    ).toISOString(),
                    status: "completed",
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
                  ))
                }
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
                {t("instructor.earnings.payoutInformation")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    {t("instructor.earnings.payoutSchedule")}
                  </h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>
                      • {t("instructor.earnings.payoutsProcessedMonthly")}
                    </li>
                    <li>• {t("instructor.earnings.minimumPayout")}</li>
                    <li>• {t("instructor.earnings.processingTime")}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    {t("instructor.earnings.revenueShare")}
                  </h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• {t("instructor.earnings.instructorShare")}</li>
                    <li>• {t("instructor.earnings.platformFeePercent")}</li>
                    <li>• {t("instructor.earnings.noHiddenCharges")}</li>
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

export default InstructorEarnings;

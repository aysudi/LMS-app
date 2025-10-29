import { motion } from "framer-motion";
import {
  FaGraduationCap,
  FaClock,
  FaUsers,
  FaStar,
  FaChartLine,
} from "react-icons/fa";
import type { Course } from "../../types/course.type";
// @ts-ignore
import { useTranslation } from "react-i18next";

interface CartStatsProps {
  courses: Course[];
}

const CartStats: React.FC<CartStatsProps> = ({ courses }) => {
  const { t } = useTranslation();
  const totalCourses = courses.length;
  const totalDuration = courses.reduce(
    (sum, course) => sum + (course.totalDuration || 0),
    0
  );
  const totalLessons = courses.reduce(
    (sum, course) => sum + (course.totalLessons || 0),
    0
  );
  const averageRating =
    courses.reduce((sum, course) => sum + (course.rating || 0), 0) /
      courses.length || 0;
  const totalStudents = courses.reduce(
    (sum, course) => sum + (course.enrollmentCount || 0),
    0
  );

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const stats = [
    {
      icon: FaGraduationCap,
      label: t("common.courses"),
      value: totalCourses,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      icon: FaClock,
      label: t("cart.totalDuration"),
      value: formatDuration(totalDuration * 60), // Convert minutes to seconds for formatDuration
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      icon: FaUsers,
      label: t("common.lessons"),
      value: totalLessons,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      icon: FaStar,
      label: t("cart.avgRating"),
      value: averageRating.toFixed(1),
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
  ];

  if (totalCourses === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200"
    >
      <div className="flex items-center space-x-2 mb-4">
        <FaChartLine className="text-lg text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">
          {t("cart.learningOverview")}
        </h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.bgColor} rounded-lg p-4 text-center relative overflow-hidden`}
          >
            {/* Background gradient */}
            <div
              className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${stat.color} opacity-10 rounded-full transform translate-x-6 -translate-y-6`}
            />

            <div className="relative z-10">
              <div
                className={`inline-flex items-center justify-center w-10 h-10 ${stat.textColor} mb-2`}
              >
                <stat.icon className="text-xl" />
              </div>
              <div className={`text-2xl font-bold ${stat.textColor} mb-1`}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
        <p className="text-sm text-gray-700 text-center">
          🎯{" "}
          {t("cart.aboutToJoinStudents", {
            count: totalStudents.toLocaleString(),
          })}
        </p>
      </div>
    </motion.div>
  );
};

export default CartStats;

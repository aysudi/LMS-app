import { t } from "i18next";
import { motion } from "framer-motion";
import { FaChartLine, FaClock, FaGraduationCap, FaUsers } from "react-icons/fa";

const StatsCards = ({
  instructorCourses,
  allStudents,
}: {
  instructorCourses: any[];
  allStudents: any[];
}) => {
  const totalStudents = instructorCourses.reduce(
    (acc, course) => acc + (course.studentsEnrolled?.length || 0),
    0
  );

  const completedStudents = allStudents.filter(
    (s) => s.progress?.progressPercentage === 100
  ).length;

  const activeToday = allStudents.filter((s) => {
    const lastActive = new Date(s.enrollment?.lastAccessedAt || 0);
    const today = new Date();
    return lastActive.toDateString() === today.toDateString();
  }).length;

  const averageProgress =
    allStudents.length > 0
      ? Math.round(
          allStudents.reduce(
            (acc, s) => acc + (s.progress?.progressPercentage || 0),
            0
          ) / allStudents.length
        )
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <FaUsers className="text-xl text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              {t("instructor.students.totalStudents")}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {totalStudents.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-green-100 rounded-xl">
            <FaChartLine className="text-xl text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              {t("instructor.students.averageProgress")}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {averageProgress}%
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-yellow-100 rounded-xl">
            <FaGraduationCap className="text-xl text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              {t("student.completedCourses")}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {completedStudents}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-100 rounded-xl">
            <FaClock className="text-xl text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              {t("instructor.students.activeToday")}
            </p>
            <p className="text-2xl font-bold text-gray-900">{activeToday}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCards;

import { motion } from "framer-motion";
import { FaBook, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface Course {
  _id: string;
  title: string;
  image?: { url: string } | string;
  isPublished: boolean;
  studentsEnrolled: any[];
  originalPrice: number;
  rating?: number;
}

interface TopCoursesProps {
  courses: Course[];
  formatCurrency: (amount: number) => string;
  isLoading?: boolean;
}

const TopCourses: React.FC<TopCoursesProps> = ({
  courses,
  formatCurrency,
  isLoading,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const topRatedCourses = courses
    .filter(
      (course) => course.isPublished && course.rating && course.rating > 0
    )
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {t("instructor.dashboard.topRatedCourses")}
        </h2>
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-12 bg-gray-300 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {t("instructor.dashboard.topRatedCourses")}
        </h2>
        <button
          onClick={() => navigate("/instructor/courses")}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          {t("instructor.dashboard.viewAll")}
        </button>
      </div>

      {topRatedCourses.length === 0 ? (
        <div className="text-center py-12">
          <FaBook className="text-4xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("instructor.dashboard.noRatedCourses")}
          </h3>
          <p className="text-gray-600 mb-6">
            {t("instructor.dashboard.coursesWillAppear")}
          </p>
          <button
            onClick={() => navigate("/instructor/courses/create")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
          >
            {t("instructor.dashboard.createFirstCourse")}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {topRatedCourses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 cursor-pointer"
              onClick={() =>
                navigate(`/instructor/courses/${course._id}/preview`)
              }
            >
              <div className="relative">
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
              </div>

              <div className="flex-shrink-0">
                {course.image ? (
                  <img
                    src={
                      typeof course.image === "string"
                        ? course.image
                        : course.image.url
                    }
                    alt={course.title}
                    className="w-16 h-12 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <FaBook className="text-white text-sm" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate mb-1">
                  {course.title}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <FaStar className="text-yellow-400 text-xs" />
                    <span className="font-medium">
                      {course.rating?.toFixed(1)}
                    </span>
                  </div>
                  <span>
                    {t("instructor.dashboard.studentsCount", {
                      count: course.studentsEnrolled?.length || 0,
                    })}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold text-gray-900 text-sm">
                  {formatCurrency(course.originalPrice)}
                </p>
                <p className="text-xs text-gray-500">{t("common.price")}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default TopCourses;

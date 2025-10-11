import { motion } from "framer-motion";
import { FaUsers, FaStar } from "react-icons/fa";

interface CoursePerformanceProps {
  courses: Array<{
    name: string;
    students: number;
    rating: number;
    revenue: number;
  }>;
  formatCurrency: (amount: number) => string;
}

const CoursePerformance: React.FC<CoursePerformanceProps> = ({ 
  courses, 
  formatCurrency 
}) => {
  return (
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
        {courses.map((course, index) => (
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
                    <span>{course.rating.toFixed(1)}</span>
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
  );
};

export default CoursePerformance;

import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { usePersonalization } from "../../hooks/usePersonalization";
import { motion } from "framer-motion";
import type { Course } from "../../types/course.type";
import { FaClock, FaStar, FaUsers } from "react-icons/fa";

const CourseCard = ({
  course,
  viewMode = "grid",
}: {
  course: Course;
  viewMode?: "grid" | "list";
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const { addViewedCourse } = usePersonalization();

  const handleCourseClick = (course: any) => {
    if (isAuthenticated) {
      addViewedCourse(course.id);
    }
    navigate(`/course/${course.id}`);
  };

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200 hover:border-gray-300 cursor-pointer group"
        onClick={() => handleCourseClick(course)}
      >
        <div className="flex">
          <div className="relative w-64 h-40 flex-shrink-0">
            <img
              src={
                course.image.url ||
                "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop"
              }
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium rounded-full">
                {course.level}
              </span>
            </div>
          </div>

          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full mr-3">
                    {course.category}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                  {course.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.shortDescription || course.description}
                </p>
              </div>
              <div className="ml-4 text-right">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {course.isFree || course.originalPrice === 0
                    ? "FREE"
                    : `$${course.discountPrice || course.originalPrice}`}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <FaStar className="text-yellow-400" />
                  <span className="font-medium text-gray-700">
                    {course.rating || 0}
                  </span>
                  <span className="text-gray-500">
                    ({course.ratingsCount || 0})
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <FaUsers className="text-indigo-500" />
                  <span className="text-gray-600">
                    {Number(course.enrollmentCount || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <FaClock className="text-gray-500" />
                  <span className="text-gray-600">
                    {Math.round(course.totalDuration / 60) || 0}h
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {course.instructor?.firstName?.charAt(0) || "I"}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {course.instructor?.firstName} {course.instructor?.lastName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 transform hover:-translate-y-2 cursor-pointer"
      onClick={() => handleCourseClick(course)}
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={
            course.image.url ||
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop"
          }
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold rounded-full shadow-sm">
            {course.level}
          </span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

        {course.discountPrice &&
          course.originalPrice > course.discountPrice && (
            <div className="absolute bottom-4 left-4">
              <span className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                {Math.round(
                  (1 - course.discountPrice / course.originalPrice) * 100
                )}
                % OFF
              </span>
            </div>
          )}
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">
            {course.category}
          </span>
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900">
              {course.isFree || course.originalPrice === 0
                ? "FREE"
                : `$${course.discountPrice || course.originalPrice}`}
            </div>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-300 line-clamp-2 leading-tight">
          {course.title}
        </h3>

        <p className="text-gray-600 text-sm mb-5 line-clamp-2 leading-relaxed">
          {course.shortDescription || course.description}
        </p>

        <div className="flex items-center justify-between text-sm mb-5">
          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`text-xs ${
                    i < Math.floor(course.rating || 0)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="font-semibold text-gray-800 ml-1">
              {course.rating || 0}
            </span>
            <span className="text-gray-500">({course.ratingsCount || 0})</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-gray-600">
              <FaUsers className="text-indigo-500" />
              <span className="font-medium">
                {Number(course.enrollmentCount || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">
                {course.instructor?.firstName?.charAt(0) || "I"}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {course.instructor?.firstName} {course.instructor?.lastName}
              </p>
              <p className="text-xs text-gray-500">Instructor</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-gray-500">
            <FaClock className="text-xs" />
            <span className="text-xs font-medium">
              {Math.round(course.totalDuration / 60) || 0}h
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;

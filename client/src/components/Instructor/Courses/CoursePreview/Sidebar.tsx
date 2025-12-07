import { formatDuration } from "date-fns";
import {
  FaBook,
  FaCertificate,
  FaClock,
  FaDownload,
  FaGlobe,
  FaPlay,
  FaStar,
  FaUsers,
} from "react-icons/fa";
import { motion } from "framer-motion";

const Sidebar = ({ course }: { course: any }) => {
  return (
    <div className="lg:col-span-1">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6"
      >
        {/* Price */}
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-gray-900">
            {course.isFree ? "Free" : `$${course.originalPrice}`}
          </div>
        </div>

        {/* Course Stats */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center space-x-2">
              <FaClock />
              <span>Duration</span>
            </span>
            <span className="font-medium">
              {formatDuration(course.totalDuration || 0)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center space-x-2">
              <FaBook />
              <span>Lessons</span>
            </span>
            <span className="font-medium">{course.totalLessons || 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center space-x-2">
              <FaUsers />
              <span>Students</span>
            </span>
            <span className="font-medium">
              {course.studentsEnrolled?.length || 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center space-x-2">
              <FaStar />
              <span>Rating</span>
            </span>
            <span className="font-medium">
              {course.rating > 0 ? course.rating.toFixed(1) : "No rating"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center space-x-2">
              <FaGlobe />
              <span>Language</span>
            </span>
            <span className="font-medium">{course.language}</span>
          </div>
          {course.certificateProvided && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center space-x-2">
                <FaCertificate />
                <span>Certificate</span>
              </span>
              <span className="font-medium text-green-600">Included</span>
            </div>
          )}
        </div>

        {/* Course Features */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="font-semibold text-gray-900 mb-3">
            This course includes:
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center space-x-2">
              <FaPlay className="text-indigo-500" />
              <span>On-demand video</span>
            </li>
            <li className="flex items-center space-x-2">
              <FaDownload className="text-indigo-500" />
              <span>Downloadable resources</span>
            </li>
            <li className="flex items-center space-x-2">
              <FaGlobe className="text-indigo-500" />
              <span>Access on mobile and desktop</span>
            </li>
            {course.certificateProvided && (
              <li className="flex items-center space-x-2">
                <FaCertificate className="text-indigo-500" />
                <span>Certificate of completion</span>
              </li>
            )}
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default Sidebar;

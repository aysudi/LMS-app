import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUsers, FaStar, FaDollarSign, FaClock, FaBook } from "react-icons/fa";

interface CourseCardProps {
  course: any;
  onEdit: () => void;
  onDelete: () => void;
  onSubmitForApproval?: (courseId: string) => void;
  onSelect: () => void;
  isSelected: boolean;
  formatCurrency: (amount: number) => string;
  delay?: number;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onEdit,
  onSelect,
  isSelected,
  formatCurrency,
  delay = 0,
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-300 overflow-hidden hover:shadow-md ${
        isSelected
          ? "border-indigo-500 ring-2 ring-indigo-200"
          : "border-gray-200"
      }`}
    >
      {/* Course Image */}
      <div className="relative aspect-video bg-gradient-to-br from-indigo-500 to-purple-600">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="absolute top-3 left-3 z-10 rounded-xl w-5 h-5 bg-white border-2 border-gray-300 text-indigo-500 cursor-pointer"
        />

        {course.image ? (
          <img
            src={course.image.url}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FaBook className="text-4xl text-white opacity-50" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              course.isPublished
                ? "bg-green-100 text-green-800"
                : course.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {course.isPublished
              ? "Published"
              : course.status === "pending"
              ? "Pending"
              : "Draft"}
          </span>
        </div>
      </div>

      {/* Course Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center space-x-1 text-gray-600">
            <FaUsers className="text-xs" />
            <span>{course.studentsEnrolled?.length || 0} students</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <FaStar className="text-xs text-yellow-400" />
            <span>{course.rating?.toFixed(1) || "No ratings"}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <FaDollarSign className="text-xs" />
            <span>{formatCurrency(course.originalPrice || 0)}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <FaClock className="text-xs" />
            <span>{course.totalDuration || 0}h</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 cursor-pointer"
          >
            Edit
          </button>
          <button
            onClick={() =>
              navigate(`/instructor/courses/${course._id}/preview`)
            }
            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
          >
            View
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;

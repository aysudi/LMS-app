import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaTrash,
  FaPlay,
  FaPause,
  FaEllipsisV,
  FaBook,
  FaStar,
} from "react-icons/fa";

export interface CoursesHeaderProps {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  averageRating: number;
  selectedCourses: string[];
  onBulkDelete: () => void;
  onBulkPublish: () => void;
  onBulkUnpublish: () => void;
}

const CoursesHeader: React.FC<CoursesHeaderProps> = ({
  totalCourses,
  publishedCourses,
  draftCourses,
  averageRating,
  selectedCourses,
  onBulkDelete,
  onBulkPublish,
  onBulkUnpublish,
}) => {
  const [showBulkActions, setShowBulkActions] = useState(false);
  const navigate = useNavigate();

  const stats = [
    {
      label: "Total Courses",
      value: totalCourses,
      icon: FaBook,
      color: "indigo",
    },
    {
      label: "Published",
      value: publishedCourses,
      icon: FaPlay,
      color: "green",
    },
    {
      label: "Drafts",
      value: draftCourses,
      icon: FaPause,
      color: "yellow",
    },
    // {
    //   label: "Total Students",
    //   value: totalStudents,
    //   icon: FaUsers,
    //   color: "blue",
    // },
    // {
    //   label: "Total Revenue",
    //   value: formatCurrency(totalRevenue),
    //   icon: FaDollarSign,
    //   color: "emerald",
    // },
    {
      label: "Average Rating",
      value: averageRating ? averageRating.toFixed(1) : "No ratings",
      icon: FaStar,
      color: "amber",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      indigo: "bg-indigo-500 text-white",
      green: "bg-green-500 text-white",
      yellow: "bg-yellow-500 text-white",
      blue: "bg-blue-500 text-white",
      emerald: "bg-emerald-500 text-white",
      amber: "bg-amber-500 text-white",
    };
    return colors[color as keyof typeof colors] || "bg-gray-500 text-white";
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="mt-1 text-gray-600">
            Manage and track your course performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Bulk Actions */}
          {selectedCourses.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2"
              >
                <span>{selectedCourses.length} selected</span>
                <FaEllipsisV className="text-sm" />
              </button>

              <AnimatePresence>
                {showBulkActions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
                  >
                    <button
                      onClick={() => {
                        onBulkPublish();
                        setShowBulkActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <FaPlay className="text-xs" />
                      <span>Publish Selected</span>
                    </button>
                    <button
                      onClick={() => {
                        onBulkUnpublish();
                        setShowBulkActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <FaPause className="text-xs" />
                      <span>Unpublish Selected</span>
                    </button>
                    <button
                      onClick={() => {
                        onBulkDelete();
                        setShowBulkActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <FaTrash className="text-xs" />
                      <span>Delete Selected</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Create Course Button */}
          <button
            onClick={() => navigate("/instructor/courses/create")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
          >
            <FaPlus className="text-sm" />
            <span>Create Course</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${getColorClasses(stat.color)}`}>
                <stat.icon className="text-sm" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions Bar */}
      {/* <div className="flex flex-wrap gap-2">
        <button
          onClick={() => navigate("/instructor/create-course")}
          className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium hover:bg-indigo-200 transition-colors duration-200"
        >
          + New Course
        </button>
        <button
          onClick={() => navigate("/instructor/analytics")}
          className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium hover:bg-green-200 transition-colors duration-200"
        >
          View Analytics
        </button>
        <button
          onClick={() => navigate("/instructor/students")}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors duration-200"
        >
          Manage Students
        </button>
        <button
          onClick={onExport}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
        >
          Export Data
        </button>
      </div> */}
    </div>
  );
};

export default CoursesHeader;

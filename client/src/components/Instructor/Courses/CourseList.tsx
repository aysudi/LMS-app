import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CourseCard from "./CourseCard";
import { FaList, FaTable, FaTh } from "react-icons/fa";

interface CourseListProps {
  courses: any[];
  onEdit: (courseId: string) => void;
  onDelete: (courseId: string) => void;
  onSubmitForApproval?: (courseId: string) => void;
  selectedCourses: string[];
  onSelectCourse: (courseId: string) => void;
  onSelectAll: () => void;
  isAllSelected: boolean;
  formatCurrency: (amount: number) => string;
}

type ViewMode = "grid" | "list" | "compact";

const CourseList: React.FC<CourseListProps> = ({
  courses,
  onEdit,
  onDelete,
  selectedCourses,
  onSelectCourse,
  onSelectAll,
  isAllSelected,
  formatCurrency,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const handleEdit = (courseId: string) => {
    onEdit(courseId);
  };

  const handleDelete = (courseId: string) => {
    onDelete(courseId);
  };

  const handleSelectCourse = (courseId: string) => {
    onSelectCourse(courseId);
  };

  if (!courses?.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <div className="text-gray-400 mb-4">
          <FaTh className="text-6xl mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          No courses found
        </h3>
        <p className="text-gray-500">
          Start by creating your first course to get started.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Mode Selector & Bulk Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={onSelectAll}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-600">
            {selectedCourses.length > 0
              ? `${selectedCourses.length} selected`
              : "Select all"}
          </span>
        </div>

        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-colors duration-200 ${
              viewMode === "grid"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
            title="Grid view"
          >
            <FaTh className="text-sm" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors duration-200 ${
              viewMode === "list"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
            title="List view"
          >
            <FaList className="text-sm" />
          </button>
          <button
            onClick={() => setViewMode("compact")}
            className={`p-2 rounded-md transition-colors duration-200 ${
              viewMode === "compact"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
            title="Compact view"
          >
            <FaTable className="text-sm" />
          </button>
        </div>
      </div>

      {/* Course Grid/List */}
      <AnimatePresence mode="wait">
        {viewMode === "grid" && (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {courses.map((course, index) => (
              <CourseCard
                key={course._id}
                course={course}
                onEdit={() => handleEdit(course._id)}
                onDelete={() => handleDelete(course._id)}
                onSelect={() => handleSelectCourse(course._id)}
                isSelected={selectedCourses.includes(course._id)}
                formatCurrency={formatCurrency}
                delay={index * 0.05}
              />
            ))}
          </motion.div>
        )}

        {viewMode === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {courses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course._id)}
                    onChange={() => handleSelectCourse(course._id)}
                    className="rounded border-gray-300 text-indigo-600"
                  />

                  <div className="w-20 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex-shrink-0">
                    {course.image?.url && (
                      <img
                        src={course.image.url}
                        alt={course.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {course.title}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span>
                        {course.studentsEnrolled?.length || 0} students
                      </span>
                      <span>{formatCurrency(course.originalPrice || 0)}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          course.isPublished
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(course._id)}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        window.open(
                          `/instructor/courses/${course._id}/preview`,
                          "_blank"
                        )
                      }
                      className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {viewMode === "compact" && (
          <motion.div
            key="compact"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={onSelectAll}
                        className="rounded border-gray-300 text-indigo-600"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Students
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courses.map((course, index) => (
                    <motion.tr
                      key={course._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedCourses.includes(course._id)}
                          onChange={() => handleSelectCourse(course._id)}
                          className="rounded border-gray-300 text-indigo-600"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded flex-shrink-0 mr-3">
                            {course.image?.url && (
                              <img
                                src={course.image.url}
                                alt={course.title}
                                className="w-full h-full object-cover rounded"
                              />
                            )}
                          </div>
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {course.title}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.studentsEnrolled?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(course.originalPrice || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            course.isPublished
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {course.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(course._id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            window.open(
                              `/instructor/courses/${course._id}/preview`,
                              "_blank"
                            )
                          }
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Preview
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseList;

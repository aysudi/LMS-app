import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaSort,
  FaEye,
  FaEdit,
  FaTrash,
  FaUsers,
  FaStar,
  FaDollarSign,
  FaBook,
  FaChevronDown,
  FaTh,
  FaList,
  FaEllipsisV,
  FaClock,
  FaPlay,
} from "react-icons/fa";
import {
  useInstructorCoursesWithStats,
  useDeleteCourse,
  useToggleCourseStatus,
} from "../../hooks/useInstructor";
import { useInstructorAnalytics } from "../../hooks/useInstructorHelpers";
import Loading from "../../components/Common/Loading";
import { useToast } from "../../components/UI/ToastProvider";
import Swal from "sweetalert2";

type ViewMode = "grid" | "list";
type SortOption =
  | "newest"
  | "oldest"
  | "title"
  | "students"
  | "revenue"
  | "rating";
type CourseStatus = "draft" | "published" | "archived";

interface FilterOptions {
  status: CourseStatus | "all";
  category: string;
  priceRange: "all" | "free" | "paid";
}

const InstructorCourses = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
    category: "",
    priceRange: "all",
  });
  const [page, setPage] = useState(1);

  const {
    data: coursesData,
    isLoading,
    error,
  } = useInstructorCoursesWithStats({
    page,
    limit: 12,
    status:
      filters.status !== "all" && filters.status !== "archived"
        ? filters.status
        : "all",
  });

  const { formatCurrency } = useInstructorAnalytics();
  const { showToast } = useToast();

  const deleteMutation = useDeleteCourse({
    onSuccess: (data) => {
      showToast({
        title: "✅ Course Deleted",
        message: data.message,
        type: "success",
        duration: 3000,
      });
      // Clear selection after successful deletion
      setSelectedCourses((prev) => prev.filter((id) => !prev.includes(id)));
    },
    onError: (error) => {
      showToast({
        title: "❌ Delete Failed",
        message: error.message || "Failed to delete course. Please try again.",
        type: "error",
        duration: 4000,
      });
    },
  });

  const toggleStatusMutation = useToggleCourseStatus({
    onSuccess: (data) => {
      showToast({
        title: "🎯 Status Updated",
        message: data.message,
        type: "success",
        duration: 3000,
      });
    },
    onError: (error) => {
      showToast({
        title: "❌ Status Update Failed",
        message:
          error.message || "Failed to update course status. Please try again.",
        type: "error",
        duration: 4000,
      });
    },
  });

  const courses = coursesData?.data?.courses || [];
  const totalPages = coursesData?.data?.pagination?.totalPages || 1;
  const totalCourses = coursesData?.data?.pagination?.totalCourses || 0;

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilters({ ...filters, ...newFilters });
    setPage(1);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setPage(1);
  };

  const handleDeleteCourse = async (courseId: string, courseTitle?: string) => {
    const result = await Swal.fire({
      title: "Delete Course",
      html: `Are you sure you want to delete <strong>"${
        courseTitle || "this course"
      }"</strong>?<br><br>This action cannot be undone and will remove all associated lessons, sections, and student progress.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton: "hover:bg-red-600 transition-colors",
        cancelButton: "hover:bg-gray-600 transition-colors",
      },
    });

    if (result.isConfirmed) {
      try {
        await deleteMutation.mutateAsync(courseId);
      } catch (error) {
        console.error("Failed to delete course:", error);
      }
    }
  };

  const handleToggleStatus = async (
    courseId: string,
    currentStatus?: boolean,
    courseTitle?: string
  ) => {
    const action = currentStatus ? "unpublish" : "publish";
    const result = await Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Course`,
      html: `Are you sure you want to ${action} <strong>"${
        courseTitle || "this course"
      }"</strong>?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: currentStatus ? "#F59E0B" : "#10B981",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `Yes, ${
        action.charAt(0).toUpperCase() + action.slice(1)
      }`,
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await toggleStatusMutation.mutateAsync(courseId);
      } catch (error) {
        console.error("Failed to toggle course status:", error);
      }
    }
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleDeleteSelectedCourses = async () => {
    if (selectedCourses.length === 0) return;

    const result = await Swal.fire({
      title: "Delete Selected Courses",
      html: `Are you sure you want to delete <strong>${selectedCourses.length} selected course(s)</strong>?<br><br>This action cannot be undone and will remove all associated lessons, sections, and student progress.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `Yes, Delete ${selectedCourses.length} Course(s)`,
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton: "hover:bg-red-600 transition-colors",
        cancelButton: "hover:bg-gray-600 transition-colors",
      },
    });

    if (result.isConfirmed) {
      try {
        // Delete courses one by one
        for (const courseId of selectedCourses) {
          await deleteMutation.mutateAsync(courseId);
        }
        // Clear selection after successful deletion
        setSelectedCourses([]);
      } catch (error) {
        console.error("Failed to delete selected courses:", error);
      }
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Error loading courses
          </h2>
          <p className="text-gray-600 mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-600 mt-2">
              Manage your courses and track their performance
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/instructor/courses/create")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium flex items-center space-x-2 cursor-pointer"
          >
            <FaPlus className="text-sm" />
            <span>Create Course</span>
          </motion.button>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === "grid"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
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
                >
                  <FaList className="text-sm" />
                </button>
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    handleSortChange(e.target.value as SortOption)
                  }
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title A-Z</option>
                  <option value="students">Most Students</option>
                  <option value="revenue">Highest Revenue</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <FaSort className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
                  showFilters
                    ? "bg-indigo-50 text-indigo-600 border-indigo-300"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FaFilter className="text-sm" />
                <span>Filters</span>
                <FaChevronDown
                  className={`text-sm transition-transform duration-200 ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange({ status: e.target.value as any })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="all">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      placeholder="Enter category..."
                      value={filters.category}
                      onChange={(e) =>
                        handleFilterChange({ category: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Price Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price
                    </label>
                    <select
                      value={filters.priceRange}
                      onChange={(e) =>
                        handleFilterChange({
                          priceRange: e.target.value as any,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="all">All Prices</option>
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center space-x-6">
            <p className="text-sm text-gray-600">
              Showing {courses.length} of {totalCourses} courses
            </p>
            {selectedCourses.length > 0 && (
              <p className="text-sm text-indigo-600 font-medium">
                {selectedCourses.length} selected
              </p>
            )}
          </div>

          {selectedCourses.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDeleteSelectedCourses}
                disabled={deleteMutation.isPending}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Selected"}
              </button>
            </div>
          )}
        </motion.div>

        {/* Courses Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {courses.length === 0 ? (
            <div className="text-center py-16">
              <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No courses found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filters.status !== "all" || filters.category
                  ? "Try adjusting your search or filters"
                  : "Create your first course to get started"}
              </p>
              <button
                onClick={() => navigate("/instructor/courses/create")}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
              >
                Create Your First Course
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map((course: any, index: number) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  onEdit={() =>
                    navigate(`/instructor/courses/${course._id}/edit`)
                  }
                  onDelete={() => handleDeleteCourse(course._id, course.title)}
                  onToggleStatus={() =>
                    handleToggleStatus(
                      course._id,
                      course.isPublished,
                      course.title
                    )
                  }
                  onSelect={() => handleSelectCourse(course._id)}
                  isSelected={selectedCourses.includes(course._id)}
                  formatCurrency={formatCurrency}
                  delay={index * 0.1}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course: any, index: number) => (
                <CourseListItem
                  key={course._id}
                  course={course}
                  onEdit={() =>
                    navigate(`/instructor/courses/${course._id}/edit`)
                  }
                  onDelete={() => handleDeleteCourse(course._id, course.title)}
                  onToggleStatus={() =>
                    handleToggleStatus(
                      course._id,
                      course.isPublished,
                      course.title
                    )
                  }
                  onSelect={() => handleSelectCourse(course._id)}
                  isSelected={selectedCourses.includes(course._id)}
                  formatCurrency={formatCurrency}
                  delay={index * 0.05}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center mt-12"
          >
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      page === pageNum
                        ? "text-white bg-indigo-600 border border-indigo-600"
                        : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              )}

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Course Card Component for Grid View
interface CourseCardProps {
  course: any;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onSelect: () => void;
  isSelected: boolean;
  formatCurrency: (amount: number) => string;
  delay?: number;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onEdit,
  onDelete,
  onToggleStatus,
  onSelect,
  isSelected,
  formatCurrency,
  delay = 0,
}) => {
  const [showMenu, setShowMenu] = useState(false);
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
          className="absolute top-3 left-3 z-10 rounded"
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
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {course.isPublished ? "Published" : "Draft"}
          </span>
        </div>

        {/* Menu */}
        <div className="absolute bottom-3 right-3">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors duration-200"
            >
              <FaEllipsisV className="text-sm" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 bottom-full mb-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
                >
                  <button
                    onClick={() => {
                      navigate(`/instructor/courses/${course._id}/preview`);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <FaEye className="text-xs" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => {
                      onEdit();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <FaEdit className="text-xs" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      onToggleStatus();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <FaPlay className="text-xs" />
                    <span>{course.isPublished ? "Unpublish" : "Publish"}</span>
                  </button>
                  <button
                    onClick={() => {
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <FaTrash className="text-xs" />
                    <span>Delete</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
            <span>{course.studentsEnrolled.length || 0} students</span>
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
            className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            Edit
          </button>
          <button
            onClick={() =>
              navigate(`/instructor/courses/${course._id}/preview`)
            }
            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            View
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Course List Item Component for List View
const CourseListItem: React.FC<CourseCardProps> = ({
  course,
  onEdit,
  onDelete,
  onToggleStatus,
  onSelect,
  isSelected,
  formatCurrency,
  delay = 0,
}) => {
  const navigate = useNavigate();
  console.log(course);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-300 p-6 hover:shadow-md ${
        isSelected
          ? "border-indigo-500 ring-2 ring-indigo-200"
          : "border-gray-200"
      }`}
    >
      <div className="flex items-center space-x-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="rounded"
        />

        {/* Course Image */}
        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 overflow-hidden">
          {course.image ? (
            <img
              src={course.image.url}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaBook className="text-xl text-white opacity-50" />
            </div>
          )}
        </div>

        {/* Course Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1 truncate">
                {course.title}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <FaUsers className="text-xs" />
                  <span>{course.studentsEnrolled.length || 0} students</span>
                </span>
                <span className="flex items-center space-x-1">
                  <FaStar className="text-xs text-yellow-400" />
                  <span>{course.rating?.toFixed(1) || "No ratings"}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <FaDollarSign className="text-xs" />
                  <span>{formatCurrency(course.originalPrice || 0)}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Status */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              course.isPublished
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {course.isPublished ? "Published" : "Draft"}
          </span>
          <button
            onClick={() =>
              navigate(`/instructor/courses/${course._id}/preview`)
            }
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
            title="View Course"
          >
            <FaEye />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
            title="Edit Course"
          >
            <FaEdit />
          </button>
          <button
            onClick={onToggleStatus}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            title={course.isPublished ? "Unpublish Course" : "Publish Course"}
          >
            <FaPlay />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Delete Course"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default InstructorCourses;

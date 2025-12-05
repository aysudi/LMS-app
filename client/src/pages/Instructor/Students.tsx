import { useState, useEffect } from "react";
import { motion } from "framer-motion";
// @ts-ignore
import { useTranslation } from "react-i18next";
import {
  FaUsers,
  FaSearch,
  FaDownload,
  FaChartLine,
  FaClock,
  FaGraduationCap,
} from "react-icons/fa";
import {
  useInstructorCoursesWithStats,
  useCourseStudents,
} from "../../hooks/useInstructor";
import { exportStudentsData } from "../../services/instructor.service";
import { useSnackbar } from "notistack";
import Loading from "../../components/Common/Loading";
import StudentRow from "../../components/Instructor/Students/StudentRow";

const InstructorStudents = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [progressFilter, setProgressFilter] = useState("all");
  const [sortBy, setSortBy] = useState<
    "name" | "progress" | "enrolled" | "lastActive"
  >("name");
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const { data: coursesData, isLoading: coursesLoading } =
    useInstructorCoursesWithStats({
      page: 1,
      limit: 100,
      status: "published",
    });

  const instructorCourses = coursesData?.data?.courses || [];
  const targetCourseId = selectedCourse === "all" ? undefined : selectedCourse;

  const {
    data: studentsData,
    isLoading: studentsLoading,
    error,
  } = useCourseStudents(
    targetCourseId || instructorCourses[0]?._id,
    {
      page,
      limit: 20,
    },
    {
      enabled: instructorCourses.length > 0,
    }
  );

  const allStudents = studentsData?.data?.students || [];
  const totalPages = studentsData?.data?.pagination?.totalPages || 1;

  // Filter students based on search term and progress
  const filteredStudents = allStudents.filter((student) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const fullName =
        `${student.student.firstName} ${student.student.lastName}`.toLowerCase();
      const email = student.student.email.toLowerCase();

      if (!fullName.includes(searchLower) && !email.includes(searchLower)) {
        return false;
      }
    }

    // Progress filter
    if (progressFilter !== "all") {
      const progress = student.progress?.progressPercentage || 0;

      switch (progressFilter) {
        case "not-started":
          return progress === 0;
        case "in-progress":
          return progress > 0 && progress < 100;
        case "completed":
          return progress === 100;
        default:
          return true;
      }
    }

    return true;
  });

  // Sort students based on sort option
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (sortBy) {
      case "name":
        const nameA =
          `${a.student.firstName} ${a.student.lastName}`.toLowerCase();
        const nameB =
          `${b.student.firstName} ${b.student.lastName}`.toLowerCase();
        return nameA.localeCompare(nameB);

      case "progress":
        const progressA = a.progress?.progressPercentage || 0;
        const progressB = b.progress?.progressPercentage || 0;
        return progressB - progressA; // Higher progress first

      case "enrolled":
        const enrolledA = new Date(a.enrollment?.enrolledAt || 0).getTime();
        const enrolledB = new Date(b.enrollment?.enrolledAt || 0).getTime();
        return enrolledB - enrolledA; // Most recent first

      case "lastActive":
        const lastActiveA = new Date(
          a.enrollment?.lastAccessedAt || 0
        ).getTime();
        const lastActiveB = new Date(
          b.enrollment?.lastAccessedAt || 0
        ).getTime();
        return lastActiveB - lastActiveA; // Most recent first

      default:
        return 0;
    }
  });

  const students = sortedStudents;

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

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCourse, progressFilter, sortBy]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCourse("all");
    setProgressFilter("all");
    setSortBy("name");
  };

  const hasActiveFilters =
    searchTerm ||
    selectedCourse !== "all" ||
    progressFilter !== "all" ||
    sortBy !== "name";

  const isLoading = coursesLoading || studentsLoading;

  const handleExportData = async () => {
    const courseId =
      selectedCourse === "all" ? instructorCourses[0]?._id : selectedCourse;

    if (!courseId) {
      enqueueSnackbar("Please select a course to export data", {
        variant: "warning",
      });
      return;
    }

    setIsExporting(true);
    try {
      const blob = await exportStudentsData(courseId, "csv");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `students-data-${courseId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      enqueueSnackbar("Students data exported successfully!", {
        variant: "success",
      });
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to export students data",
        {
          variant: "error",
        }
      );
    } finally {
      setIsExporting(false);
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
            {t("instructor.students.errorLoadingStudents")}
          </h2>
          <p className="text-gray-600 mt-2">
            {t("instructor.students.pleaseReTryLater")}
          </p>
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
            <h1 className="text-3xl font-bold text-gray-900">
              {t("navigation.students")}
            </h1>
            <p className="text-gray-600 mt-2">
              {t("instructor.manageTrackStudentsProgress")}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportData}
            disabled={isExporting || instructorCourses.length === 0}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <FaDownload className="text-sm" />
            )}
            <span>
              {isExporting
                ? "Exporting..."
                : t("instructor.students.exportData")}
            </span>
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
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
                <p className="text-2xl font-bold text-gray-900">
                  {activeToday}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t("instructor.students.searchStudents")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">
                  {t("instructor.students.allCourses")}
                </option>
                {instructorCourses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>

              <select
                value={progressFilter}
                onChange={(e) => setProgressFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">
                  {t("instructor.students.allProgress")}
                </option>
                <option value="not-started">
                  {t("instructor.students.notStarted")}
                </option>
                <option value="in-progress">
                  {t("instructor.students.inProgress")}
                </option>
                <option value="completed">
                  {t("instructor.students.completed")}
                </option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="name">
                  {t("instructor.students.sortByName")}
                </option>
                <option value="progress">
                  {t("instructor.students.sortByProgress")}
                </option>
                <option value="enrolled">
                  {t("instructor.students.sortByEnrollmentDate")}
                </option>
                <option value="lastActive">
                  {t("instructor.students.sortByLastActive")}
                </option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Students Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          {students.length === 0 ? (
            <div className="text-center py-16">
              <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t("instructor.students.noStudentsFound")}
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? t("instructor.students.tryAdjustingSearch")
                  : t("instructor.students.studentsWillAppear")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("instructor.students.student")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("instructor.students.course")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("instructor.students.progress")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("instructor.students.enrolled")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("instructor.students.lastActive")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student: any) => (
                    <StudentRow key={student.student._id} student={student} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center mt-8"
          >
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("common.previous")}
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
                {t("common.next")}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InstructorStudents;

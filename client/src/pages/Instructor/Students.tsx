import { useState, useEffect } from "react";
import { motion } from "framer-motion";
// @ts-ignore
import { useTranslation } from "react-i18next";
import { FaUsers, FaSearch } from "react-icons/fa";
import {
  useInstructorCoursesWithStats,
  useCourseStudents,
} from "../../hooks/useInstructor";
import Loading from "../../components/Common/Loading";
import StudentRow from "../../components/Instructor/Students/StudentRow";
import Header from "../../components/Instructor/Students/Header";
import Pagination from "../../components/Instructor/Students/Pagination";
import StatsCards from "../../components/Instructor/Students/StatsCards";

const InstructorStudents = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [progressFilter, setProgressFilter] = useState("all");
  const [sortBy, setSortBy] = useState<
    "name" | "progress" | "enrolled" | "lastActive"
  >("name");
  const [page, setPage] = useState(1);

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

  const filteredStudents = allStudents.filter((student) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const fullName =
        `${student.student.firstName} ${student.student.lastName}`.toLowerCase();
      const email = student.student.email.toLowerCase();

      if (!fullName.includes(searchLower) && !email.includes(searchLower)) {
        return false;
      }
    }

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
        <Header
          selectedCourse={selectedCourse}
          instructorCourses={instructorCourses}
        />

        {/* Stats Cards */}
        <StatsCards
          instructorCourses={instructorCourses}
          allStudents={students}
        />

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
          <Pagination page={page} setPage={setPage} totalPages={totalPages} />
        )}
      </div>
    </div>
  );
};

export default InstructorStudents;

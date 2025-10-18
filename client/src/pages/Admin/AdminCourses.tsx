import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaCheck,
  FaTimes,
  FaUsers,
  FaStar,
  FaBookOpen,
  FaClock,
  FaDollarSign,
  FaFilter,
  FaSearch,
  FaSpinner,
  FaGraduationCap,
  FaCalendar,
  FaPlay,
  FaFileAlt,
} from "react-icons/fa";
import {
  useAdminCourses,
  useApproveCourse,
  useRejectCourse,
} from "../../hooks/useAdminCourses";
import { HTMLRenderer } from "../../utils/htmlRenderer";

const AdminCourses: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { data: coursesData, isLoading, error } = useAdminCourses();
  const approveMutation = useApproveCourse();
  const rejectMutation = useRejectCourse();

  const courses = coursesData?.courses || [];

  // Filter courses based on status and search term
  const filteredCourses = courses.filter((course: any) => {
    const matchesFilter = filter === "all" || course.status === filter;
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCourses = filteredCourses.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <FaCheck className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <FaTimes className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <FaClock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  const handleQuickApprove = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    approveMutation.mutate({ courseId, feedback: "" });
  };

  const handleQuickReject = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const reason = prompt("Please provide a rejection reason:");
    if (reason) {
      rejectMutation.mutate({
        courseId,
        rejectionReason: reason,
        adminFeedback: "",
      });
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Courses...
          </h2>
          <p className="text-gray-600">Fetching course moderation data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg border border-red-200">
          <FaTimes className="text-red-600 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-900 mb-2">
            Error Loading Courses
          </h2>
          <p className="text-red-700 mb-4">
            There was a problem loading the courses data.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = {
    total: courses.length,
    pending: courses.filter((c: any) => c.status === "pending").length,
    approved: courses.filter((c: any) => c.status === "approved").length,
    rejected: courses.filter((c: any) => c.status === "rejected").length,
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg border border-white/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 tracking-tight">
              Course Moderation
            </h1>
            <p className="text-blue-100 font-medium">
              Review and manage course submissions from instructors
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="bg-white/20 rounded-full px-3 py-1 flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">System Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-xs font-semibold mb-1 uppercase tracking-wide">
                Total Courses
              </p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white">
              <FaBookOpen />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-xs font-semibold mb-1 uppercase tracking-wide">
                Pending Review
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.pending}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white">
              <FaClock />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-xs font-semibold mb-1 uppercase tracking-wide">
                Approved
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.approved}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white">
              <FaCheck />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-xs font-semibold mb-1 uppercase tracking-wide">
                Rejected
              </p>
              <p className="text-2xl font-bold text-red-600">
                {stats.rejected}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white">
              <FaTimes />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses or instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <FaFilter className="text-slate-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-white border border-slate-300 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            >
              <option value="all">All Courses</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {paginatedCourses.map((course: any) => (
          <div
            key={course.id}
            onClick={() => navigate(`/admin/courses/${course.id}/review`)}
            className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
          >
            {/* Course Image */}
            <div className="relative h-48 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 overflow-hidden">
              {course.image?.url ? (
                <img
                  src={course.image.url}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaPlay className="text-white text-4xl opacity-80" />
                </div>
              )}
              <div className="absolute top-4 right-4">
                {getStatusBadge(course.status)}
              </div>
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
                <span className="text-white text-xs font-medium">
                  {course.category}
                </span>
              </div>
            </div>

            {/* Course Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
              </div>

              <div className="text-slate-600 text-sm mb-4 line-clamp-2">
                <HTMLRenderer content={course.description} maxLength={120} />
              </div>

              {/* Instructor Info */}
              <div className="flex items-center space-x-3 mb-4 p-3 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <FaGraduationCap className="text-white text-sm" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {course.instructor.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {course.instructor.email}
                  </p>
                </div>
              </div>

              {/* Course Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-center mb-1">
                    <FaUsers className="text-blue-600 text-xs mr-1" />
                    <span className="text-blue-600 text-xs font-medium">
                      {course.studentsCount}
                    </span>
                  </div>
                  <p className="text-blue-800 text-xs font-semibold">
                    Students
                  </p>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-center mb-1">
                    <FaStar className="text-green-600 text-xs mr-1" />
                    <span className="text-green-600 text-xs font-medium">
                      {course.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-green-800 text-xs font-semibold">Rating</p>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-center mb-1">
                    <FaDollarSign className="text-purple-600 text-xs mr-1" />
                    <span className="text-purple-600 text-xs font-medium">
                      ${course.originalPrice}
                    </span>
                  </div>
                  <p className="text-purple-800 text-xs font-semibold">Price</p>
                </div>
              </div>

              {/* Meta Information */}
              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <div className="flex items-center space-x-1">
                  <FaBookOpen />
                  <span>{course.totalLessons} lessons</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FaClock />
                  <span>{formatDuration(course.totalDuration)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FaCalendar />
                  <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    // navigate(`/admin/courses/${course.id}/review`);
                    window.location.href = `/admin/courses/${course.id}/review`;
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <FaEye />
                  <span>Review</span>
                </button>

                {course.status === "pending" && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleQuickApprove(course.id, e)}
                      disabled={approveMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg text-xs transition-colors disabled:opacity-50"
                      title="Quick Approve"
                    >
                      {approveMutation.isPending ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaCheck />
                      )}
                    </button>
                    <button
                      onClick={(e) => handleQuickReject(course.id, e)}
                      disabled={rejectMutation.isPending}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg text-xs transition-colors disabled:opacity-50"
                      title="Quick Reject"
                    >
                      {rejectMutation.isPending ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaTimes />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 max-w-md mx-auto">
            <FaFileAlt className="text-slate-400 text-4xl mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Courses Found
            </h3>
            <p className="text-slate-600">
              {searchTerm || filter !== "all"
                ? "No courses match your current filters."
                : "No courses have been submitted yet."}
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + itemsPerPage, filteredCourses.length)} of{" "}
              {filteredCourses.length} courses
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;

import React, { useState } from "react";
import { FaCheck, FaTimes, FaEye, FaUser, FaPlay } from "react-icons/fa";

interface CourseForReview {
  id: string;
  title: string;
  description: string;
  instructor: {
    firstName: string;
    lastName: string;
    email: string;
  };
  category: string;
  level: string;
  duration: number;
  price: number;
  thumbnail: string;
  status: "pending" | "approved" | "rejected" | "published";
  submittedDate: string;
  totalLessons: number;
  sectionsCount: number;
}

const AdminCourses: React.FC = () => {
  const [courses] = useState<CourseForReview[]>([
    {
      id: "1",
      title: "Advanced React Development with TypeScript",
      description:
        "Master modern React development with TypeScript, hooks, and advanced patterns",
      instructor: {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@example.com",
      },
      category: "Programming",
      level: "Advanced",
      duration: 1200, // minutes
      price: 149.99,
      thumbnail: "/api/placeholder/400/225",
      status: "pending",
      submittedDate: "2024-01-15",
      totalLessons: 45,
      sectionsCount: 8,
    },
    {
      id: "2",
      title: "Machine Learning Fundamentals",
      description:
        "Learn the basics of machine learning with Python and scikit-learn",
      instructor: {
        firstName: "Michael",
        lastName: "Chen",
        email: "michael.chen@example.com",
      },
      category: "Data Science",
      level: "Beginner",
      duration: 900,
      price: 99.99,
      thumbnail: "/api/placeholder/400/225",
      status: "approved",
      submittedDate: "2024-01-12",
      totalLessons: 32,
      sectionsCount: 6,
    },
  ]);

  const [selectedCourse, setSelectedCourse] = useState<CourseForReview | null>(
    null
  );
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredCourses = courses.filter(
    (course) => filterStatus === "all" || course.status === filterStatus
  );

  const handleApproveCourse = (id: string) => {
    console.log("Approve course:", id);
    // TODO: Implement API call
  };

  const handleRejectCourse = (id: string) => {
    console.log("Reject course:", id);
    // TODO: Implement API call
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rejected
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending Review
          </span>
        );
      case "published":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Published
          </span>
        );
      default:
        return null;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Course Moderation
            </h1>
            <p className="text-slate-600">
              Review and approve courses submitted by instructors
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200/50">
            <div className="text-2xl font-bold text-blue-700">
              {courses.length}
            </div>
            <div className="text-blue-600 text-sm font-medium">
              Total Courses
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200/50">
            <div className="text-2xl font-bold text-yellow-700">
              {courses.filter((c) => c.status === "pending").length}
            </div>
            <div className="text-yellow-600 text-sm font-medium">
              Pending Review
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200/50">
            <div className="text-2xl font-bold text-green-700">
              {courses.filter((c) => c.status === "approved").length}
            </div>
            <div className="text-green-600 text-sm font-medium">Approved</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200/50">
            <div className="text-2xl font-bold text-purple-700">
              {courses.filter((c) => c.status === "published").length}
            </div>
            <div className="text-purple-600 text-sm font-medium">Published</div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="all">All Courses</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden hover:shadow-xl transition-shadow"
          >
            {/* Thumbnail */}
            <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
              <div className="absolute inset-0 flex items-center justify-center">
                <FaPlay className="text-white text-4xl opacity-80" />
              </div>
              <div className="absolute top-4 right-4">
                {getStatusBadge(course.status)}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                {course.title}
              </h3>

              <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                {course.description}
              </p>

              {/* Instructor */}
              <div className="flex items-center space-x-2 mb-3">
                <FaUser className="text-slate-400 text-sm" />
                <span className="text-sm text-slate-600">
                  {course.instructor.firstName} {course.instructor.lastName}
                </span>
              </div>

              {/* Course Details */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Category:</span>
                  <span className="text-slate-700 font-medium">
                    {course.category}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Level:</span>
                  <span className="text-slate-700 font-medium">
                    {course.level}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Duration:</span>
                  <span className="text-slate-700 font-medium">
                    {formatDuration(course.duration)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Lessons:</span>
                  <span className="text-slate-700 font-medium">
                    {course.totalLessons}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Price:</span>
                  <span className="text-green-600 font-bold">
                    ${course.price}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedCourse(course)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                >
                  <FaEye className="mr-1" />
                  Review
                </button>

                {course.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleApproveCourse(course.id)}
                      className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                      title="Approve"
                    >
                      <FaCheck />
                    </button>
                    <button
                      onClick={() => handleRejectCourse(course.id)}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                      title="Reject"
                    >
                      <FaTimes />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Course Details Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">
                  Course Review
                </h2>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-96">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Course Thumbnail */}
                <div className="lg:col-span-1">
                  <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FaPlay className="text-white text-4xl opacity-80" />
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <span className="text-sm font-medium text-slate-600">
                        Status:
                      </span>
                      <div className="mt-1">
                        {getStatusBadge(selectedCourse.status)}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-600">
                        Submitted:
                      </span>
                      <p className="text-slate-900">
                        {new Date(
                          selectedCourse.submittedDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Course Details */}
                <div className="lg:col-span-2">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">
                    {selectedCourse.title}
                  </h3>

                  <p className="text-slate-700 mb-6">
                    {selectedCourse.description}
                  </p>

                  {/* Instructor Info */}
                  <div className="bg-slate-50 rounded-xl p-4 mb-6">
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                      <FaUser className="mr-2 text-blue-600" />
                      Instructor Information
                    </h4>
                    <div className="space-y-1">
                      <p className="text-slate-700">
                        <strong>Name:</strong>{" "}
                        {selectedCourse.instructor.firstName}{" "}
                        {selectedCourse.instructor.lastName}
                      </p>
                      <p className="text-slate-700">
                        <strong>Email:</strong>{" "}
                        {selectedCourse.instructor.email}
                      </p>
                    </div>
                  </div>

                  {/* Course Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-xl">
                      <div className="text-sm text-blue-600 font-medium">
                        Category
                      </div>
                      <div className="text-lg font-bold text-blue-700">
                        {selectedCourse.category}
                      </div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-xl">
                      <div className="text-sm text-purple-600 font-medium">
                        Level
                      </div>
                      <div className="text-lg font-bold text-purple-700">
                        {selectedCourse.level}
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-xl">
                      <div className="text-sm text-green-600 font-medium">
                        Duration
                      </div>
                      <div className="text-lg font-bold text-green-700">
                        {formatDuration(selectedCourse.duration)}
                      </div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-xl">
                      <div className="text-sm text-orange-600 font-medium">
                        Price
                      </div>
                      <div className="text-lg font-bold text-orange-700">
                        ${selectedCourse.price}
                      </div>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded-xl">
                      <div className="text-sm text-indigo-600 font-medium">
                        Lessons
                      </div>
                      <div className="text-lg font-bold text-indigo-700">
                        {selectedCourse.totalLessons}
                      </div>
                    </div>
                    <div className="bg-pink-50 p-3 rounded-xl">
                      <div className="text-sm text-pink-600 font-medium">
                        Sections
                      </div>
                      <div className="text-lg font-bold text-pink-700">
                        {selectedCourse.sectionsCount}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            {selectedCourse.status === "pending" && (
              <div className="p-6 border-t border-slate-200 bg-slate-50">
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      handleApproveCourse(selectedCourse.id);
                      setSelectedCourse(null);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center"
                  >
                    <FaCheck className="mr-2" />
                    Approve Course
                  </button>
                  <button
                    onClick={() => {
                      handleRejectCourse(selectedCourse.id);
                      setSelectedCourse(null);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center"
                  >
                    <FaTimes className="mr-2" />
                    Reject Course
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;

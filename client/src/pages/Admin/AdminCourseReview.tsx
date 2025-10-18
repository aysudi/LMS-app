import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaUser,
  FaPlay,
  FaClock,
  FaDollarSign,
  FaGraduationCap,
  FaBookOpen,
  FaStar,
  FaUsers,
  FaCalendar,
  FaSpinner,
  FaFileAlt,
  FaVideo,
  FaDownload,
  FaEye,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import {
  useAdminCourseDetails,
  useApproveCourse,
  useRejectCourse,
} from "../../hooks/useAdminCourses";
import { HTMLRenderer } from "../../utils/htmlRenderer";

const AdminCourseReview: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "overview" | "curriculum" | "instructor"
  >("overview");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminFeedback, setAdminFeedback] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data: course, isLoading, error } = useAdminCourseDetails(courseId!);
  const approveMutation = useApproveCourse();
  const rejectMutation = useRejectCourse();

  const handleApproveCourse = () => {
    if (courseId) {
      approveMutation.mutate(
        { courseId, feedback: adminFeedback },
        {
          onSuccess: () => {
            navigate("/admin/courses");
          },
        }
      );
    }
  };

  const handleRejectCourse = () => {
    setShowRejectModal(true);
  };

  const confirmRejectCourse = () => {
    if (courseId && rejectionReason) {
      rejectMutation.mutate(
        {
          courseId,
          rejectionReason,
          adminFeedback,
        },
        {
          onSuccess: () => {
            navigate("/admin/courses");
          },
        }
      );
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-green-100 text-green-800 border border-green-200">
            <FaCheck className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-red-100 text-red-800 border border-red-200">
            <FaTimes className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <FaClock className="w-3 h-3 mr-1" />
            Pending Review
          </span>
        );
      default:
        return null;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return <FaVideo className="text-blue-600" />;
      case "text":
        return <FaFileAlt className="text-green-600" />;
      case "quiz":
        return <FaBookOpen className="text-purple-600" />;
      case "assignment":
        return <FaDownload className="text-orange-600" />;
      default:
        return <FaPlay className="text-slate-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading course details...
          </h2>
          <p className="text-gray-600">
            Please wait while we fetch the course information
          </p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="text-center">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-200 max-w-md mx-auto">
            <FaTimes className="text-red-600 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-900 mb-2">
              Course Not Found
            </h3>
            <p className="text-red-700 mb-4">
              The course you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate("/admin/courses")}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate("/admin/courses")}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 font-medium transition-colors bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg"
            >
              <FaArrowLeft />
              <span>Back to Courses</span>
            </button>

            <div className="flex items-center space-x-4">
              {getStatusBadge(course.status)}
              {course.submittedAt && (
                <div className="flex items-center space-x-2 text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                  <FaCalendar />
                  <span className="text-sm font-medium">
                    Submitted{" "}
                    {new Date(course.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Course Image */}
            <div className="lg:col-span-1">
              <div className="relative h-48 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-xl overflow-hidden shadow-lg">
                {course.image?.url ? (
                  <img
                    src={course.image.url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaPlay className="text-white text-4xl opacity-80" />
                  </div>
                )}
              </div>
            </div>

            {/* Course Info */}
            <div className="lg:col-span-2">
              <h1 className="text-2xl font-bold text-slate-900 mb-4">
                {course.title}
              </h1>
              <div className="text-slate-700 mb-6 leading-relaxed">
                <HTMLRenderer content={course.description} />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <FaGraduationCap className="text-blue-600 text-sm" />
                    <span className="text-blue-600 text-xs font-medium">
                      Category
                    </span>
                  </div>
                  <p className="font-bold text-blue-800 text-sm">
                    {course.category}
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <FaStar className="text-purple-600 text-sm" />
                    <span className="text-purple-600 text-xs font-medium">
                      Level
                    </span>
                  </div>
                  <p className="font-bold text-purple-800 text-sm">
                    {course.level}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <FaClock className="text-green-600 text-sm" />
                    <span className="text-green-600 text-xs font-medium">
                      Duration
                    </span>
                  </div>
                  <p className="font-bold text-green-800 text-sm">
                    {formatDuration(course.totalDuration)}
                  </p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <FaDollarSign className="text-orange-600 text-sm" />
                    <span className="text-orange-600 text-xs font-medium">
                      Price
                    </span>
                  </div>
                  <p className="font-bold text-orange-800 text-sm">
                    ${course.originalPrice}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto mt-6 space-y-5">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
          <div className="flex border-b border-slate-200">
            {[
              { id: "overview", label: "Overview", icon: FaEye },
              { id: "curriculum", label: "Curriculum", icon: FaBookOpen },
              { id: "instructor", label: "Instructor", icon: FaUser },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-semibold transition-all duration-300 text-[0.95rem] ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
                }`}
              >
                <tab.icon />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* What You'll Learn */}
                {course.whatYouWillLearn &&
                  course.whatYouWillLearn.length > 0 && (
                    <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                      <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center">
                        <FaCheck className="mr-2 text-green-600" />
                        What You'll Learn
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {course.whatYouWillLearn.map(
                          (item: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-start space-x-2"
                            >
                              <FaCheck className="text-green-600 mt-1 flex-shrink-0 text-sm" />
                              <span className="text-green-800 text-sm">
                                {item}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Requirements */}
                {course.requirements && course.requirements.length > 0 && (
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                    <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
                      <FaBookOpen className="mr-2 text-blue-600" />
                      Requirements
                    </h3>
                    <ul className="space-y-2">
                      {course.requirements.map(
                        (requirement: string, index: number) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2"
                          >
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-blue-800 text-sm">
                              {requirement}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {/* Target Audience */}
                {course.targetAudience && course.targetAudience.length > 0 && (
                  <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
                    <h3 className="text-lg font-bold text-purple-800 mb-3 flex items-center">
                      <FaUsers className="mr-2 text-purple-600" />
                      Target Audience
                    </h3>
                    <ul className="space-y-2">
                      {course.targetAudience.map(
                        (audience: string, index: number) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2"
                          >
                            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-purple-800 text-sm">
                              {audience}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {/* Course Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center space-x-3 mb-2">
                      <FaBookOpen className="text-blue-600" />
                      <h4 className="font-semibold text-slate-900">
                        Total Lessons
                      </h4>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {course.totalLessons}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center space-x-3 mb-2">
                      <FaUsers className="text-green-600" />
                      <h4 className="font-semibold text-slate-900">Students</h4>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {course.studentsCount}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center space-x-3 mb-2">
                      <FaStar className="text-yellow-600" />
                      <h4 className="font-semibold text-slate-900">Rating</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold text-yellow-600">
                        {course.rating.toFixed(1)}
                      </p>
                      <span className="text-slate-500 text-sm">
                        ({course.ratingsCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Curriculum Tab */}
            {activeTab === "curriculum" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">
                    Course Curriculum
                  </h3>
                  <div className="flex items-center space-x-4 text-slate-600 text-sm">
                    <span className="flex items-center space-x-1">
                      <FaBookOpen />
                      <span>{course.sections.length} sections</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <FaPlay />
                      <span>{course.totalLessons} lessons</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <FaClock />
                      <span>{formatDuration(course.totalDuration)}</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {course.sections.map((section: any) => (
                    <div
                      key={section.id}
                      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                    >
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-1">
                            {section.title}
                          </h4>
                          {section.description && (
                            <div className="text-slate-600 text-sm mb-2">
                              <HTMLRenderer content={section.description} />
                            </div>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-slate-500">
                            <span>{section.lessons.length} lessons</span>
                            <span>
                              {formatDuration(
                                section.lessons.reduce(
                                  (total: number, lesson: any) =>
                                    total + lesson.duration,
                                  0
                                )
                              )}
                            </span>
                          </div>
                        </div>
                        {expandedSections.has(section.id) ? (
                          <FaChevronUp className="text-slate-400" />
                        ) : (
                          <FaChevronDown className="text-slate-400" />
                        )}
                      </button>

                      {expandedSections.has(section.id) && (
                        <div className="border-t border-slate-200 bg-slate-50">
                          {section.lessons.map((lesson: any) => (
                            <div
                              key={lesson.id}
                              className="p-4 border-b border-slate-200 last:border-b-0 flex items-center space-x-4"
                            >
                              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                                {getLessonIcon(lesson.type)}
                              </div>
                              <div className="flex-1">
                                <h5 className="font-medium text-slate-900">
                                  {lesson.title}
                                </h5>
                                {lesson.description && (
                                  <div className="text-sm text-slate-600 mt-1">
                                    <HTMLRenderer
                                      content={lesson.description}
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-3 text-sm text-slate-500">
                                {lesson.isPreview && (
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                    Preview
                                  </span>
                                )}
                                <span className="flex items-center space-x-1">
                                  <FaClock />
                                  <span>{formatDuration(lesson.duration)}</span>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructor Tab */}
            {activeTab === "instructor" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-start space-x-6">
                    <div className="w-15 h-15 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      {course.instructor.avatar ? (
                        <img
                          src={course.instructor.avatar}
                          alt={course.instructor.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <FaUser className="text-white text-xl" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900">
                        {course.instructor.name}
                      </h3>
                      <p className="text-slate-600 mb-1">
                        {course.instructor.email}
                      </p>
                      {course.instructor.bio && (
                        <div className="text-slate-700 leading-relaxed">
                          <HTMLRenderer content={course.instructor.bio} />
                        </div>
                      )}
                    </div>
                  </div>

                  {course.instructor.experience && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">
                        Experience
                      </h4>
                      <div className="text-blue-700">
                        <HTMLRenderer content={course.instructor.experience} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {course.status === "pending" && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Admin Feedback (Optional)
              </label>
              <textarea
                value={adminFeedback}
                onChange={(e) => setAdminFeedback(e.target.value)}
                placeholder="Add feedback for the instructor about this course..."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-300"
                rows={3}
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleApproveCourse}
                disabled={approveMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                {approveMutation.isPending ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaCheck className="mr-2" />
                )}
                Approve Course
              </button>
              <button
                onClick={handleRejectCourse}
                disabled={rejectMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                {rejectMutation.isPending ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaTimes className="mr-2" />
                )}
                Reject Course
              </button>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-900">
                  Reject Course
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a clear reason for rejection..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none transition-all duration-300"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Additional Feedback (Optional)
                  </label>
                  <textarea
                    value={adminFeedback}
                    onChange={(e) => setAdminFeedback(e.target.value)}
                    placeholder="Additional feedback for the instructor..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none transition-all duration-300"
                    rows={2}
                  />
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 bg-slate-50">
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectionReason("");
                      setAdminFeedback("");
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-xl font-medium transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRejectCourse}
                    disabled={
                      !rejectionReason.trim() || rejectMutation.isPending
                    }
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 flex items-center justify-center shadow-lg"
                  >
                    {rejectMutation.isPending ? (
                      <FaSpinner className="animate-spin mr-2" />
                    ) : null}
                    Reject Course
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCourseReview;

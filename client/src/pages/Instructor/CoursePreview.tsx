import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaEdit,
  FaPlay,
  FaClock,
  FaBook,
  FaUsers,
  FaStar,
  FaCheck,
  FaGlobe,
  FaDownload,
  FaCertificate,
  FaChevronDown,
  FaChevronUp,
  FaPlayCircle,
  FaLock,
} from "react-icons/fa";
import { useCourse } from "../../hooks/useCourseQueries";
import Loading from "../../components/Common/Loading";

const InstructorCoursePreview = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "curriculum" | "reviews">("overview");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const { data: courseData, isLoading, error } = useCourse(courseId!);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error || !courseData?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Course not found
          </h2>
          <p className="text-gray-600 mb-4">
            The course you're looking for doesn't exist or you don't have access to it.
          </p>
          <button
            onClick={() => navigate("/instructor/courses")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const course = courseData.data;

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/instructor/courses")}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaArrowLeft />
              </button>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
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
                <p className="text-sm text-gray-600">Preview how students will see your course</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/instructor/courses/${courseId}/edit`)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <FaEdit className="text-sm" />
              <span>Edit Course</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Video/Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6"
            >
              <div className="aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 relative">
                {course.videoPromo?.url ? (
                  <video
                    controls
                    className="w-full h-full object-cover"
                    poster={course.image?.url}
                  >
                    <source src={course.videoPromo.url} type="video/mp4" />
                  </video>
                ) : course.image?.url ? (
                  <img
                    src={course.image.url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaPlay className="text-6xl text-white opacity-50" />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: "overview", label: "Overview", count: null },
                    { id: "curriculum", label: "Curriculum", count: course.sections?.length || 0 },
                    { id: "reviews", label: "Reviews", count: course.reviews?.length || 0 },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab.label}
                      {tab.count !== null && (
                        <span className="ml-2 text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-1">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Description */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">About this course</h3>
                      <div 
                        className="prose max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: course.description }}
                      />
                    </div>

                    {/* Learning Objectives */}
                    {course.learningObjectives && course.learningObjectives.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          What you'll learn
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {course.learningObjectives.map((objective: string, index: number) => (
                            <div key={index} className="flex items-start space-x-3">
                              <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                              <span className="text-gray-700">{objective}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Requirements */}
                    {course.requirements && course.requirements.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                        <ul className="space-y-2">
                          {course.requirements.map((requirement: string, index: number) => (
                            <li key={index} className="flex items-start space-x-3">
                              <span className="text-gray-400 mt-2 text-sm">•</span>
                              <span className="text-gray-700">{requirement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Target Audience */}
                    {course.targetAudience && course.targetAudience.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Who this course is for
                        </h3>
                        <ul className="space-y-2">
                          {course.targetAudience.map((audience: string, index: number) => (
                            <li key={index} className="flex items-start space-x-3">
                              <span className="text-gray-400 mt-2 text-sm">•</span>
                              <span className="text-gray-700">{audience}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "curriculum" && (
                  <div className="space-y-4">
                    {course.sections && course.sections.length > 0 ? (
                      course.sections.map((section: any, sectionIndex: number) => (
                        <div
                          key={section._id}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          <button
                            onClick={() => toggleSection(section._id)}
                            className="w-full px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-medium text-gray-900">
                                Section {sectionIndex + 1}: {section.title}
                              </span>
                              <span className="text-xs text-gray-500">
                                {section.lessons?.length || 0} lessons
                              </span>
                            </div>
                            {expandedSections.has(section._id) ? (
                              <FaChevronUp className="text-gray-400" />
                            ) : (
                              <FaChevronDown className="text-gray-400" />
                            )}
                          </button>
                          {expandedSections.has(section._id) && (
                            <div className="divide-y divide-gray-100">
                              {section.lessons?.map((lesson: any, lessonIndex: number) => (
                                <div key={lesson._id} className="px-4 py-3 flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                      {lesson.isPreview ? (
                                        <FaPlayCircle className="text-indigo-600 text-sm" />
                                      ) : (
                                        <FaLock className="text-gray-400 text-sm" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {lessonIndex + 1}. {lesson.title}
                                      </p>
                                      {lesson.isPreview && (
                                        <p className="text-xs text-indigo-600">Preview available</p>
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {formatDuration(lesson.duration || 0)}
                                  </span>
                                </div>
                              )) || (
                                <div className="px-4 py-8 text-center text-gray-500">
                                  No lessons in this section yet
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FaBook className="text-4xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No curriculum sections added yet</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div>
                    {course.reviews && course.reviews.length > 0 ? (
                      <div className="space-y-4">
                        {course.reviews.map((review: any) => (
                          <div key={review._id} className="border-b border-gray-100 pb-4">
                            <div className="flex items-start space-x-3">
                              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-indigo-600">
                                  {review.user?.firstName?.charAt(0) || "?"}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-gray-900">
                                    {review.user?.firstName} {review.user?.lastName}
                                  </span>
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <FaStar
                                        key={i}
                                        className={`text-sm ${
                                          i < review.rating ? "text-yellow-400" : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    {new Date(review.date).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-gray-700">{review.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FaStar className="text-4xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No reviews yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
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
                {course.discountPrice && course.discountPrice > 0 && course.discountPrice < course.originalPrice && (
                  <div className="text-lg text-gray-500 line-through">
                    ${course.originalPrice}
                  </div>
                )}
              </div>

              {/* Course Stats */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center space-x-2">
                    <FaClock />
                    <span>Duration</span>
                  </span>
                  <span className="font-medium">{formatDuration(course.totalDuration || 0)}</span>
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
                  <span className="font-medium">{course.studentsEnrolled?.length || 0}</span>
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
                <h4 className="font-semibold text-gray-900 mb-3">This course includes:</h4>
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
        </div>
      </div>
    </div>
  );
};

export default InstructorCoursePreview;

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaEdit, FaPlay } from "react-icons/fa";
import { useCourse } from "../../hooks/useCourseHooks";
import Loading from "../../components/Common/Loading";
import Sidebar from "../../components/Instructor/Courses/CoursePreview/Sidebar";
import CurriculumTab from "../../components/Instructor/Courses/CoursePreview/CurriculumTab";
import ReviewsTab from "../../components/Instructor/Courses/CoursePreview/ReviewsTab";
import OverviewTab from "../../components/Instructor/Courses/CoursePreview/OverviewTab";

const InstructorCoursePreview = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "overview" | "curriculum" | "reviews"
  >("overview");

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
            The course you're looking for doesn't exist or you don't have access
            to it.
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
                  <h1 className="text-xl font-bold text-gray-900">
                    {course.title}
                  </h1>
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
                <p className="text-sm text-gray-600">
                  Preview how students will see your course
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/instructor/courses/${courseId}/edit`)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 cursor-pointer"
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
                    {
                      id: "curriculum",
                      label: "Curriculum",
                      count: course.sections?.length || 0,
                    },
                    {
                      id: "reviews",
                      label: "Reviews",
                      count: course.reviews?.length || 0,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
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
                {activeTab === "overview" && <OverviewTab course={course} />}

                {activeTab === "curriculum" && (
                  <CurriculumTab course={course} />
                )}

                {activeTab === "reviews" && <ReviewsTab course={course} />}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <Sidebar course={course} />
        </div>
      </div>
    </div>
  );
};

export default InstructorCoursePreview;

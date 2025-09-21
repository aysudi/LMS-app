import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlay,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaClock,
  FaBook,
  FaUsers,
  FaGlobe,
  FaAward,
  FaChevronDown,
  FaChevronUp,
  FaPlayCircle,
  FaLock,
  FaDownload,
  FaHeart,
  FaRegHeart,
  FaShare,
  FaShoppingCart,
  FaEye,
  FaCalendarAlt,
  FaGraduationCap,
  FaCheckCircle,
  FaExclamationTriangle,
  FaQuestionCircle,
} from "react-icons/fa";
import { useCourse } from "../../hooks/useCourseQueries";
import type { Course, Lesson } from "../../types/course.type";

const CourseDetails = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "curriculum" | "reviews"
  >("overview");
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const {
    data: courseResponse,
    isLoading,
    error,
  } = useCourse(courseId || "", {
    enabled: !!courseId,
  });

  if (isLoading) {
    return <CourseDetailsLoader />;
  }

  if (error || !courseResponse?.data) {
    return <CourseNotFound error={error} />;
  }

  const course = courseResponse.data;

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i - 0.5 <= rating) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    return stars;
  };

  const calculateDiscountPercentage = () => {
    if (course.discountPrice && course.discountPrice < course.originalPrice) {
      return Math.round(
        ((course.originalPrice - course.discountPrice) / course.originalPrice) *
          100
      );
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-violet-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>

          <div className="container mx-auto px-4 py-16 relative">
            <div className="grid lg:grid-cols-6 gap-12 items-center">
              {/* Course Info */}
              <div className="lg:col-span-4 mr-3">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-8"
                >
                  {/* Breadcrumb */}
                  <nav className="flex items-center space-x-2 text-sm text-purple-200">
                    <span
                      onClick={() => navigate("/courses")}
                      className="hover:text-white cursor-pointer transition-colors font-medium"
                    >
                      Courses
                    </span>
                    <span className="text-purple-300">•</span>
                    <span className="hover:text-white cursor-pointer transition-colors font-medium">
                      {course.category}
                    </span>
                    {course.subcategory && (
                      <>
                        <span className="text-purple-300">•</span>
                        <span className="text-purple-100 font-medium">
                          {course.subcategory}
                        </span>
                      </>
                    )}
                  </nav>

                  {/* Level Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-400/30 rounded-full">
                    <FaGraduationCap className="text-violet-300" />
                    <span className="text-white font-semibold">
                      {course.level}
                    </span>
                  </div>

                  {/* Course Title */}
                  <div>
                    <h1 className="text-2xl lg:text-4xl font-bold text-white mb-6 leading-tight">
                      {course.title}
                    </h1>
                    <p className="text-xl text-purple-100 mb-8 leading-relaxed max-w-2xl">
                      {course.shortDescription || course.description}
                    </p>
                  </div>

                  {/* Course Meta */}
                  <div className="flex flex-wrap items-center gap-8">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {renderStars(course.rating)}
                      </div>
                      <span className="font-bold text-white text-lg">
                        {course.rating.toFixed(1)}
                      </span>
                      <span className="text-purple-200">
                        ({course.ratingsCount} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-purple-200">
                      <FaUsers className="text-violet-400" />
                      <span className="font-medium">
                        {course.studentsEnrolled.length.toLocaleString()}{" "}
                        students
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-purple-200">
                      <FaGlobe className="text-violet-400" />
                      <span className="font-medium">{course.language}</span>
                    </div>
                  </div>

                  {/* Instructor Info */}
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-14 h-13 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                          <span className="text-white font-bold text-xl">
                            {course.instructor.firstName[0]}
                            {course.instructor.lastName[0]}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg">
                          {course.instructor.firstName}{" "}
                          {course.instructor.lastName}
                        </p>
                        <p className="text-purple-200 font-medium">
                          Expert Instructor
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Course Preview Card */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="sticky top-8"
                >
                  <div className="bg-white/92 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                    {/* Course Image/Video */}
                    <div className="relative aspect-video bg-gradient-to-br from-violet-100 to-purple-100">
                      {course.image ? (
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaBook className="text-6xl text-violet-400" />
                        </div>
                      )}
                      {course.videoPromo && (
                        <button
                          onClick={() => setIsVideoModalOpen(true)}
                          className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/30 transition-all duration-300 group"
                        >
                          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                            <FaPlay className="text-3xl text-violet-600 ml-2" />
                          </div>
                        </button>
                      )}

                      {/* Preview Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full shadow-lg">
                          Free Preview
                        </span>
                      </div>
                    </div>

                    <div className="p-8">
                      {/* Price */}
                      <div className="mb-7">
                        {course.isFree ? (
                          <div className="text-3xl font-bold text-green-600">
                            Free
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <div className="text-3xl font-bold text-gray-900">
                              ${course.currentPrice || course.originalPrice}
                            </div>
                            {calculateDiscountPercentage() > 0 && (
                              <>
                                <div className="text-xl text-gray-500 line-through">
                                  ${course.originalPrice}
                                </div>
                                <div className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold shadow-lg">
                                  {calculateDiscountPercentage()}% OFF
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Course Stats */}
                      <div className="grid grid-cols-2 gap-6 mb-7">
                        <div className="text-center p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl">
                          <FaClock className="text-2xl text-violet-600 mx-auto mb-2" />
                          <div className="font-bold text-gray-900 text-lg">
                            {formatDuration(course.totalDuration)}
                          </div>
                          <div className="text-sm text-gray-600">Duration</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl">
                          <FaBook className="text-2xl text-violet-600 mx-auto mb-2" />
                          <div className="font-bold text-gray-900 text-lg">
                            {course.totalLessons}
                          </div>
                          <div className="text-sm text-gray-600">Lessons</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl">
                          <FaAward className="text-2xl text-violet-600 mx-auto mb-2" />
                          <div className="font-bold text-gray-900 text-lg">
                            {course.certificateProvided ? "Yes" : "No"}
                          </div>
                          <div className="text-sm text-gray-600">
                            Certificate
                          </div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl">
                          <FaCalendarAlt className="text-2xl text-violet-600 mx-auto mb-2" />
                          <div className="font-bold text-gray-900 text-lg">
                            2024
                          </div>
                          <div className="text-sm text-gray-600">Updated</div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-4">
                        <button className="w-full py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 hover:from-violet-700 hover:via-purple-700 hover:to-violet-800 text-white font-bold text-md rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] flex items-center justify-center gap-3 relative overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                          <FaShoppingCart className="text-lg relative z-10" />
                          <span className="relative z-10">Enroll Now</span>
                        </button>

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setIsWishlisted(!isWishlisted)}
                            className="py-3 px-4 border-2 border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-700 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group"
                          >
                            {isWishlisted ? (
                              <FaHeart className="text-red-500 group-hover:scale-110 transition-transform" />
                            ) : (
                              <FaRegHeart className="group-hover:scale-110 transition-transform" />
                            )}
                            Wishlist
                          </button>
                          <button className="py-3 px-4 border-2 border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-700 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group">
                            <FaShare className="group-hover:scale-110 transition-transform" />
                            Share
                          </button>
                        </div>

                        {/* 30-day guarantee */}
                        <div className="text-center py-4 px-6 bg-green-50 border border-green-200 rounded-xl">
                          <div className="flex items-center justify-center gap-2 text-green-700">
                            <FaCheckCircle />
                            <span className="font-semibold">
                              30-Day Money-Back Guarantee
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          {/* Course Content Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden"
          >
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 bg-white/50">
              <nav className="flex space-x-0 overflow-x-auto">
                {[
                  { id: "overview", label: "Overview", icon: FaEye },
                  { id: "curriculum", label: "Curriculum", icon: FaBook },
                  { id: "reviews", label: "Reviews", icon: FaStar },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`relative py-6 px-8 font-bold transition-all duration-300 flex items-center gap-3 whitespace-nowrap group ${
                      activeTab === tab.id
                        ? "text-violet-600 bg-white/80"
                        : "text-gray-600 hover:text-violet-600 hover:bg-white/40"
                    }`}
                  >
                    <tab.icon className="text-lg group-hover:scale-110 transition-transform" />
                    <span className="text-lg">{tab.label}</span>
                    {tab.id === "reviews" && (
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {course.ratingsCount}
                      </span>
                    )}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-t-full"
                      />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CourseOverview course={course} />
                  </motion.div>
                )}
                {activeTab === "curriculum" && (
                  <motion.div
                    key="curriculum"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CourseCurriculum
                      course={course}
                      expandedSections={expandedSections}
                      toggleSection={toggleSection}
                      formatDuration={formatDuration}
                    />
                  </motion.div>
                )}
                {activeTab === "reviews" && (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CourseReviews course={course} renderStars={renderStars} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoModalOpen && course.videoPromo && (
          <VideoModal
            videoUrl={course.videoPromo}
            onClose={() => setIsVideoModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const CourseOverview: React.FC<{ course: Course }> = ({ course }) => {
  return (
    <div className="space-y-10">
      {/* Description */}
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-1 h-8 bg-gradient-to-b from-violet-600 to-purple-600 rounded-full"></div>
            <h3 className="text-2xl font-bold text-gray-900">
              Course Overview
            </h3>
          </div>
        </div>
        <div className="prose max-w-none text-gray-700 leading-relaxed text-base">
          {course.description.split("\n").map((paragraph, index) => (
            <p key={index} className="mb-5 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Learning Objectives */}
      {course.learningObjectives.length > 0 && (
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-emerald-600 to-green-600 rounded-full"></div>
              <h3 className="text-2xl font-bold text-gray-900">
                Learning Outcomes
              </h3>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {course.learningObjectives.map((objective, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-2xl"></div>
                <div className="relative p-5 border border-emerald-200/50 rounded-2xl hover:border-emerald-300/70 transition-all duration-300 bg-white/40 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FaCheckCircle className="text-white text-sm" />
                    </div>
                    <span className="text-gray-800 font-medium leading-relaxed">
                      {objective}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Requirements */}
      {course.requirements.length > 0 && (
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-amber-600 to-orange-600 rounded-full"></div>
              <h3 className="text-2xl font-bold text-gray-900">
                Prerequisites
              </h3>
            </div>
          </div>
          <div className="space-y-4">
            {course.requirements.map((requirement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl"></div>
                <div className="relative p-5 border border-amber-200/50 rounded-2xl hover:border-amber-300/70 transition-all duration-300 bg-white/40 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FaExclamationTriangle className="text-white text-sm" />
                    </div>
                    <span className="text-gray-800 font-medium leading-relaxed">
                      {requirement}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Target Audience */}
      {course.targetAudience.length > 0 && (
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
              <h3 className="text-2xl font-bold text-gray-900">
                Target Audience
              </h3>
            </div>
          </div>
          <div className="space-y-4">
            {course.targetAudience.map((audience, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl"></div>
                <div className="relative p-5 border border-blue-200/50 rounded-2xl hover:border-blue-300/70 transition-all duration-300 bg-white/40 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FaUsers className="text-white text-sm" />
                    </div>
                    <span className="text-gray-800 font-medium leading-relaxed">
                      {audience}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {course.tags.length > 0 && (
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-violet-600 to-purple-600 rounded-full"></div>
              <h3 className="text-2xl font-bold text-gray-900">
                Topics Covered
              </h3>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {course.tags.map((tag, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className="relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl"></div>
                <div className="relative px-5 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-gray-800 font-semibold text-sm hover:bg-white/30 transition-all duration-300 cursor-default">
                  {tag}
                </div>
              </motion.span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CourseCurriculum: React.FC<{
  course: Course;
  expandedSections: string[];
  toggleSection: (sectionId: string) => void;
  formatDuration: (seconds: number) => string;
}> = ({ course, expandedSections, toggleSection, formatDuration }) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-3xl p-8 border border-violet-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FaBook className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Course Content
              </h3>
              <p className="text-gray-600 mt-1">
                Comprehensive learning path designed for success
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-violet-600">
              {course.sections.length}
            </div>
            <div className="text-sm text-gray-600">Sections</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-2xl p-6 text-center border border-violet-100">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {course.sections.length}
            </div>
            <div className="text-violet-600 font-semibold">Sections</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center border border-violet-100">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {course.totalLessons}
            </div>
            <div className="text-violet-600 font-semibold">Lessons</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center border border-violet-100">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatDuration(course.totalDuration)}
            </div>
            <div className="text-violet-600 font-semibold">Total Length</div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {course.sections.map((section, sectionIndex) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-8 py-6 text-left hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 transition-all duration-300 flex items-center justify-between group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                    {sectionIndex + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-xl group-hover:text-violet-600 transition-colors">
                      {section.title}
                    </h4>
                    {section.description && (
                      <p className="text-gray-600 mt-1 text-sm leading-relaxed">
                        {section.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {section.lessons.length} lessons
                  </div>
                  <div className="text-sm font-semibold text-violet-600">
                    {formatDuration(
                      section.lessons.reduce(
                        (acc, lesson) => acc + lesson.duration,
                        0
                      )
                    )}
                  </div>
                </div>
                <div className="transition-transform duration-300 group-hover:scale-110">
                  {expandedSections.includes(section.id) ? (
                    <FaChevronUp className="text-2xl text-violet-600" />
                  ) : (
                    <FaChevronDown className="text-2xl text-gray-400 group-hover:text-violet-600" />
                  )}
                </div>
              </div>
            </button>

            <AnimatePresence>
              {expandedSections.includes(section.id) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="border-t border-gray-200"
                >
                  <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
                    <div className="space-y-4">
                      {section.lessons.map((lesson, lessonIndex) => (
                        <LessonItem
                          key={lesson.id}
                          lesson={lesson}
                          lessonIndex={lessonIndex}
                          formatDuration={formatDuration}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const LessonItem: React.FC<{
  lesson: Lesson;
  lessonIndex: number;
  formatDuration: (seconds: number) => string;
}> = ({ lesson, lessonIndex, formatDuration }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: lessonIndex * 0.05 }}
      className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-violet-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-center gap-6">
        {/* Lesson Icon */}
        <div className="flex-shrink-0">
          {lesson.isPreview ? (
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaPlayCircle className="text-white text-xl" />
            </div>
          ) : (
            <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaLock className="text-white text-xl" />
            </div>
          )}
        </div>

        {/* Lesson Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-bold text-gray-900 text-lg group-hover:text-violet-600 transition-colors">
              {lessonIndex + 1}. {lesson.title}
            </span>
            {lesson.isPreview && (
              <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full shadow-sm">
                FREE PREVIEW
              </span>
            )}
          </div>

          {lesson.description && (
            <p className="text-gray-600 mb-3 leading-relaxed line-clamp-2">
              {lesson.description}
            </p>
          )}

          {/* Lesson Meta */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-violet-600">
              <FaClock className="text-sm" />
              <span className="font-semibold">
                {formatDuration(lesson.duration)}
              </span>
            </div>

            {lesson.resources.length > 0 && (
              <div className="flex items-center gap-2 text-blue-600">
                <FaDownload className="text-sm" />
                <span className="font-semibold">
                  {lesson.resources.length} resources
                </span>
              </div>
            )}

            {lesson.quiz.length > 0 && (
              <div className="flex items-center gap-2 text-orange-600">
                <FaQuestionCircle className="text-sm" />
                <span className="font-semibold">
                  {lesson.quiz.length} quiz questions
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Duration Display */}
        <div className="flex-shrink-0 text-right">
          <div className="text-lg font-bold text-gray-900">
            {formatDuration(lesson.duration)}
          </div>
          <div className="text-sm text-gray-500">duration</div>
        </div>
      </div>

      {/* Resources Preview (if available) */}
      {lesson.resources.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <FaDownload className="text-blue-500" />
            <span className="font-semibold">Downloadable Resources:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {lesson.resources.map((resource, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-200"
              >
                {resource.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const CourseReviews: React.FC<{
  course: Course;
  renderStars: (rating: number) => React.ReactElement[];
}> = ({ course, renderStars }) => {
  return (
    <div className="space-y-8">
      {/* Rating Overview */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-8 border border-yellow-100">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-center">
            <div className="text-6xl font-bold text-gray-900 mb-4">
              {course.rating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              {renderStars(course.rating).map((star, index) => (
                <span key={index} className="text-3xl">
                  {star}
                </span>
              ))}
            </div>
            <div className="text-xl text-gray-600 font-semibold">
              Based on {course.ratingsCount.toLocaleString()} reviews
            </div>
          </div>

          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = course.reviews.filter(
                (r) => Math.floor(r.rating) === rating
              ).length;
              const percentage =
                course.ratingsCount > 0
                  ? (count / course.ratingsCount) * 100
                  : 0;

              return (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-semibold text-gray-700">
                      {rating}
                    </span>
                    <FaStar className="text-yellow-400 text-sm" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: rating * 0.1 }}
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-600 w-12">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
            <FaStar className="text-white text-lg" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Student Reviews</h3>
        </div>

        {course.reviews.length > 0 ? (
          <div className="space-y-6">
            {course.reviews.map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xl">
                        {review.user.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="font-bold text-gray-900 text-lg">
                        Verified Student
                      </span>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating).map((star, starIndex) => (
                          <span key={starIndex} className="text-xl">
                            {star}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {new Date(review.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <blockquote className="text-gray-700 leading-relaxed text-lg italic relative">
                      <span className="text-4xl text-violet-300 absolute -left-2 -top-2">
                        "
                      </span>
                      <span className="relative z-10">{review.comment}</span>
                      <span className="text-4xl text-violet-300 absolute -right-2 -bottom-4">
                        "
                      </span>
                    </blockquote>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FaStar className="text-4xl text-gray-400" />
            </div>
            <h4 className="text-xl font-bold text-gray-700 mb-2">
              No reviews yet
            </h4>
            <p className="text-gray-500 text-lg">
              Be the first to review this course and help other students!
            </p>
            <button className="mt-6 px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              Write a Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const CourseDetailsLoader = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-20 bg-gray-200 rounded mb-6"></div>
              <div className="flex gap-4">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="animate-pulse bg-white rounded-2xl p-6">
              <div className="aspect-video bg-gray-200 rounded mb-6"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseNotFound: React.FC<{ error: any }> = ({ error }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <FaExclamationTriangle className="text-6xl text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Course Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          {error?.message ||
            "The course you're looking for doesn't exist or has been removed."}
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

const VideoModal: React.FC<{ videoUrl: string; onClose: () => void }> = ({
  videoUrl,
  onClose,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-3xl overflow-hidden max-w-6xl w-full aspect-video shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-full">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-2xl flex items-center justify-center transition-all duration-300 group"
          >
            <span className="text-2xl font-bold group-hover:scale-110 transition-transform">
              ×
            </span>
          </button>

          {/* Video Player */}
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full object-cover rounded-3xl"
            poster=""
          />

          {/* Video Overlay Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-3xl">
            <div className="text-white">
              <h3 className="text-xl font-bold mb-2">Course Preview</h3>
              <p className="text-white/80">
                Get a sneak peek of what you'll learn in this course
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CourseDetails;

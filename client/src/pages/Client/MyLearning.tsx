import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaBook,
  FaPlay,
  FaCertificate,
  FaStar,
  FaClock,
  FaArrowRight,
} from "react-icons/fa";

const MyLearning = () => {
  const navigate = useNavigate();

  // This would typically come from an API call
  const enrolledCourses = [
    {
      id: "1",
      title: "Complete React Developer Course",
      instructor: "John Doe",
      image:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop",
      progress: 45,
      totalLessons: 120,
      completedLessons: 54,
      lastAccessed: "2 hours ago",
      rating: 4.8,
    },
    {
      id: "2",
      title: "Advanced JavaScript Concepts",
      instructor: "Jane Smith",
      image:
        "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=200&fit=crop",
      progress: 78,
      totalLessons: 85,
      completedLessons: 66,
      lastAccessed: "1 day ago",
      rating: 4.9,
    },
    {
      id: "3",
      title: "Node.js Backend Development",
      instructor: "Mike Johnson",
      image:
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=200&fit=crop",
      progress: 23,
      totalLessons: 95,
      completedLessons: 22,
      lastAccessed: "3 days ago",
      rating: 4.7,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
                <FaBook className="text-blue-600" />
                <span>My Learning</span>
              </h1>
              <p className="text-gray-600 mt-1">
                Continue your learning journey with {enrolledCourses.length}{" "}
                enrolled courses
              </p>
            </div>
            <button
              onClick={() => navigate("/courses")}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
            >
              Browse More Courses
            </button>
          </div>
        </motion.div>

        {enrolledCourses.length === 0 ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <FaBook className="text-4xl text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Start Your Learning Journey
              </h2>
              <p className="text-gray-600 mb-8">
                You haven't enrolled in any courses yet. Discover amazing
                courses to get started!
              </p>
              <button
                onClick={() => navigate("/courses")}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
              >
                Browse Courses
              </button>
            </div>
          </motion.div>
        ) : (
          // Course Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-gray-300 cursor-pointer group"
                onClick={() => navigate(`/course/${course.id}/learn`)}
              >
                {/* Image with Progress Overlay */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <FaPlay className="text-2xl text-blue-600 ml-1" />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/20">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-blue-500"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>

                  {/* Progress Percentage */}
                  <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-sm font-bold">
                    {course.progress}%
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      By {course.instructor}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <FaBook className="text-xs text-blue-500" />
                        <span>
                          {course.completedLessons}/{course.totalLessons}{" "}
                          lessons
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FaStar className="text-xs text-yellow-400" />
                        <span>{course.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <FaClock className="text-xs" />
                      <span>Last accessed: {course.lastAccessed}</span>
                    </div>
                  </div>

                  {/* Continue Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/course/${course.id}/learn`);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                  >
                    <FaPlay className="text-sm" />
                    <span>Continue Learning</span>
                    <FaArrowRight className="text-sm" />
                  </button>

                  {/* Certificate Badge */}
                  {course.progress === 100 && (
                    <div className="mt-3 flex items-center justify-center space-x-2 text-sm text-green-600 font-medium">
                      <FaCertificate />
                      <span>Certificate Available</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLearning;

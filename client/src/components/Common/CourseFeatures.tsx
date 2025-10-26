import { FaClock, FaPlayCircle, FaCheckCircle, FaMobile } from "react-icons/fa";
import type { Course } from "../../types/course.type";

interface CourseFeaturesProps {
  course: Course;
}

const CourseFeatures: React.FC<CourseFeaturesProps> = ({ course }) => {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins.toFixed(0)}m`;
    }
    return `${mins}m`;
  };

  const courseFeatures = [
    {
      icon: FaClock,
      text: `${formatDuration(course.totalDuration / 60 || 0)} total`,
    },
    { icon: FaPlayCircle, text: `${course.totalLessons || 0} lectures` },
    { icon: FaCheckCircle, text: "Lifetime access" },
    { icon: FaMobile, text: "Mobile & TV access" },
  ];

  const whatYoullLearn =
    course.description || "Master the fundamentals and advanced concepts";

  return (
    <>
      {/* What You'll Learn */}
      <div className="p-4 border-b border-gray-100">
        <h5 className="font-semibold text-gray-900 mb-2">What you'll learn</h5>
        <p className="text-sm text-gray-600 line-clamp-3">{whatYoullLearn}</p>
      </div>

      {/* Course Features */}
      <div className="p-4 border-b border-gray-100">
        <h5 className="font-semibold text-gray-900 mb-3">
          This course includes:
        </h5>
        <div className="space-y-2">
          {courseFeatures.map((feature, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <feature.icon className="text-gray-400 text-sm flex-shrink-0" />
              <span className="text-sm text-gray-600">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CourseFeatures;

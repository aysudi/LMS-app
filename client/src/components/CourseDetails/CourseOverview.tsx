import { FaCheckCircle } from "react-icons/fa";
import HTMLRenderer from "../../utils/htmlRenderer";
import { useTranslation } from "react-i18next";
import type { Course } from "../../types/course.type";
import { motion } from "framer-motion";

const CourseOverview: React.FC<{ course: Course }> = ({ course }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Course Description */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          {t("courseDetails.description")}
        </h3>
        <div className="prose prose-lg max-w-none text-gray-700">
          <HTMLRenderer
            content={course.description}
            className="text-gray-700 prose-lg max-w-none"
          />
        </div>
      </div>

      {/* What you'll learn */}
      {course.learningObjectives.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            {t("courseDetails.whatYoullLearn")}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {course.learningObjectives.map((objective, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3"
              >
                <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                <span className="text-gray-700 leading-relaxed">
                  {objective}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Requirements */}
      {course.requirements.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {t("courseDetails.requirements")}
          </h3>
          <ul className="space-y-3">
            {course.requirements.map((requirement, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-700">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span className="leading-relaxed">{requirement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Target Audience */}
      {course.targetAudience.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {t("courseDetails.whoThisCourseIsFor")}
          </h3>
          <ul className="space-y-3">
            {course.targetAudience.map((audience, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-700">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span className="leading-relaxed">{audience}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CourseOverview;

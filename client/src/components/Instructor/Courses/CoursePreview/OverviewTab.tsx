import { FaCheck } from "react-icons/fa";

const OverviewTab = ({ course }: { course: any }) => {
  return (
    <div className="space-y-6">
      {/* Description */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          About this course
        </h3>
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
            {course.learningObjectives.map(
              (objective: string, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{objective}</span>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Requirements */}
      {course.requirements && course.requirements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Requirements
          </h3>
          <ul className="space-y-2">
            {course.requirements.map((requirement: string, index: number) => (
              <li key={index} className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">•</span>
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
              <li key={index} className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">•</span>
                <span className="text-gray-700">{audience}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;

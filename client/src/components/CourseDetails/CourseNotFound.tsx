import { useTranslation } from "react-i18next";
import { FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const CourseNotFound: React.FC<{ error: any }> = ({ error }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaExclamationTriangle className="text-3xl text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {t("courseDetails.courseNotFound")}
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          {error?.message || t("courseDetails.courseNotFoundDesc")}
        </p>
        <div className="space-x-4">
          <button
            onClick={() => navigate("/courses")}
            className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            {t("courseDetails.browseCourses")}
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t("courseDetails.goBack")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseNotFound;

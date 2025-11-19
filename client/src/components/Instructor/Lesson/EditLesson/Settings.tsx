import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaEye, FaEyeSlash } from "react-icons/fa";

type Props = {
  duration: number;
  isPreview: boolean;
  setDuration: (duration: number) => void;
  setIsPreview: (isPreview: boolean) => void;
};

const Settings = ({
  duration,
  isPreview,
  setDuration,
  setIsPreview,
}: Props) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          {t("instructor.editCourse.lessonEdit.lessonSettings")}
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("instructor.editCourse.lessonEdit.durationMinutes")}
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              min="0"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t("instructor.editCourse.lessonEdit.previewLesson")}
              </label>
              <p className="text-xs text-gray-500 mt-1">
                {t("instructor.editCourse.lessonEdit.allowFreePreview")}
              </p>
            </div>
            <button
              onClick={() => setIsPreview(!isPreview)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPreview ? "bg-indigo-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPreview ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-600">
              {isPreview ? (
                <FaEye className="mr-2 text-green-600" />
              ) : (
                <FaEyeSlash className="mr-2 text-gray-400" />
              )}
              {isPreview
                ? t("instructor.editCourse.lessonEdit.visibleToAll")
                : t("instructor.editCourse.lessonEdit.onlyForEnrolled")}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

type Props = {
  duration: number;
  setDuration: (duration: number) => void;
};

const Settings = ({ duration, setDuration }: Props) => {
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
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;

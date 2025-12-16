import { motion } from "framer-motion";
import { t } from "i18next";
import { FaChalkboardTeacher, FaCheck, FaPlus } from "react-icons/fa";
import { EXPERTISE_OPTIONS } from "../../../types/instructorApplication.type";

const RenderStep2 = ({ formik }: { formik: any }) => {
  const handleExpertiseToggle = (expertise: string) => {
    const currentExpertise = formik.values.expertise;
    const newExpertise = currentExpertise.includes(expertise)
      ? currentExpertise.filter((item: any) => item !== expertise)
      : [...currentExpertise, expertise];

    formik.setFieldValue("expertise", newExpertise);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaChalkboardTeacher className="text-white text-2xl" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {t("instructorApplication.steps.background")}
        </h2>
        <p className="text-gray-600">
          Tell us about yourself and your expertise
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("instructorApplication.form.bio")} *
          <span className="text-xs text-gray-500 ml-2">
            ({formik.values.bio.length}/500)
          </span>
        </label>
        <textarea
          name="bio"
          value={formik.values.bio}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          rows={4}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
            formik.touched.bio && formik.errors.bio
              ? "border-red-300 focus:ring-red-500"
              : "border-gray-300"
          }`}
          placeholder={t("instructorApplication.form.bioPlaceholder")}
        />
        {formik.touched.bio && formik.errors.bio && (
          <p className="mt-1 text-sm text-red-600">{formik.errors.bio}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("instructorApplication.form.expertise")} *
          <span className="text-xs text-gray-500 ml-2">
            ({formik.values.expertise.length}/10 selected)
          </span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-xl p-4">
          {EXPERTISE_OPTIONS.map((option) => (
            <motion.button
              key={option}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleExpertiseToggle(option)}
              className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 text-sm ${
                formik.values.expertise.includes(option)
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="truncate">{option}</span>
              {formik.values.expertise.includes(option) ? (
                <FaCheck className="text-blue-500 ml-2 flex-shrink-0" />
              ) : (
                <FaPlus className="text-gray-400 ml-2 flex-shrink-0" />
              )}
            </motion.button>
          ))}
        </div>
        {formik.touched.expertise && formik.errors.expertise && (
          <p className="mt-1 text-sm text-red-600">{formik.errors.expertise}</p>
        )}
      </div>
    </motion.div>
  );
};

export default RenderStep2;

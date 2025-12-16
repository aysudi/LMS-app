import { motion } from "framer-motion";
import { t } from "i18next";
import { FaGraduationCap } from "react-icons/fa";

const RenderStep3 = ({ formik }: { formik: any }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaGraduationCap className="text-white text-2xl" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {t("instructorApplication.steps.expertise")}
        </h2>
        <p className="text-gray-600">
          Share your experience and passion for teaching
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("instructorApplication.form.experience")} *
          <span className="text-xs text-gray-500 ml-2">
            ({formik.values.experience.length}/1000)
          </span>
        </label>
        <textarea
          name="experience"
          value={formik.values.experience}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          rows={5}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
            formik.touched.experience && formik.errors.experience
              ? "border-red-300 focus:ring-red-500"
              : "border-gray-300"
          }`}
          placeholder={t("instructorApplication.form.experiencePlaceholder")}
        />
        {formik.touched.experience && formik.errors.experience && (
          <p className="mt-1 text-sm text-red-600">
            {formik.errors.experience}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("instructorApplication.form.education")} *
          <span className="text-xs text-gray-500 ml-2">
            ({formik.values.education.length}/500)
          </span>
        </label>
        <textarea
          name="education"
          value={formik.values.education}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          rows={3}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
            formik.touched.education && formik.errors.education
              ? "border-red-300 focus:ring-red-500"
              : "border-gray-300"
          }`}
          placeholder={t("instructorApplication.form.educationPlaceholder")}
        />
        {formik.touched.education && formik.errors.education && (
          <p className="mt-1 text-sm text-red-600">{formik.errors.education}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("instructorApplication.form.motivation")} *
          <span className="text-xs text-gray-500 ml-2">
            ({formik.values.motivation.length}/500)
          </span>
        </label>
        <textarea
          name="motivation"
          value={formik.values.motivation}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          rows={4}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
            formik.touched.motivation && formik.errors.motivation
              ? "border-red-300 focus:ring-red-500"
              : "border-gray-300"
          }`}
          placeholder={t("instructorApplication.form.motivationPlaceholder")}
        />
        {formik.touched.motivation && formik.errors.motivation && (
          <p className="mt-1 text-sm text-red-600">
            {formik.errors.motivation}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default RenderStep3;

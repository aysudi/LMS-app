import { motion } from "framer-motion";
import { t } from "i18next";
import {
  FaExternalLinkAlt,
  FaGlobe,
  FaInfoCircle,
  FaLightbulb,
  FaLinkedin,
} from "react-icons/fa";

const RenderStep4 = ({ formik }: { formik: any }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaLightbulb className="text-white text-2xl" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {t("instructorApplication.steps.additionalInfo")}
        </h2>
        <p className="text-gray-600">
          Optional details to strengthen your application
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <FaInfoCircle className="text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">Pro Tip</h4>
            <p className="text-sm text-blue-700 mt-1">
              While these fields are optional, providing them can significantly
              strengthen your application and help us understand your teaching
              potential better.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("instructorApplication.form.sampleCourseTitle")}
            <span className="text-xs text-gray-500 ml-2">
              ({formik.values.sampleCourseTitle.length}/100)
            </span>
          </label>
          <input
            type="text"
            name="sampleCourseTitle"
            value={formik.values.sampleCourseTitle}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder={t(
              "instructorApplication.form.sampleCourseTitlePlaceholder"
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("instructorApplication.form.portfolio")}
          </label>
          <div className="relative">
            <input
              type="url"
              name="portfolio"
              value={formik.values.portfolio}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                formik.touched.portfolio && formik.errors.portfolio
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300"
              }`}
              placeholder={t("instructorApplication.form.portfolioPlaceholder")}
            />
            <FaExternalLinkAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          {formik.touched.portfolio && formik.errors.portfolio && (
            <p className="mt-1 text-sm text-red-600">
              {formik.errors.portfolio}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("instructorApplication.form.linkedIn")}
          </label>
          <div className="relative">
            <input
              type="url"
              name="linkedIn"
              value={formik.values.linkedIn}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                formik.touched.linkedIn && formik.errors.linkedIn
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300"
              }`}
              placeholder={t("instructorApplication.form.linkedInPlaceholder")}
            />
            <FaLinkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          {formik.touched.linkedIn && formik.errors.linkedIn && (
            <p className="mt-1 text-sm text-red-600">
              {formik.errors.linkedIn}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("instructorApplication.form.website")}
          </label>
          <div className="relative">
            <input
              type="url"
              name="website"
              value={formik.values.website}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                formik.touched.website && formik.errors.website
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300"
              }`}
              placeholder={t("instructorApplication.form.websitePlaceholder")}
            />
            <FaGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          {formik.touched.website && formik.errors.website && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.website}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("instructorApplication.form.sampleCourseDescription")}
          <span className="text-xs text-gray-500 ml-2">
            ({formik.values.sampleCourseDescription.length}/500)
          </span>
        </label>
        <textarea
          name="sampleCourseDescription"
          value={formik.values.sampleCourseDescription}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
          placeholder={t(
            "instructorApplication.form.sampleCourseDescriptionPlaceholder"
          )}
        />
      </div>
    </motion.div>
  );
};

export default RenderStep4;

import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  FaDollarSign,
  FaGlobe,
  FaCertificate,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";

interface PricingSettingsStepProps {
  formData: {
    originalPrice: number;
    discountPrice: number;
    isFree: boolean;
    language: string;
    certificateProvided: boolean;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
}

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Italian",
  "Russian",
  "Chinese",
  "Japanese",
  "Korean",
];

const PricingSettingsStep: React.FC<PricingSettingsStepProps> = ({
  formData,
  setFormData,
  errors,
}) => {
  const { t } = useTranslation();
  return (
    <motion.div
      key="pricing-settings"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-8"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("instructor.createCourse.pricingSettings.title")}
          </h2>
          <p className="text-gray-600">
            {t("instructor.createCourse.pricingSettings.description")}
          </p>
        </div>

        <div className="space-y-8">
          {/* Pricing Section */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaDollarSign className="text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t("instructor.createCourse.pricingSettings.coursePricing")}
                </h3>
                <p className="text-sm text-gray-600">
                  {t(
                    "instructor.createCourse.pricingSettings.chooseFreeOrPaid"
                  )}
                </p>
              </div>
            </div>

            {/* Free/Paid Toggle */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">
                  {t("instructor.createCourse.pricingSettings.courseType")}:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev: any) => ({
                      ...prev,
                      isFree: !prev.isFree,
                    }))
                  }
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  {formData.isFree ? (
                    <>
                      <FaToggleOn className="text-2xl text-green-500" />
                      <span className="text-green-600 font-medium">
                        {t(
                          "instructor.createCourse.pricingSettings.freeCourse"
                        )}
                      </span>
                    </>
                  ) : (
                    <>
                      <FaToggleOff className="text-2xl text-gray-400" />
                      <span className="text-gray-600 font-medium">
                        {t(
                          "instructor.createCourse.pricingSettings.paidCourse"
                        )}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Pricing Inputs - Only show for paid courses */}
            {!formData.isFree && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="originalPrice"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("instructor.createCourse.pricingSettings.originalPrice")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaDollarSign className="text-gray-400 text-sm" />
                    </div>
                    <input
                      type="number"
                      id="originalPrice"
                      value={formData.originalPrice || ""}
                      onChange={(e) =>
                        setFormData((prev: any) => ({
                          ...prev,
                          originalPrice: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder="99.99"
                      min="0"
                      step="0.01"
                      className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                        errors.originalPrice
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  {errors.originalPrice && (
                    <p className="text-sm text-red-600 mt-2">
                      {errors.originalPrice}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="discountPrice"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("instructor.createCourse.pricingSettings.discountPrice")}
                    <span className="text-gray-500 text-xs ml-1">
                      ({t("common.optional")})
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaDollarSign className="text-gray-400 text-sm" />
                    </div>
                    <input
                      type="number"
                      id="discountPrice"
                      value={formData.discountPrice || ""}
                      onChange={(e) =>
                        setFormData((prev: any) => ({
                          ...prev,
                          discountPrice: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder="79.99"
                      min="0"
                      step="0.01"
                      className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                        errors.discountPrice
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  {errors.discountPrice && (
                    <p className="text-sm text-red-600 mt-2">
                      {errors.discountPrice}
                    </p>
                  )}
                  {formData.discountPrice > 0 && formData.originalPrice > 0 && (
                    <p className="text-sm text-green-600 mt-2">
                      {Math.round(
                        ((formData.originalPrice - formData.discountPrice) /
                          formData.originalPrice) *
                          100
                      )}
                      {t("instructor.createCourse.pricingSettings.discount")}
                    </p>
                  )}
                </div>
              </div>
            )}

            {formData.isFree && (
              <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  <strong>
                    {t(
                      "instructor.createCourse.pricingSettings.freeCoursebenefits"
                    )}
                  </strong>
                </p>
              </div>
            )}
          </div>

          {/* Language Selection */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaGlobe className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t("instructor.createCourse.pricingSettings.courseLanguage")}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("instructor.createCourse.pricingSettings.selectLanguage")}
                </p>
              </div>
            </div>

            <select
              value={formData.language}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  language: e.target.value,
                }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            >
              {LANGUAGES.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </div>

          {/* Certificate Settings */}
          <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaCertificate className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t(
                    "instructor.createCourse.pricingSettings.certificateCompletion"
                  )}
                </h3>
                <p className="text-sm text-gray-600">
                  {t(
                    "instructor.createCourse.pricingSettings.offerCertificate"
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 mb-1">
                  <strong>
                    {t(
                      "instructor.createCourse.pricingSettings.provideCertificate"
                    )}
                  </strong>
                </p>
                <p className="text-sm text-gray-500">
                  {t(
                    "instructor.createCourse.pricingSettings.certificateDescription"
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev: any) => ({
                    ...prev,
                    certificateProvided: !prev.certificateProvided,
                  }))
                }
                className="focus:outline-none"
              >
                {formData.certificateProvided ? (
                  <FaToggleOn className="text-3xl text-purple-500" />
                ) : (
                  <FaToggleOff className="text-3xl text-gray-400" />
                )}
              </button>
            </div>

            {formData.certificateProvided && (
              <div className="mt-4 bg-purple-100 border border-purple-200 rounded-lg p-4">
                <p className="text-purple-800 text-sm">
                  <strong>
                    {t(
                      "instructor.createCourse.pricingSettings.certificateFeatures"
                    )}
                  </strong>
                </p>
              </div>
            )}
          </div>

          {/* Pricing Tips */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h4 className="font-semibold text-yellow-800 mb-3">
              {t("instructor.createCourse.pricingSettings.pricingTips")}
            </h4>
            <ul className="text-sm text-yellow-700 space-y-2">
              <li>• {t("instructor.createCourse.pricingSettings.tip1")}</li>
              <li>• {t("instructor.createCourse.pricingSettings.tip2")}</li>
              <li>• {t("instructor.createCourse.pricingSettings.tip3")}</li>
              <li>• {t("instructor.createCourse.pricingSettings.tip4")}</li>
              <li>• {t("instructor.createCourse.pricingSettings.tip5")}</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PricingSettingsStep;

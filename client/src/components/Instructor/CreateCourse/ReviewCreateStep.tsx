import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  FaEye,
  FaBook,
  FaUsers,
  FaDollarSign,
  FaGlobe,
  FaCertificate,
  FaTag,
  FaList,
  FaCheckCircle,
  FaImage,
} from "react-icons/fa";

interface ReviewCreateStepProps {
  formData: {
    title: string;
    description: string;
    shortDescription: string;
    category: string;
    subcategory: string;
    tags: string[];
    learningObjectives: string[];
    requirements: string[];
    targetAudience: string[];
    level: "Beginner" | "Intermediate" | "Advanced";
    originalPrice: number;
    discountPrice: number;
    isFree: boolean;
    language: string;
    certificateProvided: boolean;
    image: File | null;
    videoPromo: File | null;
  };
  isSubmitting: boolean;
}

const ReviewCreateStep: React.FC<ReviewCreateStepProps> = ({
  formData,
  isSubmitting,
}) => {
  const { t } = useTranslation();
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const getSavingsPercentage = () => {
    if (formData.discountPrice > 0 && formData.originalPrice > 0) {
      return Math.round(
        ((formData.originalPrice - formData.discountPrice) /
          formData.originalPrice) *
          100
      );
    }
    return 0;
  };

  const reviewSections = [
    {
      title: t(
        "instructor.createCourse.reviewCreate.sections.basicInformation"
      ),
      icon: FaBook,
      color: "blue",
      items: [
        {
          label: t("instructor.createCourse.reviewCreate.labels.courseTitle"),
          value: formData.title,
        },
        {
          label: t(
            "instructor.createCourse.reviewCreate.labels.shortDescription"
          ),
          value:
            formData.shortDescription ||
            t("instructor.createCourse.reviewCreate.values.notProvided"),
        },
        {
          label: t("instructor.createCourse.reviewCreate.labels.category"),
          value: formData.category,
        },
        {
          label: t("instructor.createCourse.reviewCreate.labels.subcategory"),
          value:
            formData.subcategory ||
            t("instructor.createCourse.reviewCreate.values.notSpecified"),
        },
      ],
    },
    {
      title: t("instructor.createCourse.reviewCreate.sections.courseDetails"),
      icon: FaList,
      color: "green",
      items: [
        {
          label: t("instructor.createCourse.reviewCreate.labels.courseLevel"),
          value: formData.level,
        },
        {
          label: t(
            "instructor.createCourse.reviewCreate.labels.learningObjectives"
          ),
          value: t("instructor.createCourse.reviewCreate.values.objectives", {
            count: formData.learningObjectives.filter((obj) => obj.trim())
              .length,
          }),
        },
        {
          label: t("instructor.createCourse.reviewCreate.labels.requirements"),
          value: t("instructor.createCourse.reviewCreate.values.requirements", {
            count: formData.requirements.filter((req) => req.trim()).length,
          }),
        },
        {
          label: t(
            "instructor.createCourse.reviewCreate.labels.targetAudience"
          ),
          value: t(
            "instructor.createCourse.reviewCreate.values.audienceGroups",
            {
              count: formData.targetAudience.filter((aud) => aud.trim()).length,
            }
          ),
        },
      ],
    },
    {
      title: t("instructor.createCourse.reviewCreate.sections.pricingSettings"),
      icon: FaDollarSign,
      color: "purple",
      items: [
        {
          label: t("instructor.createCourse.reviewCreate.labels.pricing"),
          value: formData.isFree
            ? t("instructor.createCourse.reviewCreate.values.freeCourse")
            : formData.discountPrice > 0
            ? `${formatPrice(
                formData.discountPrice
              )} (${getSavingsPercentage()}% off from ${formatPrice(
                formData.originalPrice
              )})`
            : formatPrice(formData.originalPrice),
        },
        {
          label: t("instructor.createCourse.reviewCreate.labels.language"),
          value: formData.language,
        },
        {
          label: t("instructor.createCourse.reviewCreate.labels.certificate"),
          value: formData.certificateProvided
            ? t("instructor.createCourse.reviewCreate.values.provided")
            : t("instructor.createCourse.reviewCreate.values.notProvided"),
        },
      ],
    },
    {
      title: t("instructor.createCourse.reviewCreate.sections.mediaContent"),
      icon: FaImage,
      color: "indigo",
      items: [
        {
          label: t("instructor.createCourse.reviewCreate.labels.courseImage"),
          value: formData.image
            ? t("instructor.createCourse.reviewCreate.values.uploaded")
            : t("instructor.createCourse.reviewCreate.values.notUploaded"),
        },
        {
          label: t(
            "instructor.createCourse.reviewCreate.labels.promotionalVideo"
          ),
          value: formData.videoPromo
            ? t("instructor.createCourse.reviewCreate.values.uploaded")
            : t(
                "instructor.createCourse.reviewCreate.values.optionalNotUploaded"
              ),
        },
      ],
    },
  ];

  return (
    <motion.div
      key="review-create"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-8"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("instructor.createCourse.reviewCreate.title")}
          </h2>
          <p className="text-gray-600">
            {t("instructor.createCourse.reviewCreate.description")}
          </p>
        </div>

        {/* Course Preview Card */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 border border-blue-100">
          <div className="flex items-start space-x-6">
            {/* Course Image Preview */}
            <div className="flex-shrink-0">
              <div className="w-32 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                {formData.image ? (
                  <img
                    src={URL.createObjectURL(formData.image)}
                    alt="Course preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaImage className="text-gray-400 text-2xl" />
                )}
              </div>
            </div>

            {/* Course Info */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {formData.title || t("course.title")}
              </h3>
              <p className="text-gray-600 mb-3 line-clamp-2">
                {formData.shortDescription ||
                  (formData.description
                    ? formData.description.slice(0, 100) + "..."
                    : t("course.shortDescription"))}
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center space-x-1 text-gray-600">
                  <FaBook className="text-xs" />
                  <span>{formData.category}</span>
                </span>
                <span className="flex items-center space-x-1 text-gray-600">
                  <FaUsers className="text-xs" />
                  <span>{formData.level}</span>
                </span>
                <span className="flex items-center space-x-1 text-gray-600">
                  <FaGlobe className="text-xs" />
                  <span>{formData.language}</span>
                </span>
                {formData.certificateProvided && (
                  <span className="flex items-center space-x-1 text-green-600">
                    <FaCertificate className="text-xs" />
                    <span>{t("common.certificate")}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="text-right">
              {formData.isFree ? (
                <span className="text-2xl font-bold text-green-600">
                  {t("common.free").toUpperCase()}
                </span>
              ) : (
                <div>
                  {formData.discountPrice > 0 ? (
                    <>
                      <span className="text-2xl font-bold text-purple-600">
                        {formatPrice(formData.discountPrice)}
                      </span>
                      <div className="text-sm text-gray-500 line-through">
                        {formatPrice(formData.originalPrice)}
                      </div>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-purple-600">
                      {formatPrice(formData.originalPrice)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Review Sections */}
        <div className="space-y-6">
          {reviewSections.map((section) => {
            const Icon = section.icon;
            const colorClasses = {
              blue: "bg-blue-50 border-blue-100 text-blue-600",
              green: "bg-green-50 border-green-100 text-green-600",
              purple: "bg-purple-50 border-purple-100 text-purple-600",
              indigo: "bg-indigo-50 border-indigo-100 text-indigo-600",
            };

            return (
              <div
                key={section.title}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-lg ${
                        colorClasses[section.color as keyof typeof colorClasses]
                      }`}
                    >
                      <Icon />
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      {section.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
                  ></button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {section.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start"
                    >
                      <span className="text-sm text-gray-600 font-medium">
                        {item.label}:
                      </span>
                      <span className="text-sm text-gray-900 text-right ml-4">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tags Display */}
        {formData.tags.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-yellow-50 border border-yellow-100 text-yellow-600 rounded-lg">
                <FaTag />
              </div>
              <h3 className="font-semibold text-gray-900">
                {t("instructor.createCourse.basicInformation.tags")}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 border border-blue-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Course Description */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {t("courseDetails.description")}
          </h3>
          <div className="prose prose-sm max-w-none text-gray-700">
            {formData.description.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-2">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Learning Objectives, Requirements, Target Audience */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Learning Objectives */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">
              {t("courseDetails.whatYoullLearn")}
            </h4>
            <ul className="space-y-2">
              {formData.learningObjectives
                .filter((obj) => obj.trim())
                .map((objective, index) => (
                  <li
                    key={index}
                    className="flex items-start space-x-2 text-sm text-gray-700"
                  >
                    <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{objective}</span>
                  </li>
                ))}
            </ul>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">
              {t("courseDetails.requirements")}
            </h4>
            <ul className="space-y-2">
              {formData.requirements
                .filter((req) => req.trim())
                .map((requirement, index) => (
                  <li
                    key={index}
                    className="flex items-start space-x-2 text-sm text-gray-700"
                  >
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                    <span>{requirement}</span>
                  </li>
                ))}
            </ul>
          </div>

          {/* Target Audience */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">
              {t("courseDetails.whoThisCourseIsFor")}
            </h4>
            <ul className="space-y-2">
              {formData.targetAudience
                .filter((aud) => aud.trim())
                .map((audience, index) => (
                  <li
                    key={index}
                    className="flex items-start space-x-2 text-sm text-gray-700"
                  >
                    <FaUsers className="text-blue-500 mt-0.5 flex-shrink-0 text-xs" />
                    <span>{audience}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>

        {/* Final Check */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <FaCheckCircle className="text-green-500 text-xl mt-1" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {t("instructor.createCourse.reviewCreate.readyToCreate")}
              </h4>
              <p className="text-gray-700 mb-4">
                {t("instructor.createCourse.reviewCreate.nextStepsDescription")}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <FaEye />
                  <span>
                    {t("instructor.createCourse.reviewCreate.previewAvailable")}
                  </span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>All details can be edited later</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isSubmitting && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-blue-700 font-medium">
                {t("instructor.createCourse.submitting")}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ReviewCreateStep;

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
// @ts-ignore
import { useTranslation } from "react-i18next";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBook,
  FaBullseye,
  FaCheck,
  FaDollarSign,
  FaImage,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useCreateCourse } from "../../hooks/useCourseHooks";
import BasicInformationStep from "../../components/Instructor/CreateCourse/BasicInformationStep";
import CourseDetailsStep from "../../components/Instructor/CreateCourse/CourseDetailsStep";
import PricingSettingsStep from "../../components/Instructor/CreateCourse/PricingSettingsStep";
import MediaContentStep from "../../components/Instructor/CreateCourse/MediaContentStep";
import ReviewCreateStep from "../../components/Instructor/CreateCourse/ReviewCreateStep";
import type { CourseFormData } from "../../types/course.type";
import SaveDraftButton from "../../components/Instructor/CreateCourse/SaveDraftButton";

const CreateCourse = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createCourseMutation = useCreateCourse({
    onSuccess: () => {
      toast.success(t("instructor.createCourse.courseCreatedSuccess"));
      navigate("/instructor/courses");
    },
    onError: (error) => {
      console.error("Error creating course:", error);
      toast.error(t("instructor.createCourse.courseCreatedError"));
    },
  });

  const CREATION_STEPS = [
    {
      id: 1,
      title: t("instructor.createCourse.steps.basicInformation.title"),
      description: t(
        "instructor.createCourse.steps.basicInformation.description"
      ),
      icon: FaBook,
    },
    {
      id: 2,
      title: t("instructor.createCourse.steps.courseDetails.title"),
      description: t("instructor.createCourse.steps.courseDetails.description"),
      icon: FaBullseye,
    },
    {
      id: 3,
      title: t("instructor.createCourse.steps.pricingSettings.title"),
      description: t(
        "instructor.createCourse.steps.pricingSettings.description"
      ),
      icon: FaDollarSign,
    },
    {
      id: 4,
      title: t("instructor.createCourse.steps.mediaContent.title"),
      description: t("instructor.createCourse.steps.mediaContent.description"),
      icon: FaImage,
    },
    {
      id: 5,
      title: t("instructor.createCourse.steps.reviewCreate.title"),
      description: t("instructor.createCourse.steps.reviewCreate.description"),
      icon: FaCheck,
    },
  ];

  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    shortDescription: "",
    category: "",
    subcategory: "",
    tags: [],
    learningObjectives: [],
    requirements: [],
    targetAudience: [],
    level: "Beginner",
    originalPrice: 0,
    discountPrice: 0,
    isFree: false,
    language: "English",
    certificateProvided: false,
    image: null,
    videoPromo: null,
    sections: [] as CourseFormData["sections"],
  });

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title.trim())
          newErrors.title = t(
            "instructor.createCourse.validation.titleRequired"
          );
        if (formData.title.length > 100)
          newErrors.title = t(
            "instructor.createCourse.validation.titleTooLong"
          );
        if (!formData.description.trim())
          newErrors.description = t(
            "instructor.createCourse.validation.descriptionRequired"
          );
        if (!formData.category)
          newErrors.category = t(
            "instructor.createCourse.validation.categoryRequired"
          );
        break;

      case 2:
        if (
          formData.learningObjectives.filter((obj) => obj.trim()).length === 0
        )
          newErrors.learningObjectives = t(
            "instructor.createCourse.validation.learningObjectiveRequired"
          );
        break;

      case 3:
        if (!formData.isFree && formData.originalPrice <= 0)
          newErrors.originalPrice = t(
            "instructor.createCourse.validation.priceRequired"
          );
        if (formData.discountPrice > formData.originalPrice)
          newErrors.discountPrice = t(
            "instructor.createCourse.validation.discountPriceTooHigh"
          );
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, CREATION_STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleArrayFieldAdd = (
    field: keyof Pick<
      CourseFormData,
      "learningObjectives" | "requirements" | "targetAudience"
    >
  ) => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const handleArrayFieldRemove = (
    field: keyof Pick<
      CourseFormData,
      "learningObjectives" | "requirements" | "targetAudience"
    >,
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleArrayFieldChange = (
    field: keyof Pick<
      CourseFormData,
      "learningObjectives" | "requirements" | "targetAudience"
    >,
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const handleTagAdd = (tag: string) => {
    if (
      tag.trim() &&
      !formData.tags.includes(tag.trim()) &&
      formData.tags.length < 10
    ) {
      const tags = [...formData.tags, tag.trim()];
      setFormData((prev) => ({
        ...prev,
        tags: [...tags],
      }));
    }
  };

  const handleTagRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    const formDataToSend = new FormData();

    if (formData.image instanceof File) {
      formDataToSend.append("image", formData.image);
    }
    if (formData.videoPromo instanceof File) {
      formDataToSend.append("videoPromo", formData.videoPromo);
    }

    ["tags", "learningObjectives", "requirements", "targetAudience"].forEach(
      (key) => {
        if (formData[key as keyof CourseFormData]) {
          const value = formData[key as keyof CourseFormData];
          if (Array.isArray(value)) {
            const processed = value.filter(Boolean).map(String);
            processed.forEach((item) => {
              formDataToSend.append(key, item);
            });
          }
        }
      }
    );

    if (formData.sections.length > 0) {
      formDataToSend.append("sections", JSON.stringify(formData.sections));
    }

    const simpleFields = [
      "title",
      "description",
      "shortDescription",
      "category",
      "subcategory",
      "level",
      "originalPrice",
      "discountPrice",
      "language",
      "certificateProvided",
      "isFree",
    ];

    simpleFields.forEach((field) => {
      const value = formData[field as keyof CourseFormData];
      if (value !== undefined && value !== null) {
        formDataToSend.append(field, String(value));
      }
    });

    formDataToSend.append("isPublished", "false");
    formDataToSend.append("status", "pending");
    createCourseMutation.mutate(formDataToSend);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/instructor/courses")}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <FaArrowLeft className="text-lg" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t("instructor.createCourse.title")}
              </h1>
              <p className="text-gray-600 mt-1">
                {t("instructor.createCourse.subtitle")}
              </p>
            </div>
          </div>

          {/* Save Draft Button */}
          {currentStep == 5 && (
            <SaveDraftButton
              formData={formData}
              createCourseMutation={createCourseMutation}
            />
          )}
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between">
            {CREATION_STEPS.map((step, index) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isCurrent
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {isCompleted ? (
                        <FaCheck className="text-sm" />
                      ) : (
                        <Icon className="text-sm" />
                      )}
                    </div>
                    <div className="text-center mt-2">
                      <h3
                        className={`text-sm font-medium ${
                          isCurrent ? "text-indigo-600" : "text-gray-900"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {index < CREATION_STEPS.length - 1 && (
                    <div
                      className={`w-16 sm:w-32 h-0.5 mx-4 transition-colors duration-300 ${
                        currentStep > step.id ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <BasicInformationStep
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                onTagAdd={handleTagAdd}
                onTagRemove={handleTagRemove}
              />
            )}

            {/* Step 2: Course Details */}
            {currentStep === 2 && (
              <CourseDetailsStep
                formData={formData}
                onArrayFieldAdd={handleArrayFieldAdd}
                onArrayFieldRemove={handleArrayFieldRemove}
                onArrayFieldChange={handleArrayFieldChange}
                setFormData={setFormData}
                errors={errors}
              />
            )}

            {/* Step 3: Pricing & Settings */}
            {currentStep === 3 && (
              <PricingSettingsStep
                formData={formData}
                setFormData={setFormData}
                errors={errors}
              />
            )}

            {/* Step 4: Media & Content */}
            {currentStep === 4 && (
              <MediaContentStep
                formData={formData}
                setFormData={setFormData}
                errors={errors}
              />
            )}

            {/* Step 6: Review & Create */}
            {currentStep === 5 && (
              <ReviewCreateStep
                formData={formData}
                isSubmitting={createCourseMutation.isPending}
              />
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaArrowLeft className="text-sm" />
              <span>{t("common.previous")}</span>
            </button>

            <span className="text-sm text-gray-500">
              {t("instructor.createCourse.stepProgress", {
                current: currentStep,
                total: CREATION_STEPS.length,
              })}
            </span>

            {currentStep < CREATION_STEPS.length ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
              >
                <span>{t("common.next")}</span>
                <FaArrowRight className="text-sm" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={createCourseMutation.isPending}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {createCourseMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t("instructor.createCourse.submitting")}</span>
                  </>
                ) : (
                  <>
                    <FaCheck className="text-sm" />
                    <span>
                      {t("instructor.createCourse.submitForApproval")}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="m-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>
                📋 {t("instructor.createCourse.approvalProcess.title")}:
              </strong>{" "}
              {t("instructor.createCourse.approvalProcess.description")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;

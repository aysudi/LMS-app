import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useFormik } from "formik";
// @ts-ignore
import { useTranslation } from "react-i18next";
import { FaHeart, FaArrowRight, FaArrowLeft, FaCheck } from "react-icons/fa";
import { useSubmitInstructorApplication } from "../../hooks/useInstructorApplication";
import { useAuthContext } from "../../context/AuthContext";
import createValidationSchema from "../../validations/createValidation";
import RenderStep1 from "../../components/Client/InstructorApplicationForm/RenderStep1";
import RenderStep2 from "../../components/Client/InstructorApplicationForm/RenderStep2";
import RenderStep3 from "../../components/Client/InstructorApplicationForm/RenderStep3";
import RenderStep4 from "../../components/Client/InstructorApplicationForm/RenderStep4";

const InstructorApplicationForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [currentStep, setCurrentStep] = useState(1);
  const submitMutation = useSubmitInstructorApplication();

  const totalSteps = 4;

  const formik = useFormik({
    initialValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: "",
      bio: "",
      expertise: [] as string[],
      experience: "",
      education: "",
      motivation: "",
      sampleCourseTitle: "",
      sampleCourseDescription: "",
      portfolio: "",
      linkedIn: "",
      website: "",
    },
    validationSchema: createValidationSchema(t),
    onSubmit: async (values) => {
      try {
        await submitMutation.mutateAsync(values);
        navigate("/instructor-application-success");
      } catch (error) {
        console.error("Application submission failed:", error);
      }
    },
  });

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return (
          formik.values.firstName &&
          formik.values.lastName &&
          formik.values.email &&
          !formik.errors.firstName &&
          !formik.errors.lastName &&
          !formik.errors.email
        );
      case 2:
        return (
          formik.values.bio &&
          formik.values.expertise.length > 0 &&
          !formik.errors.bio &&
          !formik.errors.expertise
        );
      case 3:
        return (
          formik.values.experience &&
          formik.values.education &&
          formik.values.motivation &&
          !formik.errors.experience &&
          !formik.errors.education &&
          !formik.errors.motivation
        );
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <RenderStep1 formik={formik} user={user} />;
      case 2:
        return <RenderStep2 formik={formik} />;
      case 3:
        return <RenderStep3 formik={formik} />;
      case 4:
        return <RenderStep4 formik={formik} />;
      default:
        return <RenderStep1 formik={formik} user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {t("instructorApplication.title")}
          </h1>
          <p className="text-xl text-gray-600">
            {t("instructorApplication.subtitle")}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step <= currentStep
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step < currentStep ? <FaCheck /> : step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-all duration-300 ${
                      step < currentStep
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <span className="text-sm text-gray-600">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={formik.handleSubmit}>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-8 mb-8">
            <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <motion.button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              whileHover={{ scale: currentStep === 1 ? 1 : 1.02 }}
              whileTap={{ scale: currentStep === 1 ? 1 : 0.98 }}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                currentStep === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-md hover:shadow-lg"
              }`}
            >
              <FaArrowLeft />
              <span>{t("instructorApplication.buttons.previous")}</span>
            </motion.button>

            {currentStep < totalSteps ? (
              <motion.button
                type="button"
                onClick={nextStep}
                disabled={!canProceedToNext()}
                whileHover={{ scale: canProceedToNext() ? 1.02 : 1 }}
                whileTap={{ scale: canProceedToNext() ? 0.98 : 1 }}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
                  canProceedToNext()
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <span>{t("instructorApplication.buttons.next")}</span>
                <FaArrowRight />
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                disabled={submitMutation.isPending || !formik.isValid}
                whileHover={{
                  scale: submitMutation.isPending || !formik.isValid ? 1 : 1.02,
                }}
                whileTap={{
                  scale: submitMutation.isPending || !formik.isValid ? 1 : 0.98,
                }}
                className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  submitMutation.isPending || !formik.isValid
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg hover:shadow-xl"
                }`}
              >
                {submitMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>{t("instructorApplication.buttons.submitting")}</span>
                  </>
                ) : (
                  <>
                    <FaHeart />
                    <span>{t("instructorApplication.buttons.submit")}</span>
                  </>
                )}
              </motion.button>
            )}
          </div>
        </form>

        {/* Help Text */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Need help? Contact our support team at{" "}
            <a
              href="mailto:support@skillify.com"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              support@skillify.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstructorApplicationForm;

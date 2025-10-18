import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  FaChalkboardTeacher,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaGraduationCap,
  FaLightbulb,
  FaHeart,
  FaExternalLinkAlt,
  FaLinkedin,
  FaGlobe,
  FaArrowRight,
  FaArrowLeft,
  FaCheck,
  FaPlus,
  FaInfoCircle,
} from "react-icons/fa";
import { EXPERTISE_OPTIONS } from "../../types/instructorApplication.type";
import { useSubmitInstructorApplication } from "../../hooks/useInstructorApplication";
import { useAuthContext } from "../../context/AuthContext";

const validationSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string(),
  bio: Yup.string()
    .min(50, "Bio must be at least 50 characters")
    .max(500, "Bio must not exceed 500 characters")
    .required("Bio is required"),
  expertise: Yup.array()
    .min(1, "Select at least one area of expertise")
    .max(10, "Select maximum 10 areas of expertise")
    .required("Areas of expertise are required"),
  experience: Yup.string()
    .min(100, "Experience description must be at least 100 characters")
    .max(1000, "Experience description must not exceed 1000 characters")
    .required("Experience is required"),
  education: Yup.string()
    .min(20, "Education must be at least 20 characters")
    .max(500, "Education must not exceed 500 characters")
    .required("Education is required"),
  motivation: Yup.string()
    .min(50, "Motivation must be at least 50 characters")
    .max(500, "Motivation must not exceed 500 characters")
    .required("Motivation is required"),
  sampleCourseTitle: Yup.string().max(
    100,
    "Course title must not exceed 100 characters"
  ),
  sampleCourseDescription: Yup.string().max(
    500,
    "Course description must not exceed 500 characters"
  ),
  portfolio: Yup.string().url("Please enter a valid URL"),
  linkedIn: Yup.string().url("Please enter a valid LinkedIn URL"),
  website: Yup.string().url("Please enter a valid website URL"),
});

const InstructorApplicationForm: React.FC = () => {
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
    validationSchema,
    onSubmit: async (values) => {
      try {
        await submitMutation.mutateAsync(values);
        navigate("/instructor-application-success");
      } catch (error) {
        console.error("Application submission failed:", error);
      }
    },
  });

  const handleExpertiseToggle = (expertise: string) => {
    const currentExpertise = formik.values.expertise;
    const newExpertise = currentExpertise.includes(expertise)
      ? currentExpertise.filter((item) => item !== expertise)
      : [...currentExpertise, expertise];

    formik.setFieldValue("expertise", newExpertise);
  };

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

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaUser className="text-white text-2xl" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Personal Information
        </h2>
        <p className="text-gray-600">Let's start with your basic details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            value={formik.values.firstName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              formik.touched.firstName && formik.errors.firstName
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300"
            }`}
            placeholder="Enter your first name"
          />
          {formik.touched.firstName && formik.errors.firstName && (
            <p className="mt-1 text-sm text-red-600">
              {formik.errors.firstName}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            value={formik.values.lastName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              formik.touched.lastName && formik.errors.lastName
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300"
            }`}
            placeholder="Enter your last name"
          />
          {formik.touched.lastName && formik.errors.lastName && (
            <p className="mt-1 text-sm text-red-600">
              {formik.errors.lastName}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                formik.touched.email && formik.errors.email
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Enter your email address"
              disabled={!!user?.email}
            />
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          {formik.touched.email && formik.errors.email && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number (Optional)
          </label>
          <div className="relative">
            <input
              type="tel"
              name="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your phone number"
            />
            <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
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
          Teaching Profile
        </h2>
        <p className="text-gray-600">
          Tell us about yourself and your expertise
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio *
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
          placeholder="Write a compelling bio that highlights your teaching style, personality, and what makes you unique as an instructor..."
        />
        {formik.touched.bio && formik.errors.bio && (
          <p className="mt-1 text-sm text-red-600">{formik.errors.bio}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Areas of Expertise *
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

  const renderStep3 = () => (
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
          Background & Motivation
        </h2>
        <p className="text-gray-600">
          Share your experience and passion for teaching
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Professional Experience *
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
          placeholder="Describe your professional experience, including relevant work history, projects, achievements, and any teaching or training experience you may have..."
        />
        {formik.touched.experience && formik.errors.experience && (
          <p className="mt-1 text-sm text-red-600">
            {formik.errors.experience}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Education *
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
          placeholder="Describe your educational background, including degrees, certifications, relevant coursework, and any self-directed learning..."
        />
        {formik.touched.education && formik.errors.education && (
          <p className="mt-1 text-sm text-red-600">{formik.errors.education}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Teaching Motivation *
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
          placeholder="Why do you want to become an instructor? What drives your passion for teaching and sharing knowledge with others?"
        />
        {formik.touched.motivation && formik.errors.motivation && (
          <p className="mt-1 text-sm text-red-600">
            {formik.errors.motivation}
          </p>
        )}
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
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
          Additional Information
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
            Sample Course Title
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
            placeholder="e.g., Complete Python Programming for Beginners"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Portfolio URL
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
              placeholder="https://yourportfolio.com"
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
            LinkedIn Profile
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
              placeholder="https://linkedin.com/in/yourprofile"
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
            Personal Website
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
              placeholder="https://yourwebsite.com"
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
          Sample Course Description
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
          placeholder="Provide a brief description of a course you would like to create, including learning objectives and target audience..."
        />
      </div>
    </motion.div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Instructor Application
          </h1>
          <p className="text-xl text-gray-600">
            Join our community of expert instructors and start sharing your
            knowledge
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
              <span>Previous</span>
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
                <span>Next</span>
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
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <FaHeart />
                    <span>Submit Application</span>
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

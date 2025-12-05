import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
// @ts-ignore
import { useTranslation } from "react-i18next";
import {
  FaCheckCircle,
  FaEnvelope,
  FaClock,
  FaChalkboardTeacher,
  FaArrowRight,
  FaHome,
  FaBook,
  FaStar,
  FaUsers,
  FaTrophy,
  FaGraduationCap,
} from "react-icons/fa";
import { useAuthContext } from "../../context/AuthContext";

const InstructorApplicationSuccess: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/auth/login");
    }
  }, [user, navigate]);

  const nextSteps = [
    {
      icon: FaEnvelope,
      title: t("applicationSuccess.nextSteps.checkEmail.title"),
      description: t("applicationSuccess.nextSteps.checkEmail.description"),
      color: "blue",
    },
    {
      icon: FaClock,
      title: t("applicationSuccess.nextSteps.reviewProcess.title"),
      description: t("applicationSuccess.nextSteps.reviewProcess.description"),
      color: "orange",
    },
    {
      icon: FaChalkboardTeacher,
      title: t("applicationSuccess.nextSteps.getReady.title"),
      description: t("applicationSuccess.nextSteps.getReady.description"),
      color: "green",
    },
  ];

  const benefits = [
    {
      icon: FaUsers,
      title: t("applicationSuccess.tips.joinCommunity.title"),
      description: t("applicationSuccess.tips.joinCommunity.description"),
    },
    {
      icon: FaTrophy,
      title: t("applicationSuccess.tips.prepareCourse.title"),
      description: t("applicationSuccess.tips.prepareCourse.description"),
    },
    {
      icon: FaStar,
      title: t("applicationSuccess.tips.studyPlatform.title"),
      description: t("applicationSuccess.tips.studyPlatform.description"),
    },
    {
      icon: FaGraduationCap,
      title: "Make an Impact",
      description: "Help others achieve their learning goals",
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
            className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <FaCheckCircle className="text-white text-4xl" />
          </motion.div>

          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t("applicationSuccess.title")}
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Thank you,{" "}
            <span className="font-semibold text-gray-900">
              {user.firstName}
            </span>
            !
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            {t("applicationSuccess.message")}
          </p>
        </motion.div>

        {/* Application Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Application Status
              </h2>
              <p className="text-gray-600">
                We've received your application and it's now under review
              </p>
            </div>
            <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              Under Review
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nextSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                className={`p-6 rounded-xl border-2 ${
                  step.color === "blue"
                    ? "bg-blue-50 border-blue-200"
                    : step.color === "orange"
                    ? "bg-orange-50 border-orange-200"
                    : "bg-green-50 border-green-200"
                } hover:shadow-md transition-all duration-300`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                    step.color === "blue"
                      ? "bg-blue-500"
                      : step.color === "orange"
                      ? "bg-orange-500"
                      : "bg-green-500"
                  }`}
                >
                  <step.icon className="text-white text-xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* What Happens Next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-200"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t("applicationSuccess.nextSteps.title")}
          </h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Application Review
                </h3>
                <p className="text-gray-600">
                  Our team will carefully review your qualifications,
                  experience, and teaching materials within 3-5 business days.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Decision Notification
                </h3>
                <p className="text-gray-600">
                  You'll receive an email notification with our decision and any
                  feedback or next steps.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Welcome & Onboarding
                </h3>
                <p className="text-gray-600">
                  If approved, you'll get access to our instructor dashboard and
                  course creation tools.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Benefits Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 mb-12 text-white"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">
            What You'll Get as an Instructor
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
                className="flex items-start gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm"
              >
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <benefit.icon className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-white/80 text-sm">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            to="/"
            className="flex items-center gap-2 px-8 py-4 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold shadow-lg"
          >
            <FaHome className="text-lg" />
            {t("applicationSuccess.buttons.backToHome")}
          </Link>

          <Link
            to="/courses"
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg"
          >
            <FaBook className="text-lg" />
            {t("applicationSuccess.buttons.browseGourses")}
            <FaArrowRight className="text-sm" />
          </Link>
        </motion.div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-center mt-12 p-6 bg-gray-50 rounded-xl"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Questions?
          </h3>
          <p className="text-gray-600 mb-4">
            If you have any questions about your application or the instructor
            program, feel free to reach out to our support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
            >
              Contact Support
            </Link>
            <Link
              to="/become-instructor"
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
            >
              Learn More About Teaching
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InstructorApplicationSuccess;

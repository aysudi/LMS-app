import { useState } from "react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import {
  FaEnvelope,
  FaArrowLeft,
  FaGraduationCap,
  FaCheckCircle,
  FaPaperPlane,
  FaShieldAlt,
  FaClock,
  FaLockOpen,
  FaExclamationTriangle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useForgotPassword } from "../../hooks/useAuth";
import { forgotPasswordValidationSchema } from "../../validations/authValidation";
import { getErrorMessage } from "../../utils/errorUtils";
import Loading from "../../components/Common/Loading";
import { useToast } from "../../components/UI/ToastProvider";
import { generalToasts } from "../../utils/toastUtils";
// @ts-ignore
import { useTranslation } from "react-i18next";

type ForgotPasswordStatus = "idle" | "loading" | "success" | "error";

const ForgotPassword = () => {
  const [forgotPasswordStatus, setForgotPasswordStatus] =
    useState<ForgotPasswordStatus>("idle");
  const [submittedEmail, setSubmittedEmail] = useState("");

  const { showToast } = useToast();
  const forgotPasswordMutation = useForgotPassword();
  const { t } = useTranslation();

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: forgotPasswordValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setForgotPasswordStatus("loading");

        await forgotPasswordMutation.mutateAsync(values.email);

        setForgotPasswordStatus("success");
        setSubmittedEmail(values.email);

        showToast(
          generalToasts.success(
            t("auth.passwordResetEmailSent"),
            `📧 ${t("auth.passwordResetEmailSentDesc")}`
          )
        );
      } catch (error) {
        setForgotPasswordStatus("error");
        const errorMessage = getErrorMessage(error);

        showToast(
          generalToasts.error(
            t("auth.failedToSendReset"),
            `❌ ${t("auth.failedToSendResetDesc")}: ${errorMessage}`
          )
        );

        setTimeout(() => {
          setForgotPasswordStatus("idle");
        }, 3000);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleSendAnother = () => {
    setForgotPasswordStatus("idle");
    setSubmittedEmail("");
    formik.resetForm();
  };

  const getSubmitButtonContent = () => {
    switch (forgotPasswordStatus) {
      case "loading":
        return (
          <>
            <Loading variant="default" size="sm" message="" />
            <span>{t("auth.sending")}</span>
          </>
        );
      case "error":
        return (
          <>
            <FaExclamationTriangle className="text-sm" />
            <span>{t("auth.tryAgain")}</span>
          </>
        );
      default:
        return (
          <>
            <FaPaperPlane className="text-sm" />
            <span>{t("auth.sendResetLink")}</span>
          </>
        );
    }
  };

  const getSubmitButtonColor = () => {
    switch (forgotPasswordStatus) {
      case "loading":
        return "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700";
      case "error":
        return "from-red-500 to-red-600 hover:from-red-600 hover:to-red-700";
      default:
        return "from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700";
    }
  };

  const resetSteps = [
    {
      icon: FaEnvelope,
      title: t("auth.enterEmailStep"),
      description: t("auth.enterEmailDesc"),
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: FaPaperPlane,
      title: t("auth.checkInboxStep"),
      description: t("auth.checkInboxDesc"),
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: FaLockOpen,
      title: t("auth.resetPasswordStep"),
      description: t("auth.resetPasswordDesc"),
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-5xl mx-auto"
      >
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center space-x-3 mb-8">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl">
                  <FaGraduationCap className="text-3xl text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Skillify
                </h1>
              </div>

              <h2 className="text-3xl font-bold text-gray-800 leading-tight">
                {t("auth.forgotYourPassword")}
              </h2>

              <p className="text-lg text-gray-600 leading-relaxed">
                {t("auth.noWorries")}
              </p>

              {/* Reset Process Steps */}
              <div className="space-y-6 mt-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {t("auth.howItWorks")}
                </h3>
                {resetSteps.map((step, index) => {
                  const IconComponent = step.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                      className="flex items-start space-x-4"
                    >
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}
                      >
                        <IconComponent className="text-white text-lg" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-800">
                          {step.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {step.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Security Note */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mt-8">
                <div className="flex items-center space-x-3">
                  <FaShieldAlt className="text-green-600 text-lg" />
                  <div className="text-left">
                    <h4 className="font-semibold text-green-800">
                      {t("auth.secureProcess")}
                    </h4>
                    <p className="text-sm text-green-600">
                      {t("auth.resetLinksExpire")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Forgot Password Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
              {forgotPasswordStatus !== "success" ? (
                // Email Form
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaLockOpen className="text-2xl text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {t("auth.resetPassword")}
                    </h3>
                    <p className="text-gray-600">
                      {t("auth.enterRegisteredEmail")}
                    </p>
                  </div>

                  <form onSubmit={formik.handleSubmit} className="space-y-6">
                    {/* Email Input */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("common.email")}
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={formik.values.email}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                            formik.touched.email && formik.errors.email
                              ? "border-red-300 focus:ring-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder={t(
                            "auth.enterRegisteredEmailPlaceholder"
                          )}
                        />
                        <FaEnvelope
                          className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${
                            formik.touched.email && formik.errors.email
                              ? "text-red-400"
                              : "text-gray-400"
                          }`}
                        />
                      </div>

                      {formik.touched.email && formik.errors.email && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-sm text-red-600 flex items-center space-x-1"
                        >
                          <FaExclamationTriangle className="text-xs" />
                          <span>{formik.errors.email}</span>
                        </motion.div>
                      )}

                      {!formik.errors.email && (
                        <p className="text-xs text-gray-500 mt-2">
                          {t("auth.resetInstructions")}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{
                        scale: forgotPasswordStatus === "loading" ? 1 : 1.02,
                      }}
                      whileTap={{
                        scale: forgotPasswordStatus === "loading" ? 1 : 0.98,
                      }}
                      type="submit"
                      disabled={
                        formik.isSubmitting ||
                        forgotPasswordStatus === "loading" ||
                        !formik.values.email
                      }
                      className={`w-full bg-gradient-to-r ${getSubmitButtonColor()} disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform flex items-center justify-center space-x-2 cursor-pointer`}
                    >
                      {getSubmitButtonContent()}
                    </motion.button>

                    {/* Status Feedback */}
                    <AnimatePresence mode="wait">
                      {forgotPasswordStatus === "error" && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="bg-red-50 border border-red-200 rounded-xl p-4"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <FaExclamationTriangle className="text-red-500 text-lg" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-red-800">
                                {t("auth.failedToSendReset")}
                              </h4>
                              <p className="text-xs text-red-600 mt-1">
                                {t("auth.checkEmailTryAgain")}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Back to Login */}
                    <div className="text-center">
                      <Link
                        to="/auth/login"
                        className="inline-flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                      >
                        <FaArrowLeft className="text-sm" />
                        <span>{t("auth.backToLogin")}</span>
                      </Link>
                    </div>
                  </form>
                </>
              ) : (
                // Success Message
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center space-y-6"
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                    <FaCheckCircle className="text-3xl text-white" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {t("auth.checkYourEmailExclamation")}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t("auth.resetLinkSent")}
                    </p>
                    <p className="font-semibold text-indigo-600 text-lg">
                      {submittedEmail}
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <FaClock className="text-blue-500 mt-1" />
                      <div className="text-left">
                        <h4 className="font-semibold text-blue-800 text-sm">
                          {t("auth.importantNotes")}
                        </h4>
                        <ul className="text-xs text-blue-600 mt-2 space-y-1">
                          <li>{t("auth.checkSpamFolder")}</li>
                          <li>{t("auth.linkExpires")}</li>
                          <li>{t("auth.clickToReset")}</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSendAnother}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
                    >
                      {t("auth.sendAnotherEmail")}
                    </motion.button>

                    <Link
                      to="/auth/login"
                      className="block w-full text-center py-3 px-6 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200"
                    >
                      {t("auth.backToLogin")}
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* Help Section */}
              {forgotPasswordStatus !== "success" && (
                <div className="text-center mt-8 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">
                    {t("auth.stillHavingTrouble")}
                  </p>
                  <Link
                    to="/support"
                    className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
                  >
                    {t("auth.contactSupport")}
                  </Link>
                </div>
              )}

              {/* Register Link */}
              {forgotPasswordStatus !== "success" && (
                <div className="text-center mt-6">
                  <p className="text-gray-600">
                    {t("auth.dontHaveAccountCreate")}{" "}
                    <Link
                      to="/auth/register"
                      className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors duration-200"
                    >
                      {t("auth.createOneHere")}
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

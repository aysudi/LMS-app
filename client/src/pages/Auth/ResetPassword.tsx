import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useFormik } from "formik";
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGraduationCap,
  FaCheckCircle,
  FaExclamationTriangle,
  FaShieldAlt,
  FaArrowRight,
  FaArrowLeft,
  FaKey,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useResetPassword } from "../../hooks/useAuth";
import { resetPasswordValidationSchema } from "../../validations/authValidation";
import { getErrorMessage } from "../../utils/errorUtils";
import Loading from "../../components/Common/Loading";
import { useToast } from "../../components/UI/ToastProvider";
import { generalToasts } from "../../utils/toastUtils";
// @ts-ignore
import { useTranslation } from "react-i18next";

type ResetPasswordStatus =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "invalid-token";

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetStatus, setResetStatus] = useState<ResetPasswordStatus>("idle");
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const resetPasswordMutation = useResetPassword();
  const { t } = useTranslation();

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setResetStatus("invalid-token");
    }
  }, [token]);

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: resetPasswordValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      if (!token) {
        showToast(
          generalToasts.error(
            t("auth.invalidResetToken"),
            `❌ ${t("auth.invalidResetToken")}`
          )
        );
        return;
      }

      try {
        setResetStatus("loading");

        await resetPasswordMutation.mutateAsync({
          token,
          newPassword: values.password,
        });

        setResetStatus("success");

        showToast(
          generalToasts.success(
            t("auth.passwordResetSuccess"),
            `🎉 ${t("auth.passwordResetSuccessDesc")}`
          )
        );

        setTimeout(() => {
          navigate("/auth/login");
        }, 3000);
      } catch (error) {
        setResetStatus("error");
        const errorMessage = getErrorMessage(error);

        showToast(
          generalToasts.error(
            t("auth.failedPasswordReset"),
            `❌ ${t("auth.failedPasswordResetDesc")}: ${errorMessage}`
          )
        );

        setTimeout(() => {
          setResetStatus("idle");
        }, 3000);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const password = formik.values.password;
    let strength = 0;

    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;

    setPasswordStrength(Math.min(strength, 100));
  }, [formik.values.password]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return "bg-red-500";
    if (passwordStrength < 50) return "bg-orange-500";
    if (passwordStrength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return t("auth.weak");
    if (passwordStrength < 50) return t("auth.fair");
    if (passwordStrength < 75) return t("auth.good");
    return t("auth.strong");
  };

  const getSubmitButtonContent = () => {
    switch (resetStatus) {
      case "loading":
        return (
          <>
            <Loading variant="default" size="sm" message="" />
            <span>{t("auth.resettingPassword")}</span>
          </>
        );
      case "success":
        return (
          <>
            <FaCheckCircle className="text-sm" />
            <span>{t("auth.passwordResetSuccess")}!</span>
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
            <FaKey className="text-sm" />
            <span>{t("auth.resetPassword")}</span>
          </>
        );
    }
  };

  const getSubmitButtonColor = () => {
    switch (resetStatus) {
      case "loading":
        return "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700";
      case "success":
        return "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700";
      case "error":
        return "from-red-500 to-red-600 hover:from-red-600 hover:to-red-700";
      default:
        return "from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700";
    }
  };

  const securityFeatures = [
    {
      icon: FaShieldAlt,
      title: t("auth.secureReset"),
      description: t("auth.secureResetDesc"),
      color: "text-green-500",
    },
    {
      icon: FaKey,
      title: t("auth.oneTimeToken"),
      description: t("auth.oneTimeTokenDesc"),
      color: "text-blue-500",
    },
    {
      icon: FaCheckCircle,
      title: t("auth.instantAccess"),
      description: t("auth.instantAccessDesc"),
      color: "text-purple-500",
    },
  ];

  if (resetStatus === "invalid-token") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 sm:space-y-6 max-w-sm sm:max-w-md mx-auto"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
            <FaExclamationTriangle className="text-2xl sm:text-3xl text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            {t("auth.invalidResetLink")}
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            {t("auth.invalidResetLinkDesc")}
          </p>
          <div className="space-y-3">
            <Link
              to="/auth/forgot-password"
              className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium sm:font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              {t("auth.requestNewResetLink")}
            </Link>
            <Link
              to="/auth/login"
              className="block w-full text-center py-2.5 sm:py-3 px-4 sm:px-6 border border-gray-300 rounded-lg sm:rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 text-sm sm:text-base"
            >
              {t("auth.backToLogin")}
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-5xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-center">
          {/* Left Side - Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block order-2 lg:order-1"
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
                {t("auth.createNewPassword")}
              </h2>

              <p className="text-lg text-gray-600 leading-relaxed">
                {t("auth.chooseStrongPassword")}
              </p>

              {/* Security Features */}
              <div className="space-y-6 mt-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {t("auth.securityFeatures")}:
                </h3>
                {securityFeatures.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                      className="flex items-start space-x-4"
                    >
                      <div className="flex-shrink-0">
                        <IconComponent className={`text-lg ${feature.color}`} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-800">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Password Tips */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mt-8">
                <h4 className="font-semibold text-blue-800 mb-2">
                  {t("auth.passwordTips")}:
                </h4>
                <ul className="text-sm text-blue-600 space-y-1 text-left">
                  <li>• {t("auth.useAtLeast8Chars")}</li>
                  <li>• {t("auth.includeUpperLower")}</li>
                  <li>• {t("auth.addNumbersSpecialChars")}</li>
                  <li>• {t("auth.avoidCommonWords")}</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Reset Password Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full order-1 lg:order-2"
          >
            {/* Mobile Header - Only visible on mobile/tablet */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:hidden text-center mb-6 sm:mb-8"
            >
              <div className="flex items-center justify-center space-x-3 mb-4 sm:mb-6">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                  <FaGraduationCap className="text-xl sm:text-2xl text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Skillify
                </h1>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                {t("auth.createNewPassword")}
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                {t("auth.chooseStrongPassword")}
              </p>
            </motion.div>

            <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border border-white/20 p-4 sm:p-6 lg:p-8">
              {resetStatus !== "success" ? (
                <>
                  <div className="text-center mb-6 sm:mb-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <FaKey className="text-lg sm:text-2xl text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                      {t("auth.resetYourPassword")}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      {t("auth.enterNewPasswordDesc")}
                    </p>
                  </div>

                  <form
                    onSubmit={formik.handleSubmit}
                    className="space-y-4 sm:space-y-6"
                  >
                    {/* New Password */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("auth.newPassword")}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formik.values.password}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className={`w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm sm:text-base ${
                            formik.touched.password && formik.errors.password
                              ? "border-red-300 focus:ring-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder={t("auth.enterNewPasswordPlaceholder")}
                        />
                        <FaLock
                          className={`absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-xs sm:text-sm ${
                            formik.touched.password && formik.errors.password
                              ? "text-red-400"
                              : "text-gray-400"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                        >
                          {showPassword ? (
                            <FaEyeSlash className="text-xs sm:text-sm" />
                          ) : (
                            <FaEye className="text-xs sm:text-sm" />
                          )}
                        </button>
                      </div>

                      {formik.touched.password && formik.errors.password && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-xs sm:text-sm text-red-600 flex items-center space-x-1"
                        >
                          <FaExclamationTriangle className="text-xs" />
                          <span>{formik.errors.password}</span>
                        </motion.div>
                      )}

                      {/* Password Strength Indicator */}
                      {formik.values.password && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">
                              {t("auth.passwordStrength")}:
                            </span>
                            <span
                              className={`font-medium ${
                                passwordStrength < 50
                                  ? "text-red-600"
                                  : passwordStrength < 75
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              }`}
                            >
                              {getPasswordStrengthText()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                              style={{ width: `${passwordStrength}%` }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("auth.confirmNewPassword")}
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formik.values.confirmPassword}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                            formik.touched.confirmPassword &&
                            formik.errors.confirmPassword
                              ? "border-red-300 focus:ring-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder={t("auth.confirmNewPasswordPlaceholder")}
                        />
                        <FaLock
                          className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${
                            formik.touched.confirmPassword &&
                            formik.errors.confirmPassword
                              ? "text-red-400"
                              : "text-gray-400"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>

                      {formik.touched.confirmPassword &&
                        formik.errors.confirmPassword && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-sm text-red-600 flex items-center space-x-1"
                          >
                            <FaExclamationTriangle className="text-xs" />
                            <span>{formik.errors.confirmPassword}</span>
                          </motion.div>
                        )}

                      {/* Password Match Indicator */}
                      {formik.values.confirmPassword &&
                        formik.values.password && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-xs flex items-center space-x-1"
                          >
                            {formik.values.password ===
                            formik.values.confirmPassword ? (
                              <>
                                <FaCheckCircle className="text-green-500" />
                                <span className="text-green-600">
                                  {t("auth.passwordsMatch")}
                                </span>
                              </>
                            ) : (
                              <>
                                <FaExclamationTriangle className="text-red-500" />
                                <span className="text-red-600">
                                  {t("auth.passwordsDontMatch")}
                                </span>
                              </>
                            )}
                          </motion.div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{
                        scale: resetStatus === "loading" ? 1 : 1.02,
                      }}
                      whileTap={{ scale: resetStatus === "loading" ? 1 : 0.98 }}
                      type="submit"
                      disabled={
                        formik.isSubmitting ||
                        resetStatus === "loading" ||
                        !formik.isValid
                      }
                      className={`w-full bg-gradient-to-r ${getSubmitButtonColor()} disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform flex items-center justify-center space-x-2 cursor-pointer`}
                    >
                      {getSubmitButtonContent()}
                    </motion.button>

                    {/* Status Feedback */}
                    <AnimatePresence mode="wait">
                      {resetStatus === "error" && (
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
                                {t("auth.failedToResetPassword")}
                              </h4>
                              <p className="text-xs text-red-600 mt-1">
                                {t("auth.checkPasswordTryAgain")}
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
                      {t("auth.passwordResetSuccessfully")} 🎉
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t("auth.passwordUpdatedLoginDesc")}
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <FaShieldAlt className="text-green-500 text-lg" />
                      <div className="text-left">
                        <h4 className="text-sm font-medium text-green-800">
                          {t("auth.yourAccountSecure")}
                        </h4>
                        <p className="text-xs text-green-600 mt-1">
                          {t("auth.redirectingToLogin")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/auth/login")}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <span>{t("auth.loginNow")}</span>
                      <FaArrowRight className="text-sm" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Help Section */}
              {resetStatus !== "success" && (
                <div className="text-center mt-8 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">
                    {t("auth.havingTrouble")}?
                  </p>
                  <Link
                    to="/support"
                    className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
                  >
                    {t("auth.contactSupport")}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;

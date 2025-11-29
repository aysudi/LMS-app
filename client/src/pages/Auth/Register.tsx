import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaGithub,
  FaGraduationCap,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaHome,
  FaArrowLeft,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useRegister } from "../../hooks/useAuth";
import { registerValidationSchema } from "../../validations/registerValidation";
import { User } from "../../classes/User";
import { getErrorMessage } from "../../utils/errorUtils";
import { useToast } from "../../components/UI/ToastProvider";
import { generalToasts } from "../../utils/toastUtils";
// @ts-ignore
import { useTranslation } from "react-i18next";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      terms: false,
    },
    validationSchema: registerValidationSchema,
    onSubmit: async (values) => {
      try {
        setRegistrationStatus("loading");
        setErrorMessage("");

        const user = User.forRegistration({
          firstName: values.firstName,
          lastName: values.lastName,
          username: values.username,
          email: values.email,
          password: values.password,
        });

        const result = await registerMutation.mutateAsync({
          userData: {
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            password: values.password,
          },
        });

        setRegistrationStatus("success");
        setSuccessMessage(
          result.message ||
            "Account created successfully! Please check your email for verification."
        );

        showToast(
          generalToasts.success(
            "Registration successful!",
            "🎉 Account created successfully! Check your email for verification."
          )
        );

        setTimeout(() => {
          navigate("/auth/verify-email", {
            state: {
              email: values.email,
              fromRegistration: true,
            },
          });
        }, 2000);
      } catch (error) {
        setRegistrationStatus("error");
        const errorMsg = getErrorMessage(error);
        setErrorMessage(errorMsg);

        showToast(generalToasts.error("Registration failed", errorMsg));
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Back to Home Button - Responsive */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20"
      >
        <Link
          to="/"
          className="group flex items-center space-x-1 sm:space-x-2 bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-indigo-600 px-3 py-2 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <FaArrowLeft className="text-xs sm:text-sm group-hover:transform group-hover:-translate-x-1 transition-transform duration-200" />
          <FaHome className="text-xs sm:text-sm" />
          <span className="text-xs sm:text-sm font-medium hidden sm:inline">
            {t("common.home")}
          </span>
          <span className="text-xs font-medium sm:hidden">Home</span>
        </Link>
      </motion.div>
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-5xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-center">
          {/* Left Side - Branding */}
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
                {t("auth.startLearningJourney")}
              </h2>

              <p className="text-lg text-gray-600 leading-relaxed">
                {t("auth.joinCommunity")}
              </p>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="text-2xl font-bold text-indigo-600">10k+</div>
                  <div className="text-sm text-gray-600">
                    {t("auth.activeStudents")}
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="text-2xl font-bold text-purple-600">500+</div>
                  <div className="text-sm text-gray-600">
                    {t("auth.expertInstructors")}
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="text-2xl font-bold text-green-600">1000+</div>
                  <div className="text-sm text-gray-600">
                    {t("auth.coursesAvailable")}
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="text-2xl font-bold text-orange-600">95%</div>
                  <div className="text-sm text-gray-600">
                    {t("auth.successRate")}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Registration Form */}
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
                {t("auth.startLearningJourney")}
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                {t("auth.joinCommunity")}
              </p>
            </motion.div>

            <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border border-white/20 p-4 sm:p-6 lg:p-8">
              {/* Desktop Header - Only visible on desktop */}
              <div className="hidden lg:block text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {t("auth.createAccount")}
                </h3>
                <p className="text-gray-600">{t("auth.enterDetails")}</p>
              </div>

              {/* Status Indicators */}
              <AnimatePresence>
                {registrationStatus === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl"
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="flex-shrink-0">
                        <FaCheckCircle className="text-green-500 text-sm sm:text-xl" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-green-800">
                          {t("auth.registerSuccess")} 🎉
                        </h4>
                        <p className="text-xs sm:text-sm text-green-600 mt-1">
                          {successMessage}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {registrationStatus === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl"
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="flex-shrink-0">
                        <FaExclamationTriangle className="text-red-500 text-sm sm:text-xl" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-red-800">
                          {t("auth.registrationFailed")}
                        </h4>
                        <p className="text-xs sm:text-sm text-red-600 mt-1">
                          {errorMessage}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Loading Progress Indicator */}
              <AnimatePresence>
                {registrationStatus === "loading" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 sm:mb-6"
                  >
                    <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <FaSpinner className="animate-spin text-blue-500 text-sm sm:text-lg" />
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold text-blue-800">
                            Creating your account...
                          </h4>
                          <p className="text-xs sm:text-sm text-blue-600 mt-1">
                            Please wait while we set up your Skillify account.
                          </p>
                        </div>
                      </div>
                      {/* Progress bar animation */}
                      <div className="mt-2 sm:mt-3">
                        <div className="w-full bg-blue-200 rounded-full h-1.5 sm:h-2">
                          <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 3, ease: "easeInOut" }}
                            className="bg-blue-500 h-1.5 sm:h-2 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form
                onSubmit={formik.handleSubmit}
                className="space-y-4 sm:space-y-6"
              >
                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("common.firstName")}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="firstName"
                        value={formik.values.firstName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm sm:text-base ${
                          formik.touched.firstName && formik.errors.firstName
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder={t("auth.firstNamePlaceholder")}
                      />
                      <FaUser className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                    </div>
                    {formik.touched.firstName && formik.errors.firstName && (
                      <div className="mt-1 text-xs sm:text-sm text-red-600">
                        {formik.errors.firstName}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("common.lastName")}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="lastName"
                        value={formik.values.lastName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm sm:text-base ${
                          formik.touched.lastName && formik.errors.lastName
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder={t("auth.lastNamePlaceholder")}
                      />
                      <FaUser className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                    </div>
                    {formik.touched.lastName && formik.errors.lastName && (
                      <div className="mt-1 text-xs sm:text-sm text-red-600">
                        {formik.errors.lastName}
                      </div>
                    )}
                  </div>
                </div>

                {/* Username */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("common.username")}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="username"
                      value={formik.values.username}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm sm:text-base ${
                        formik.touched.username && formik.errors.username
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder={t("auth.usernamePlaceholder")}
                    />
                    <FaUser className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                  </div>
                  {formik.touched.username && formik.errors.username && (
                    <div className="mt-1 text-xs sm:text-sm text-red-600">
                      {formik.errors.username}
                    </div>
                  )}
                </div>

                {/* Email */}
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
                      className={`w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm sm:text-base ${
                        formik.touched.email && formik.errors.email
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder={t("auth.emailPlaceholder")}
                    />
                    <FaEnvelope className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                  </div>
                  {formik.touched.email && formik.errors.email && (
                    <div className="mt-1 text-xs sm:text-sm text-red-600">
                      {formik.errors.email}
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("common.password")}
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
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder={t("auth.passwordPlaceholder")}
                    />
                    <FaLock className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
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
                    <div className="mt-1 text-xs sm:text-sm text-red-600">
                      {formik.errors.password}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    {t("auth.passwordRequirement")}
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    name="terms"
                    checked={formik.values.terms}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="mt-0.5 sm:mt-1 w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                  />
                  <label
                    htmlFor="terms"
                    className="text-xs sm:text-sm text-gray-600"
                  >
                    {t("auth.agreeToTerms")}{" "}
                    <Link
                      to="/terms"
                      className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      {t("auth.termsOfService")}
                    </Link>{" "}
                    {t("common.and")}{" "}
                    <Link
                      to="/privacy"
                      className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      {t("auth.privacyPolicy")}
                    </Link>
                  </label>
                </div>
                {formik.touched.terms && formik.errors.terms && (
                  <div className="text-xs sm:text-sm text-red-600">
                    {formik.errors.terms}
                  </div>
                )}

                {/* Submit Button */}
                <motion.button
                  whileHover={{
                    scale: registrationStatus === "loading" ? 1 : 1.02,
                  }}
                  whileTap={{
                    scale: registrationStatus === "loading" ? 1 : 0.98,
                  }}
                  type="submit"
                  disabled={
                    registerMutation.isPending ||
                    !formik.isValid ||
                    registrationStatus === "loading"
                  }
                  className={`w-full font-medium sm:font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all duration-200 shadow-lg transform flex items-center justify-center space-x-2 cursor-pointer text-sm sm:text-base ${
                    registrationStatus === "success"
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : registrationStatus === "loading"
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : registrationStatus === "error"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white hover:shadow-xl"
                  } ${
                    (registerMutation.isPending ||
                      !formik.isValid ||
                      registrationStatus === "loading") &&
                    registrationStatus !== "success"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {registrationStatus === "loading" && (
                    <FaSpinner className="animate-spin text-sm sm:text-lg" />
                  )}
                  {registrationStatus === "success" && (
                    <FaCheckCircle className="text-sm sm:text-lg" />
                  )}
                  <span>
                    {registrationStatus === "loading"
                      ? t("auth.creatingAccount")
                      : registrationStatus === "success"
                      ? t("auth.accountCreatedRedirecting")
                      : t("auth.createAccount")}
                  </span>
                </motion.button>

                {/* Divider */}
                <div className="relative my-4 sm:my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-xs sm:text-sm">
                    <span className="px-3 sm:px-4 bg-white text-gray-500">
                      {t("auth.orContinueWith")}
                    </span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      window.location.href =
                        "http://localhost:4040/auth/google";
                    }}
                    className="flex items-center justify-center px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer text-sm sm:text-base"
                  >
                    <FaGoogle className="text-red-500 mr-2 text-sm sm:text-base" />
                    Google
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      window.location.href =
                        "http://localhost:4040/auth/github";
                    }}
                    className="flex items-center justify-center px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer text-sm sm:text-base"
                  >
                    <FaGithub className="text-gray-800 mr-2 text-sm sm:text-base" />
                    GitHub
                  </motion.button>
                </div>
              </form>

              {/* Login Link */}
              <div className="text-center mt-6 sm:mt-8">
                <p className="text-sm sm:text-base text-gray-600">
                  {t("auth.alreadyHaveAccount")}{" "}
                  <Link
                    to="/auth/login"
                    className="text-indigo-600 hover:text-indigo-700 font-medium sm:font-semibold transition-colors duration-200"
                  >
                    {t("auth.signInHere")}
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useFormik } from "formik";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaGithub,
  FaGraduationCap,
  FaArrowRight,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHome,
  FaArrowLeft,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useLogin } from "../../hooks/useAuth";
import { useAuthContext } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/errorUtils";
import loginValidationSchema from "../../validations/loginValidation";
import Loading from "../../components/Common/Loading";
import { useToast } from "../../components/UI/ToastProvider";
import { generalToasts } from "../../utils/toastUtils";
// @ts-ignore
import { useTranslation } from "react-i18next";

type LoginStatus = "idle" | "loading" | "success" | "error";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginStatus, setLoginStatus] = useState<LoginStatus>("idle");

  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { refetchUser } = useAuthContext();
  const loginMutation = useLogin();
  const { t } = useTranslation();

  useEffect(() => {
    const { fromVerification, message } = location.state || {};
    if (fromVerification && message) {
      showToast(generalToasts.success("Email Verified", message));
      navigate("/auth/login", { replace: true });
    }
  }, [location.state, showToast, navigate]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setLoginStatus("loading");

        const result = await loginMutation.mutateAsync(values);

        await new Promise((resolve) => setTimeout(resolve, 300));

        await refetchUser();

        setLoginStatus("success");

        showToast(
          generalToasts.success(
            t("auth.welcomeBack"),
            `🎉 ${t("auth.welcomeBack")}, ${result.data.user.firstName}!`
          )
        );

        setTimeout(() => {
          const user = result.data.user;
          if (user.role === "admin") {
            navigate("/admin/dashboard", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        }, 300); // Reduced delay for faster redirect

        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
          localStorage.setItem("userEmail", values.email);
        } else {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("userEmail");
        }

        if (!result.data.user.isEmailVerified) {
          showToast(
            generalToasts.info(
              "Email Verification Required",
              "📧 Please verify your email to access all features"
            )
          );
        }
      } catch (error) {
        setLoginStatus("error");
        const errorMessage = getErrorMessage(error);
        showToast(generalToasts.error("Login Failed", errorMessage));

        setTimeout(() => {
          setLoginStatus("idle");
        }, 3000);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("userEmail");
    const shouldRemember = localStorage.getItem("rememberMe") === "true";

    if (shouldRemember && rememberedEmail) {
      formik.setFieldValue("email", rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const getSubmitButtonContent = () => {
    switch (loginStatus) {
      case "loading":
        return (
          <>
            <Loading message={t("auth.signIn") + "..."} />
          </>
        );
      case "success":
        return (
          <>
            <FaCheckCircle className="text-sm" />
            <span>{t("auth.welcomeBack")}!</span>
          </>
        );
      case "error":
        return (
          <>
            <FaExclamationTriangle className="text-sm" />
            <span>{t("errors.tryAgain")}</span>
          </>
        );
      default:
        return (
          <>
            <span>{t("auth.signIn")}</span>
            <FaArrowRight className="text-sm" />
          </>
        );
    }
  };

  const getSubmitButtonColor = () => {
    switch (loginStatus) {
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

  const features = [
    {
      icon: FaCheckCircle,
      text: t("course.fullVideoLectures", { count: "1000+" }),
      color: "text-green-500",
    },
    {
      icon: FaCheckCircle,
      text: t("course.aboutInstructor"),
      color: "text-blue-500",
    },
    {
      icon: FaCheckCircle,
      text: t("course.certificateCompletion"),
      color: "text-purple-500",
    },
    {
      icon: FaCheckCircle,
      text: t("common.students"),
      color: "text-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Back to Home Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-6 left-6 z-20"
      >
        <Link
          to="/"
          className="group flex items-center space-x-2 bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <FaArrowLeft className="text-sm group-hover:transform group-hover:-translate-x-1 transition-transform duration-200" />
          <FaHome className="text-sm" />
          <span className="text-sm font-medium">{t("auth.backToHome")}</span>
        </Link>
      </motion.div>
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
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Welcome Back */}
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
                {t("auth.welcomeBack")} {t("common.myLearning")}
              </h2>

              <p className="text-lg text-gray-600 leading-relaxed">
                {t("auth.continueLearning")}
              </p>

              {/* Features List */}
              <div className="space-y-4 mt-8">
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                      className="flex items-center space-x-3 text-left"
                    >
                      <IconComponent className={`text-lg ${feature.color}`} />
                      <span className="text-gray-700">{feature.text}</span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="text-2xl font-bold text-indigo-600">98%</div>
                  <div className="text-sm text-gray-600">
                    {t("auth.successRate")}
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="text-2xl font-bold text-purple-600">24/7</div>
                  <div className="text-sm text-gray-600">
                    {t("common.support")}
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="text-2xl font-bold text-green-600">
                    {t("common.free")}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t("navigation.certificates")}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {t("auth.welcomeBack")}!
                </h3>
                <p className="text-gray-600">
                  {t("auth.signIn")} {t("auth.continueToLearning")}
                </p>
              </div>

              <form onSubmit={formik.handleSubmit} className="space-y-6">
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
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                        formik.touched.email && formik.errors.email
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder={t("auth.enterEmail")}
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
                      className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                        formik.touched.password && formik.errors.password
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder={t("auth.enterPassword")}
                    />
                    <FaLock
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${
                        formik.touched.password && formik.errors.password
                          ? "text-red-400"
                          : "text-gray-400"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600 flex items-center space-x-1"
                    >
                      <FaExclamationTriangle className="text-xs" />
                      <span>{formik.errors.password}</span>
                    </motion.div>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                    />
                    <label htmlFor="remember" className="text-sm text-gray-600">
                      {t("auth.rememberMe")}
                    </label>
                  </div>

                  <Link
                    to="/auth/forgot-password"
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
                  >
                    {t("auth.forgotPassword")}
                  </Link>
                </div>

                {/* Login Button */}
                <motion.button
                  whileHover={{ scale: loginStatus === "loading" ? 1 : 1.02 }}
                  whileTap={{ scale: loginStatus === "loading" ? 1 : 0.98 }}
                  type="submit"
                  disabled={formik.isSubmitting || loginStatus === "loading"}
                  className={`w-full bg-gradient-to-r ${getSubmitButtonColor()} disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform flex items-center justify-center space-x-2 cursor-pointer`}
                >
                  {getSubmitButtonContent()}
                </motion.button>

                {/* Status Feedback */}
                <AnimatePresence mode="wait">
                  {loginStatus === "success" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-green-50 border border-green-200 rounded-xl p-4"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <FaCheckCircle className="text-green-500 text-lg" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-green-800">
                            {t("auth.loginSuccess")}! 🎉
                          </h4>
                          <p className="text-xs text-green-600 mt-1">
                            {t("auth.redirectingToDashboard")}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {loginStatus === "error" && (
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
                            {t("auth.loginFailed")}
                          </h4>
                          <p className="text-xs text-red-600 mt-1">
                            {t("auth.checkCredentialsTryAgain")}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">
                      {t("auth.orContinueWith")}
                    </span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      window.location.href =
                        "http://localhost:4040/auth/google";
                    }}
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <FaGoogle className="text-red-500 mr-2" />
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
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <FaGithub className="text-gray-800 mr-2" />
                    GitHub
                  </motion.button>
                </div>

                {/* Account Verification Notice */}
                {loginStatus !== "success" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
                    <div className="flex items-start space-x-3">
                      <div className="text-blue-500 mt-1">
                        <FaCheckCircle />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-blue-800">
                          {t("auth.emailVerificationRequired")}
                        </h4>
                        <p className="text-xs text-blue-600 mt-1">
                          {t("auth.emailVerificationNotice")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </form>

              {/* Register Link */}
              <div className="text-center mt-8">
                <p className="text-gray-600">
                  {t("auth.dontHaveAccount")}{" "}
                  <Link
                    to="/auth/register"
                    className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors duration-200"
                  >
                    {t("auth.createAccount")}
                  </Link>
                </p>
              </div>

              {/* Help Section */}
              <div className="text-center mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  {t("auth.needHelpContact")}{" "}
                  <Link
                    to="/support"
                    className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
                  >
                    {t("auth.supportTeam")}
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

export default Login;

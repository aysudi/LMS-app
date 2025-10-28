import { useState, useEffect, useRef } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaGraduationCap,
  FaEnvelope,
  FaRedo,
  FaArrowLeft,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import {
  useVerifyEmail,
  useResendVerificationEmail,
} from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/errorUtils";
import Loading from "../../components/Common/Loading";
import { useToast } from "../../components/UI/ToastProvider";
import { generalToasts } from "../../utils/toastUtils";
// @ts-ignore
import { useTranslation } from "react-i18next";

type VerificationStatus =
  | "loading"
  | "success"
  | "error"
  | "invalid-token"
  | "awaiting-verification";

const VerifyEmail = () => {
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>("loading");
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [showResendForm, setShowResendForm] = useState(false);
  const verificationAttempted = useRef(false);

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const verifyEmailMutation = useVerifyEmail();
  const resendVerificationMutation = useResendVerificationEmail();

  useEffect(() => {
    const token = searchParams.get("token");
    const { email, fromRegistration } = location.state || {};

    if (!token) {
      if (fromRegistration) {
        setVerificationStatus("awaiting-verification");
        setMessage(t("auth.verificationEmailSentToInbox"));
        setResendEmail(email || "");
      } else {
        setVerificationStatus("invalid-token");
        setMessage(t("auth.noVerificationToken"));
      }
      return;
    }

    if (!verificationAttempted.current) {
      verificationAttempted.current = true;
      verifyToken(token);
    }
  }, [searchParams, location.state]);

  const verifyToken = async (token: string) => {
    if (verifyEmailMutation.isPending || verificationStatus === "success") {
      return;
    }

    try {
      setVerificationStatus("loading");
      const result = await verifyEmailMutation.mutateAsync(token);
      console.log(result);

      setVerificationStatus("success");
      setMessage(result.message || t("auth.emailVerifiedCanLogin"));

      showToast(
        generalToasts.success(
          t("auth.emailVerifiedSuccess"),
          `🎉 ${t("auth.emailVerifiedSuccessDesc")}`
        )
      );

      setTimeout(() => {
        navigate("/auth/login", {
          state: {
            fromVerification: true,
            message: t("auth.emailVerifiedLoginToContinue"),
          },
        });
      }, 3000);
    } catch (error) {
      setVerificationStatus("error");
      const errorMsg = getErrorMessage(error);
      setMessage(errorMsg);

      showToast(
        generalToasts.error(
          t("auth.verificationFailed"),
          `❌ ${t("auth.verificationFailedDesc")}: ${errorMsg}`
        )
      );
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resendEmail) {
      showToast(
        generalToasts.warning(
          t("auth.enterEmailRequired"),
          t("auth.enterEmailRequired")
        )
      );
      return;
    }

    try {
      await resendVerificationMutation.mutateAsync(resendEmail);

      showToast(
        generalToasts.success(
          t("auth.verificationEmailSent"),
          `📧 ${t("auth.verificationEmailSentDesc")}`
        )
      );

      setShowResendForm(false);
      setResendEmail("");
    } catch (error) {
      showToast(
        generalToasts.error(
          t("auth.failedToResend"),
          `❌ ${t("auth.failedToResendDesc")}: ${getErrorMessage(error)}`
        )
      );
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case "loading":
        return (
          <Loading
            variant="default"
            size="lg"
            message={t("auth.verifyingEmail")}
          />
        );
      case "success":
        return <FaCheckCircle className="text-4xl text-green-500" />;
      case "awaiting-verification":
        return <FaEnvelope className="text-4xl text-indigo-500" />;
      case "error":
      case "invalid-token":
        return <FaExclamationTriangle className="text-4xl text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case "loading":
        return "from-blue-500 to-cyan-500";
      case "success":
        return "from-green-500 to-emerald-500";
      case "awaiting-verification":
        return "from-blue-500 to-indigo-500";
      case "error":
      case "invalid-token":
        return "from-red-500 to-pink-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
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
        className="relative z-10 w-full max-w-2xl mx-auto"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl">
                <FaGraduationCap className="text-2xl text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Skillify
              </h1>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {t("auth.emailVerification")}
            </h2>
          </div>

          {/* Status Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={verificationStatus}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              {/* Status Icon */}
              <div className="flex justify-center mb-6">
                <div
                  className={`w-20 h-20 rounded-full bg-gradient-to-r ${getStatusColor()} flex items-center justify-center shadow-lg`}
                >
                  {getStatusIcon()}
                </div>
              </div>

              {/* Status Message */}
              <div className="space-y-4 mb-8">
                <h3 className="text-xl font-semibold text-gray-800">
                  {verificationStatus === "loading" &&
                    t("auth.verifyingYourEmail")}
                  {verificationStatus === "success" &&
                    `${t("auth.emailVerifiedSuccessfully")} 🎉`}
                  {verificationStatus === "awaiting-verification" &&
                    `${t("auth.checkYourEmail")} 📧`}
                  {verificationStatus === "error" &&
                    t("auth.verificationFailed")}
                  {verificationStatus === "invalid-token" &&
                    t("auth.invalidVerificationLink")}
                </h3>

                <p className="text-gray-600 leading-relaxed">{message}</p>

                {verificationStatus === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4"
                  >
                    <p className="text-sm text-green-700">
                      🎊 {t("auth.welcomeToSkillify")}{" "}
                      {t("auth.redirectingToLoginPage")}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {verificationStatus === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="space-y-3"
                  >
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {t("auth.goToLogin")}
                    </button>
                    <Link
                      to="/auth/login"
                      className="block w-full text-center py-3 px-6 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200"
                    >
                      {t("auth.signIn")}
                    </Link>
                  </motion.div>
                )}

                {verificationStatus === "awaiting-verification" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-3"
                  >
                    <Link
                      to="/auth/login"
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                    >
                      <span>{t("auth.verifiedEmailSignIn")}</span>
                    </Link>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-sm text-blue-700">
                        💡 <strong>{t("auth.tip")}:</strong>{" "}
                        {t("auth.cantFindEmailTip")}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowResendForm(true)}
                      className="w-full py-3 px-6 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <FaRedo className="text-sm" />
                      <span>{t("auth.resendVerificationEmail")}</span>
                    </button>
                  </motion.div>
                )}

                {(verificationStatus === "error" ||
                  verificationStatus === "invalid-token") && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-3"
                  >
                    {!showResendForm ? (
                      <>
                        <button
                          onClick={() => setShowResendForm(true)}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                        >
                          <FaRedo className="text-sm" />
                          <span>{t("auth.resendVerificationEmail")}</span>
                        </button>
                        <Link
                          to="/auth/login"
                          className="block w-full text-center py-3 px-6 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200"
                        >
                          {t("auth.backToLogin")}
                        </Link>
                      </>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-4"
                      >
                        <form
                          onSubmit={handleResendVerification}
                          className="space-y-4"
                        >
                          <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {t("auth.emailAddress")}
                            </label>
                            <div className="relative">
                              <input
                                type="email"
                                value={resendEmail}
                                onChange={(e) => setResendEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                                placeholder={t("auth.enterYourEmailAddress")}
                                required
                              />
                              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                            </div>
                          </div>

                          <div className="flex space-x-3">
                            <button
                              type="submit"
                              disabled={resendVerificationMutation.isPending}
                              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                            >
                              {resendVerificationMutation.isPending ? (
                                <>
                                  <Loading
                                    variant="default"
                                    size="sm"
                                    message=""
                                  />
                                  <span>{t("auth.sending")}</span>
                                </>
                              ) : (
                                <>
                                  <FaEnvelope className="text-sm" />
                                  <span>{t("auth.sendEmail")}</span>
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowResendForm(false)}
                              className="px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200"
                            >
                              {t("common.cancel")}
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Help Section */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              {t("auth.havingTrouble")}?
            </p>
            <div className="flex justify-center space-x-4 text-sm">
              <Link
                to="/auth/login"
                className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200 flex items-center space-x-1"
              >
                <FaArrowLeft className="text-xs" />
                <span>{t("auth.backToLogin")}</span>
              </Link>
              <Link
                to="/support"
                className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
              >
                {t("auth.contactSupport")}
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;

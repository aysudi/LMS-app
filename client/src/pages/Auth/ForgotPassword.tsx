import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaEnvelope,
  FaArrowLeft,
  FaGraduationCap,
  FaCheckCircle,
  FaPaperPlane,
  FaShieldAlt,
  FaClock,
  FaLockOpen,
} from "react-icons/fa";
import { motion } from "framer-motion";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  const resetSteps = [
    {
      icon: FaEnvelope,
      title: "Enter Email",
      description: "Provide your registered email address",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: FaPaperPlane,
      title: "Check Inbox",
      description: "We'll send you a secure reset link",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: FaLockOpen,
      title: "Reset Password",
      description: "Create a new strong password",
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
                Forgot Your Password?
              </h2>

              <p className="text-lg text-gray-600 leading-relaxed">
                No worries! It happens to the best of us. We'll help you get
                back to learning in no time.
              </p>

              {/* Reset Process Steps */}
              <div className="space-y-6 mt-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  How it works:
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
                      Secure Process
                    </h4>
                    <p className="text-sm text-green-600">
                      Reset links expire in 1 hour for your security
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
              {!isSubmitted ? (
                // Email Form
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaLockOpen className="text-2xl text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      Reset Password
                    </h3>
                    <p className="text-gray-600">
                      Enter your email address and we'll send you a link to
                      reset your password.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Input */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                          placeholder="Enter your registered email"
                          required
                        />
                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        We'll send reset instructions to this email address
                      </p>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading || !email}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform flex items-center justify-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <FaPaperPlane className="text-sm" />
                          <span>Send Reset Link</span>
                        </>
                      )}
                    </motion.button>

                    {/* Back to Login */}
                    <div className="text-center">
                      <Link
                        to="/login"
                        className="inline-flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                      >
                        <FaArrowLeft className="text-sm" />
                        <span>Back to Login</span>
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
                      Check Your Email!
                    </h3>
                    <p className="text-gray-600 mb-4">
                      We've sent a password reset link to:
                    </p>
                    <p className="font-semibold text-indigo-600 text-lg">
                      {email}
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <FaClock className="text-blue-500 mt-1" />
                      <div className="text-left">
                        <h4 className="font-semibold text-blue-800 text-sm">
                          Important Notes:
                        </h4>
                        <ul className="text-xs text-blue-600 mt-2 space-y-1">
                          <li>
                            • Check your spam/junk folder if you don't see the
                            email
                          </li>
                          <li>• The reset link will expire in 1 hour</li>
                          <li>• Click the link to create a new password</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsSubmitted(false);
                        setEmail("");
                      }}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Send Another Email
                    </motion.button>

                    <Link
                      to="/login"
                      className="block w-full text-center py-3 px-6 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200"
                    >
                      Back to Login
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* Help Section */}
              {!isSubmitted && (
                <div className="text-center mt-8 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">
                    Still having trouble?
                  </p>
                  <Link
                    to="/support"
                    className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
                  >
                    Contact Support
                  </Link>
                </div>
              )}

              {/* Register Link */}
              {!isSubmitted && (
                <div className="text-center mt-6">
                  <p className="text-gray-600">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors duration-200"
                    >
                      Create one here
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

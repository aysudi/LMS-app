import { useState } from "react";
import { Link } from "react-router-dom";
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
} from "react-icons/fa";
import { motion } from "framer-motion";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const features = [
    {
      icon: FaCheckCircle,
      text: "Access to 1000+ premium courses",
      color: "text-green-500",
    },
    {
      icon: FaCheckCircle,
      text: "Learn from expert instructors",
      color: "text-blue-500",
    },
    {
      icon: FaCheckCircle,
      text: "Get certificates upon completion",
      color: "text-purple-500",
    },
    {
      icon: FaCheckCircle,
      text: "Join a community of learners",
      color: "text-orange-500",
    },
  ];

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
                Welcome Back to Your Learning Journey
              </h2>

              <p className="text-lg text-gray-600 leading-relaxed">
                Continue where you left off and explore new skills. Your
                personalized learning experience awaits.
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
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="text-2xl font-bold text-purple-600">24/7</div>
                  <div className="text-sm text-gray-600">Support</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="text-2xl font-bold text-green-600">Free</div>
                  <div className="text-sm text-gray-600">Certificates</div>
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
                  Welcome Back!
                </h3>
                <p className="text-gray-600">
                  Sign in to continue your learning journey
                </p>
              </div>

              <form className="space-y-6">
                {/* Email */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Enter your email"
                    />
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  </div>
                </div>

                {/* Password */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Enter your password"
                    />
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
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
                      Remember me
                    </label>
                  </div>

                  <Link
                    to="/auth/forgot-password"
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Login Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform flex items-center justify-center space-x-2"
                >
                  <span>Sign In</span>
                  <FaArrowRight className="text-sm" />
                </motion.button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <FaGoogle className="text-red-500 mr-2" />
                    Google
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <FaGithub className="text-gray-800 mr-2" />
                    GitHub
                  </motion.button>
                </div>

                {/* Account Verification Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
                  <div className="flex items-start space-x-3">
                    <div className="text-blue-500 mt-1">
                      <FaCheckCircle />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">
                        Email Verification Required
                      </h4>
                      <p className="text-xs text-blue-600 mt-1">
                        If you haven't verified your email yet, check your inbox
                        for a verification link.
                      </p>
                    </div>
                  </div>
                </div>
              </form>

              {/* Register Link */}
              <div className="text-center mt-8">
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

              {/* Help Section */}
              <div className="text-center mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Need help? Contact our{" "}
                  <Link
                    to="/support"
                    className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
                  >
                    support team
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

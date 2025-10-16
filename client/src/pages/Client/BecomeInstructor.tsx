import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaChalkboardTeacher,
  FaDollarSign,
  FaGlobeAmericas,
  FaClock,
  FaTrophy,
  FaHeart,
  FaArrowRight,
  FaCheckCircle,
  FaUsers,
  FaChartLine,
  FaCertificate,
  FaRocket,
  FaLightbulb,
  FaGraduationCap,
} from "react-icons/fa";
import { useAuthContext } from "../../context/AuthContext";
import { useMyInstructorApplication } from "../../hooks/useInstructorApplication";

const BecomeInstructor: React.FC = () => {
  const { user, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const { data: existingApplication, isLoading } = useMyInstructorApplication();

  const benefits = [
    {
      icon: FaDollarSign,
      title: "Earn Money Teaching",
      description:
        "Generate passive income by sharing your expertise with students worldwide",
      color: "from-green-500 to-emerald-600",
      stat: "Up to 70% revenue share",
    },
    {
      icon: FaGlobeAmericas,
      title: "Global Reach",
      description:
        "Connect with students from around the world and build an international audience",
      color: "from-blue-500 to-cyan-600",
      stat: "190+ countries",
    },
    {
      icon: FaClock,
      title: "Flexible Schedule",
      description: "Create courses on your own time and work at your own pace",
      color: "from-purple-500 to-violet-600",
      stat: "24/7 availability",
    },
    {
      icon: FaTrophy,
      title: "Build Your Brand",
      description:
        "Establish yourself as an expert and grow your professional reputation",
      color: "from-orange-500 to-red-600",
      stat: "Expert recognition",
    },
    {
      icon: FaHeart,
      title: "Make an Impact",
      description: "Help others learn new skills and advance their careers",
      color: "from-pink-500 to-rose-600",
      stat: "Change lives",
    },
    {
      icon: FaChartLine,
      title: "Analytics & Insights",
      description:
        "Track your performance with detailed analytics and student feedback",
      color: "from-indigo-500 to-purple-600",
      stat: "Real-time data",
    },
  ];

  const features = [
    {
      icon: FaRocket,
      title: "Easy Course Creation",
      description: "Intuitive tools to create engaging video courses",
    },
    {
      icon: FaUsers,
      title: "Student Community",
      description: "Build a community of learners around your content",
    },
    {
      icon: FaCertificate,
      title: "Certification Tools",
      description: "Provide certificates to students upon completion",
    },
    {
      icon: FaLightbulb,
      title: "Marketing Support",
      description: "We help promote your courses to the right audience",
    },
  ];

  const stats = [
    { number: "50K+", label: "Active Students" },
    { number: "10K+", label: "Instructors Earning" },
    { number: "$2M+", label: "Paid to Instructors" },
    { number: "95%", label: "Satisfaction Rate" },
  ];

  const requirements = [
    "Expertise in a subject area",
    "Passion for teaching and helping others",
    "Basic computer and internet skills",
    "Commitment to creating quality content",
    "Professional communication skills",
  ];

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }

    if (user?.role === "instructor") {
      navigate("/instructor/dashboard");
      return;
    }

    if (existingApplication) {
      // User already has an application
      navigate("/instructor-application-status");
      return;
    }

    navigate("/become-instructor/apply");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
              Become an Instructor
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Share your expertise, inspire students worldwide, and build a
              rewarding teaching career on Skillify
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center space-x-3 mx-auto"
            >
              <FaChalkboardTeacher className="text-xl" />
              <span>
                {user?.role === "instructor"
                  ? "Go to Dashboard"
                  : existingApplication
                  ? "Check Application Status"
                  : "Start Teaching Today"}
              </span>
              <FaArrowRight className="text-lg" />
            </motion.button>

            {existingApplication && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-sm text-gray-600"
              >
                Application Status:{" "}
                <span
                  className={`font-semibold ${
                    existingApplication.status === "pending"
                      ? "text-yellow-600"
                      : existingApplication.status === "approved"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {existingApplication.status.charAt(0).toUpperCase() +
                    existingApplication.status.slice(1)}
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Teach on Skillify?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of instructors who are already earning money and
              making a difference
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/30 group cursor-pointer"
                >
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${benefit.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className="text-white text-2xl" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {benefit.description}
                  </p>

                  <div
                    className={`inline-block px-4 py-2 bg-gradient-to-r ${benefit.color} text-white text-sm font-semibold rounded-full`}
                  >
                    {benefit.stat}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Powerful Tools for Instructors
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to create, market, and sell your courses
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="text-white text-3xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What You Need to Get Started
            </h2>
            <p className="text-xl text-gray-600">
              Basic requirements to become a successful instructor
            </p>
          </motion.div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30">
            <div className="space-y-6">
              {requirements.map((requirement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaCheckCircle className="text-white text-sm" />
                  </div>
                  <span className="text-lg text-gray-700">{requirement}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <FaGraduationCap className="text-6xl mx-auto opacity-90" />
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Ready to Start Your Teaching Journey?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join our community of expert instructors and start earning money
              while making a positive impact on students' lives.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="bg-white text-indigo-600 font-bold text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center space-x-3"
              >
                <span>
                  {user?.role === "instructor"
                    ? "Go to Dashboard"
                    : existingApplication
                    ? "Check Application Status"
                    : "Apply Now"}
                </span>
                <FaArrowRight />
              </motion.button>

              {!isAuthenticated && (
                <Link
                  to="/auth/register"
                  className="text-white border-2 border-white hover:bg-white hover:text-indigo-600 font-semibold px-8 py-4 rounded-2xl transition-all duration-300"
                >
                  Create Account First
                </Link>
              )}
            </div>

            <p className="text-sm opacity-75">
              No upfront costs • Free to get started • Earn money from day one
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default BecomeInstructor;

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
// @ts-ignore
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const { data: existingApplication, isLoading } = useMyInstructorApplication();

  const benefits = [
    {
      icon: FaDollarSign,
      title: t("becomeInstructor.benefits.earnMoney.title"),
      description: t("becomeInstructor.benefits.earnMoney.description"),
      color: "from-green-500 to-emerald-600",
      stat: t("becomeInstructor.benefits.earnMoney.stat"),
    },
    {
      icon: FaGlobeAmericas,
      title: t("becomeInstructor.benefits.globalReach.title"),
      description: t("becomeInstructor.benefits.globalReach.description"),
      color: "from-blue-500 to-cyan-600",
      stat: t("becomeInstructor.benefits.globalReach.stat"),
    },
    {
      icon: FaClock,
      title: t("becomeInstructor.benefits.flexibleSchedule.title"),
      description: t("becomeInstructor.benefits.flexibleSchedule.description"),
      color: "from-purple-500 to-violet-600",
      stat: t("becomeInstructor.benefits.flexibleSchedule.stat"),
    },
    {
      icon: FaTrophy,
      title: t("becomeInstructor.benefits.buildBrand.title"),
      description: t("becomeInstructor.benefits.buildBrand.description"),
      color: "from-orange-500 to-red-600",
      stat: t("becomeInstructor.benefits.buildBrand.stat"),
    },
    {
      icon: FaHeart,
      title: t("becomeInstructor.benefits.makeImpact.title"),
      description: t("becomeInstructor.benefits.makeImpact.description"),
      color: "from-pink-500 to-rose-600",
      stat: t("becomeInstructor.benefits.makeImpact.stat"),
    },
    {
      icon: FaChartLine,
      title: t("becomeInstructor.benefits.analytics.title"),
      description: t("becomeInstructor.benefits.analytics.description"),
      color: "from-indigo-500 to-purple-600",
      stat: t("becomeInstructor.benefits.analytics.stat"),
    },
  ];

  const features = [
    {
      icon: FaRocket,
      title: t("becomeInstructor.features.easyCourseCreation.title"),
      description: t(
        "becomeInstructor.features.easyCourseCreation.description"
      ),
    },
    {
      icon: FaUsers,
      title: t("becomeInstructor.features.studentCommunity.title"),
      description: t("becomeInstructor.features.studentCommunity.description"),
    },
    {
      icon: FaCertificate,
      title: t("becomeInstructor.features.certification.title"),
      description: t("becomeInstructor.features.certification.description"),
    },
    {
      icon: FaLightbulb,
      title: t("becomeInstructor.features.marketingSupport.title"),
      description: t("becomeInstructor.features.marketingSupport.description"),
    },
  ];

  const stats = [
    { number: "50K+", label: t("becomeInstructor.stats.activeStudents") },
    { number: "10K+", label: t("becomeInstructor.stats.instructorsEarning") },
    { number: "$2M+", label: t("becomeInstructor.stats.paidToInstructors") },
    { number: "95%", label: t("becomeInstructor.stats.satisfactionRate") },
  ];

  const requirements = [
    t("becomeInstructor.requirements.list.0"),
    t("becomeInstructor.requirements.list.1"),
    t("becomeInstructor.requirements.list.2"),
    t("becomeInstructor.requirements.list.3"),
    t("becomeInstructor.requirements.list.4"),
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
              {t("becomeInstructor.title")}
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t("becomeInstructor.subtitle")}
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
                  ? t("becomeInstructor.goToDashboard")
                  : existingApplication
                  ? t("becomeInstructor.checkApplicationStatus")
                  : t("becomeInstructor.getStarted")}
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
                {t("becomeInstructor.applicationStatus")}:{" "}
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
              {t("becomeInstructor.powerfulTools.title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("becomeInstructor.powerfulTools.subtitle")}
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
              {t("becomeInstructor.requirementsSection.title")}
            </h2>
            <p className="text-xl text-gray-600">
              {t("becomeInstructor.requirementsSection.subtitle")}
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
              {t("becomeInstructor.ctaSection.title")}
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              {t("becomeInstructor.ctaSection.subtitle")}
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
                    ? t("becomeInstructor.goToDashboard")
                    : existingApplication
                    ? t("becomeInstructor.checkApplicationStatus")
                    : t("becomeInstructor.ctaSection.applyNow")}
                </span>
                <FaArrowRight />
              </motion.button>

              {!isAuthenticated && (
                <Link
                  to="/auth/register"
                  className="text-white border-2 border-white hover:bg-white hover:text-indigo-600 font-semibold px-8 py-4 rounded-2xl transition-all duration-300"
                >
                  {t("becomeInstructor.ctaSection.createAccount")}
                </Link>
              )}
            </div>

            <p className="text-sm opacity-75">
              {t("becomeInstructor.ctaSection.footerNote")}
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default BecomeInstructor;

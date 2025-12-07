import { motion } from "framer-motion";
import { FaRocket, FaPlay, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import stats from "../../constants/About/stats";
import values from "../../constants/About/values";
import Timeline from "../../components/About/Timeline";
import TeamSection from "../../components/About/TeamSection";
import Testimonials from "../../components/About/Testimonials";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-1/3 w-96 h-96 bg-gradient-to-br from-pink-400 to-rose-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.25, 0, 1] }}
            >
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-indigo-100 shadow-lg mb-8">
                <FaRocket className="text-indigo-500 mr-2" />
                <span className="text-sm font-semibold text-gray-700">
                  Our Story
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                Empowering{" "}
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Learners
                </span>{" "}
                Worldwide
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
                We believe everyone deserves access to quality education. Our
                mission is to democratize learning and help millions of people
                achieve their dreams through skill development.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={() => {
                    navigate("/");
                    // window.location.href = "/";
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Start Learning Today</span>
                  <FaArrowRight />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <FaPlay />
                  <span>Watch Our Story</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center group"
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110`}
                >
                  <stat.icon className="text-white text-2xl" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-24 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Values
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core principles guide everything we do and shape the
              learning experience we create.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2"
              >
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r ${value.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <value.icon className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <TeamSection />

      {/* Timeline */}
      <Timeline />

      {/* Testimonials */}
      <Testimonials />
    </div>
  );
};

export default About;

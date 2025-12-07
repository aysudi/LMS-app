import { motion } from "framer-motion";
import { FaClock, FaQuestionCircle, FaHeadset } from "react-icons/fa";
import contactMethods from "../../constants/Contact/contactMethods";
import ContactForm from "../../components/Contact/ContactForm";
import ContactInformation from "../../components/Contact/ContactInformation";

const Contact = () => {
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
                <FaHeadset className="text-indigo-500 mr-2" />
                <span className="text-sm font-semibold text-gray-700">
                  We're Here to Help
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                Get in{" "}
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Touch
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
                Have questions about our courses? Need technical support? Want
                to become an instructor?
                <span className="block mt-2 font-semibold text-gray-700">
                  Our team is ready to assist you.
                </span>
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Choose Your{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Preferred Method
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We offer multiple ways to get in touch. Choose what works best for
              you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactMethods.map((method, index) => (
              <motion.a
                key={index}
                href={method.action}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-indigo-200 text-center block"
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${method.color} rounded-2xl mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110`}
                >
                  <method.icon className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                  {method.title}
                </h3>
                <p className="text-gray-600 mb-3">{method.description}</p>
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  {method.value}
                </p>
                <div className="inline-flex items-center px-3 py-1 bg-gray-100 group-hover:bg-indigo-100 text-gray-600 group-hover:text-indigo-600 rounded-full text-sm transition-all duration-300">
                  <FaClock className="mr-2 text-xs" />
                  {method.available}
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <ContactForm />

            {/* Contact Information */}
            <ContactInformation />
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Looking for Quick Answers?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Check out our comprehensive FAQ section for instant answers to
              common questions.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <FaQuestionCircle />
              <span>Visit FAQ Center</span>
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;

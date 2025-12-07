import socialLinks from "../../constants/Contact/socialLinks";
import { FaClock, FaGlobe, FaQuestionCircle } from "react-icons/fa";
import supportCategories from "../../constants/Contact/supportCategories";
import { motion } from "framer-motion";

const ContactInformation = () => {
  const officeHours = [
    { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM PST" },
    { day: "Saturday", hours: "10:00 AM - 4:00 PM PST" },
    { day: "Sunday", hours: "Closed" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="space-y-8"
    >
      {/* Office Hours */}
      <div className="bg-white rounded-3xl p-8 shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <FaClock className="text-white text-xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Office Hours</h3>
        </div>
        <div className="space-y-4">
          {officeHours.map((schedule, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
            >
              <span className="text-gray-700 font-medium">{schedule.day}</span>
              <span className="text-gray-600">{schedule.hours}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Support Categories */}
      <div className="bg-white rounded-3xl p-8 shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <FaQuestionCircle className="text-white text-xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">How Can We Help?</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {supportCategories.map((category, index) => (
            <div
              key={index}
              className="group p-4 border border-gray-200 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300 cursor-pointer"
            >
              <div
                className={`inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r ${category.color} rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300`}
              >
                <category.icon className="text-white text-lg" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                {category.title}
              </h4>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-3xl p-8 shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <FaGlobe className="text-white text-xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Follow Us</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Stay connected with us on social media for updates, tips, and
          community discussions.
        </p>
        <div className="flex space-x-4">
          {socialLinks.map((social, index) => (
            <motion.a
              key={index}
              href={social.href}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-gray-600 ${social.color} transition-all duration-300 group`}
            >
              <social.icon className="text-xl group-hover:scale-110 transition-transform duration-300" />
            </motion.a>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ContactInformation;

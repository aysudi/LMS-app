import { FaLinkedin, FaStar, FaTwitter } from "react-icons/fa";
import team from "../../constants/About/team";
import { motion } from "framer-motion";

const TeamSection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Meet Our{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Team
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Passionate educators and technologists working together to
            revolutionize online learning.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group text-center hover:-translate-y-2"
            >
              <div className="relative mb-6">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-2xl mx-auto object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <FaStar className="text-white text-sm" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {member.name}
              </h3>
              <p className="text-indigo-600 font-semibold mb-3">
                {member.role}
              </p>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {member.bio}
              </p>
              <div className="flex justify-center space-x-3">
                <a
                  href={member.social.linkedin}
                  className="w-8 h-8 bg-gray-100 hover:bg-blue-600 rounded-lg flex items-center justify-center text-gray-600 hover:text-white transition-all duration-300"
                >
                  <FaLinkedin className="text-sm" />
                </a>
                <a
                  href={member.social.twitter}
                  className="w-8 h-8 bg-gray-100 hover:bg-blue-400 rounded-lg flex items-center justify-center text-gray-600 hover:text-white transition-all duration-300"
                >
                  <FaTwitter className="text-sm" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;

import { motion } from "framer-motion";
import milestones from "../../constants/About/milestones";

const Timeline = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-indigo-50">
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
              Journey
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From a small startup to a global learning platform - here's how
            we've grown.
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative flex items-center ${
                  index % 2 === 0 ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`w-1/2 ${
                    index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"
                  }`}
                >
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="text-2xl font-bold text-indigo-600 mb-2">
                      {milestone.year}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full border-4 border-white shadow-lg"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Timeline;

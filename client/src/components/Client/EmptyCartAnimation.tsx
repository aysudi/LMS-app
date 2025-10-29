import { motion } from "framer-motion";
import {
  FaShoppingBag,
  FaGraduationCap,
  FaBook,
  FaLightbulb,
} from "react-icons/fa";

const EmptyCartAnimation = () => {
  return (
    <div className="relative py-12">
      {/* Subtle floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -12, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-8 left-1/4 text-slate-300"
        >
          <FaBook className="text-lg" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, -8, 0],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-16 right-1/4 text-slate-300"
        >
          <FaGraduationCap className="text-xl" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, -10, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute bottom-20 left-1/3 text-slate-300"
        >
          <FaLightbulb className="text-lg" />
        </motion.div>
      </div>

      {/* Main illustration */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 15,
          delay: 0.1,
        }}
        className="relative"
      >
        {/* Background circle with subtle gradient */}
        <div className="w-48 h-48 mx-auto mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full shadow-inner"></div>

          {/* Subtle ring animation */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-4 border-2 border-slate-200 rounded-full"
          />

          {/* Central shopping bag icon */}
          <motion.div
            animate={{
              y: [0, -6, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="relative">
              <FaShoppingBag className="text-6xl text-slate-400" />

              {/* Subtle glow effect */}
              <motion.div
                animate={{
                  opacity: [0, 0.3, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-blue-500 rounded-full blur-xl scale-150 -z-10"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Elegant indicator dots */}
      <div className="flex justify-center space-x-3 mt-6">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.3,
            }}
            className="w-2 h-2 bg-slate-300 rounded-full"
          />
        ))}
      </div>
    </div>
  );
};

export default EmptyCartAnimation;

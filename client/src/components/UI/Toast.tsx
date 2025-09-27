import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaUndo, FaTimes, FaStar } from "react-icons/fa";

interface ToastProps {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
  onClose: (id: string) => void;
  onUndo?: () => void;
  showUndo?: boolean;
}

interface FloatingParticlesProps {
  count: number;
  color: string;
}

const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  count,
  color,
}) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className={`absolute w-1 h-1 ${color} rounded-full`}
          initial={{
            x: Math.random() * 300,
            y: Math.random() * 100,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            y: -50,
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: Math.random() * 300,
          }}
          transition={{
            duration: 2 + Math.random() * 1,
            delay: Math.random() * 0.5,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

const Toast: React.FC<ToastProps> = ({
  id,
  title,
  message,
  type,
  duration = 2000,
  onClose,
  onUndo,
  showUndo = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;

    const timeout = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timeout);
  }, [id, duration, onClose, isHovered]);

  const getTypeConfig = () => {
    switch (type) {
      case "success":
        return {
          bgGradient: "from-emerald-500 to-teal-600",
          icon: FaCheckCircle,
          iconColor: "text-emerald-600",
          particleColor: "bg-emerald-300",
          shadowColor: "shadow-emerald-500/25",
        };
      case "error":
        return {
          bgGradient: "from-red-500 to-rose-600",
          icon: FaTimes,
          iconColor: "text-red-600",
          particleColor: "bg-red-300",
          shadowColor: "shadow-red-500/25",
        };
      case "warning":
        return {
          bgGradient: "from-amber-500 to-orange-600",
          icon: FaStar,
          iconColor: "text-amber-600",
          particleColor: "bg-amber-300",
          shadowColor: "shadow-amber-500/25",
        };
      default:
        return {
          bgGradient: "from-blue-500 to-indigo-600",
          icon: FaStar,
          iconColor: "text-blue-600",
          particleColor: "bg-blue-300",
          shadowColor: "shadow-blue-500/25",
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -100, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -100, scale: 0.3 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
      className={`relative bg-white rounded-2xl shadow-xl ${config.shadowColor} p-4 min-w-[350px] max-w-[400px] border border-gray-100 overflow-hidden backdrop-blur-sm`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating Particles for Success */}
      {type === "success" && (
        <FloatingParticles count={8} color={config.particleColor} />
      )}

      {/* Background Gradient Overlay */}
      <div
        className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${config.bgGradient}`}
      />

      <div className="flex items-start space-x-4">
        {/* Icon with Animation */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut",
          }}
          className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${config.bgGradient} rounded-full flex items-center justify-center`}
        >
          <Icon className="text-white text-lg" />
        </motion.div>

        {/* Content */}
        <div className="flex-1 pt-1">
          <motion.h4
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="font-bold text-gray-900 text-sm"
          >
            {title}
          </motion.h4>
          <motion.p
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-sm mt-1"
          >
            {message}
          </motion.p>

          {/* Action Buttons */}
          {showUndo && onUndo && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center space-x-2 mt-3"
            >
              <button
                onClick={onUndo}
                className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors duration-200"
              >
                <FaUndo className="text-xs" />
                <span>Undo</span>
              </button>
            </motion.div>
          )}
        </div>

        {/* Close Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onClose(id)}
          className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <FaTimes className="text-sm" />
        </motion.button>
      </div>

      {/* Subtle Animation Border */}
      <motion.div
        className="absolute inset-0 rounded-2xl border-2 border-transparent"
        animate={{
          borderColor: [
            "rgba(0,0,0,0)",
            "rgba(16, 185, 129, 0.2)",
            "rgba(0,0,0,0)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
};

export default Toast;

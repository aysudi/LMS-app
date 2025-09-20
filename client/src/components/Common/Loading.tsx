import React from "react";
import { motion } from "framer-motion";
import { FaGraduationCap } from "react-icons/fa";

interface LoadingProps {
  variant?: "default" | "page" | "card" | "overlay";
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  variant = "default",
  size = "md",
  message = "Loading...",
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  // Default spinner
  if (variant === "default") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`${sizeClasses[size]} border-2 border-gray-300 border-t-indigo-600 rounded-full`}
        />
      </div>
    );
  }

  // Card loading (for components within cards)
  if (variant === "card") {
    return (
      <div
        className={`flex flex-col items-center justify-center p-8 ${className}`}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`${sizeClasses[size]} border-2 border-gray-300 border-t-indigo-600 rounded-full mb-4`}
        />
        <p className={`text-gray-600 font-medium ${textSizes[size]}`}>
          {message}
        </p>
      </div>
    );
  }

  // Overlay loading (for full screen overlays)
  if (variant === "overlay") {
    return (
      <div
        className={`fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center ${className}`}
      >
        <div className="text-center">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mx-auto mb-6 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-lg"
          >
            <FaGraduationCap className="text-white text-3xl" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <h3 className="text-xl font-semibold text-gray-900">{message}</h3>
            <div className="flex items-center justify-center space-x-1">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: 0,
                }}
                className="w-2 h-2 bg-indigo-600 rounded-full"
              />
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: 0.2,
                }}
                className="w-2 h-2 bg-indigo-600 rounded-full"
              />
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: 0.4,
                }}
                className="w-2 h-2 bg-indigo-600 rounded-full"
              />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Page loading (for full page loading states)
  return (
    <div
      className={`min-h-screen bg-gray-50/50 flex items-center justify-center ${className}`}
    >
      <div className="text-center">
        {/* Animated Logo */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mx-auto mb-8 p-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-xl"
        >
          <FaGraduationCap className="text-white text-4xl" />
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4"
        >
          Skillify
        </motion.h1>

        {/* Loading Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-600 text-lg mb-8 font-medium"
        >
          {message}
        </motion.p>

        {/* Animated Dots */}
        <div className="flex items-center justify-center space-x-2">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: 0,
            }}
            className="w-3 h-3 bg-indigo-600 rounded-full"
          />
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: 0.2,
            }}
            className="w-3 h-3 bg-indigo-600 rounded-full"
          />
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: 0.4,
            }}
            className="w-3 h-3 bg-indigo-600 rounded-full"
          />
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: 0.6,
            }}
            className="w-3 h-3 bg-purple-600 rounded-full"
          />
        </div>

        {/* Progress Bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mt-8 mx-auto h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
          style={{ maxWidth: "200px" }}
        />
      </div>
    </div>
  );
};

export default Loading;

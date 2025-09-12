import { motion } from "framer-motion";
import { FaGraduationCap } from "react-icons/fa";

const HeaderSkeleton: React.FC = () => {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm"
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo - Static */}
          <motion.div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 lg:p-3 rounded-xl shadow-lg">
              <FaGraduationCap className="text-white text-xl lg:text-2xl" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Skillify
              </h1>
              <p className="text-xs text-gray-500 hidden lg:block">
                Learn. Grow. Excel.
              </p>
            </div>
          </motion.div>

          {/* Desktop Navigation - Skeleton */}
          <nav className="hidden lg:flex items-center lg:ml-2 xl:ml-6 space-x-2 lg:space-x-4 xl:space-x-8">
            {[1, 2].map((index) => (
              <div
                key={index}
                className="flex items-center space-x-2 px-2 lg:px-3 py-2 rounded-lg"
              >
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </nav>

          {/* Search Bar - Skeleton */}
          <div className="hidden md:flex flex-1 min-w-0 mx-4 lg:mx-3 xl:mx-8">
            <div className="w-full relative min-w-0">
              <div className="w-full min-w-0 h-10 lg:h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
          </div>

          {/* Right Side - Auth Loading */}
          <div className="flex items-center space-x-1 lg:space-x-2 xl:space-x-4">
            {/* Loading state for auth section */}
            <div className="flex items-center space-x-3">
              {/* Action buttons skeleton */}
              <div className="hidden lg:flex items-center space-x-1 xl:space-x-3">
                {[1, 2, 3, 4].map((index) => (
                  <div
                    key={index}
                    className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"
                  ></div>
                ))}
              </div>

              {/* User avatar skeleton */}
              <div className="flex items-center space-x-2 lg:space-x-3 p-1 rounded-xl">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="hidden xl:block">
                  <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="hidden lg:block w-3 h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default HeaderSkeleton;

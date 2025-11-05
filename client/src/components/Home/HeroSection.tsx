import { motion } from "framer-motion";
import { FaFire } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import {
  HERO_STATS,
  ANIMATION_CONFIG,
} from "../../constants/homePageConstants";

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative pt-16 sm:pt-20 pb-16 sm:pb-24 md:pb-32 overflow-hidden">
      {/* Enhanced Background Decorations */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/3 w-96 h-96 bg-gradient-to-br from-pink-400 to-rose-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-1/4 w-4 h-4 bg-indigo-400 rounded-full animate-bounce opacity-60"></div>
        <div className="absolute top-1/3 left-1/4 w-6 h-6 bg-purple-400 rounded-full animate-pulse opacity-40"></div>
        <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-cyan-400 rounded-full animate-bounce animation-delay-1000 opacity-50"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.div
            initial={ANIMATION_CONFIG.heroTitle.initial}
            animate={ANIMATION_CONFIG.heroTitle.animate}
            transition={ANIMATION_CONFIG.heroTitle.transition}
            className="mb-12"
          >
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-indigo-100 shadow-lg mb-8">
              <FaFire className="text-orange-500 mr-2" />
              <span className="text-sm font-semibold text-gray-700">
                {t("home.hero.joinBadge")}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight">
              {t("home.hero.masterNew")}{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {t("home.hero.skills")}
                </span>
                <svg
                  className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-2 sm:h-3"
                  viewBox="0 0 200 12"
                  fill="none"
                >
                  <path
                    d="M2 10C20 6, 40 2, 60 3C80 4, 100 8, 120 4C140 1, 160 5, 180 2C185 1, 190 3, 198 2"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8 sm:mb-12 px-4">
              {t("home.hero.unlockPotential")}
              <span className="block mt-2 font-semibold text-gray-700">
                {t("home.hero.buildSkills")}
              </span>
            </p>
          </motion.div>

          {/* Enhanced Stats */}
          <motion.div
            initial={ANIMATION_CONFIG.heroStats.initial}
            animate={ANIMATION_CONFIG.heroStats.animate}
            transition={ANIMATION_CONFIG.heroStats.transition}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto mb-12 sm:mb-16 px-4"
          >
            {HERO_STATS.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="group"
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r ${stat.color} rounded-2xl mb-3 sm:mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110`}
                >
                  <stat.icon className="text-white text-lg sm:text-xl md:text-2xl" />
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium text-center">
                  {t(stat.labelKey)}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

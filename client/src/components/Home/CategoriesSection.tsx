import { motion } from "framer-motion";
import { FaGraduationCap } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { ANIMATION_CONFIG } from "../../constants/homePageConstants";

interface Category {
  id: string;
  name: string;
  count: number;
  icon: any;
}

interface CategoriesSectionProps {
  categories: Category[];
  onCategoryClick: (categoryId: string) => void;
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  categories,
  onCategoryClick,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={ANIMATION_CONFIG.categories.initial}
      animate={ANIMATION_CONFIG.categories.animate}
      transition={ANIMATION_CONFIG.categories.transition}
      className="mb-12 sm:mb-16 md:mb-20"
    >
      <div className="text-center mb-8 sm:mb-12 px-4">
        <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-indigo-50 rounded-full mb-4 sm:mb-6">
          <FaGraduationCap className="text-indigo-600 mr-2 text-sm sm:text-base" />
          <span className="text-xs sm:text-sm font-semibold text-indigo-600">
            {t("home.categories.exploreCategories")}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
          {t("home.categories.findYour")}{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {t("home.categories.learningPath")}
          </span>
        </h2>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {t("home.categories.discoverCourses")}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {categories.map((category, index) => (
          <motion.button
            key={category.id}
            onClick={() => onCategoryClick(category.id)}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.7 + index * 0.05,
            }}
            whileHover={{
              scale: 1.05,
              y: -5,
            }}
            whileTap={{ scale: 0.95 }}
            className="group relative p-4 sm:p-6 rounded-2xl text-center transition-all duration-300 overflow-hidden bg-white hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 text-gray-700 shadow-lg hover:shadow-xl border border-gray-100"
          >
            {/* Icon with enhanced styling */}
            <div className="relative inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl mb-3 sm:mb-4 transition-all duration-300 bg-indigo-100 group-hover:bg-indigo-200">
              <category.icon className="text-lg sm:text-2xl transition-all duration-300 text-indigo-600 group-hover:text-indigo-700" />
            </div>

            <div className="relative">
              <div className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2 transition-colors duration-300 text-gray-900 group-hover:text-indigo-600 line-clamp-2">
                {category.name}
              </div>
              <div className="text-xs transition-colors duration-300 text-gray-500 group-hover:text-indigo-500">
                {category.count}{" "}
                {category.count === 1
                  ? t("common.course").toLowerCase()
                  : t("common.courses").toLowerCase()}
              </div>
            </div>

            {/* Hover Border Effect */}
            <div className="absolute inset-0 rounded-2xl border-2 transition-all duration-300 border-transparent group-hover:border-indigo-200" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default CategoriesSection;

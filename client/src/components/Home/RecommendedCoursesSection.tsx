import { motion } from "framer-motion";
import { FaLightbulb, FaArrowRight } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { ANIMATION_CONFIG } from "../../constants/homePageConstants";
import type { Course } from "../../types/course.type";
import ModernCourseCard from "../Client/ModernCourseCard";
import Loading from "../Common/Loading";

interface RecommendedCoursesSectionProps {
  courses: Course[];
  isLoading: boolean;
  onWishlistToggle: (e: React.MouseEvent, course: Course) => void;
  onCartToggle: (e: React.MouseEvent, course: Course) => void;
  checkIfInWishlist: (courseId: string) => boolean;
  checkIfInCart: (courseId: string) => boolean;
  checkIfEnrolled: (courseId: string) => boolean;
  processingWishlist: Set<string>;
  processingCart: Set<string>;
}

const RecommendedCoursesSection: React.FC<RecommendedCoursesSectionProps> = ({
  courses,
  isLoading,
  onWishlistToggle,
  onCartToggle,
  checkIfInWishlist,
  checkIfInCart,
  checkIfEnrolled,
  processingWishlist,
  processingCart,
}) => {
  const { t } = useTranslation();

  if (!courses.length && !isLoading) {
    return null;
  }

  return (
    <motion.div
      initial={ANIMATION_CONFIG.sections.initial}
      animate={ANIMATION_CONFIG.sections.animate}
      transition={ANIMATION_CONFIG.sections.transition}
      className="mb-12 sm:mb-16 md:mb-20"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12 px-4">
        <div className="mb-4 sm:mb-0">
          <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-full mb-3 sm:mb-4">
            <FaLightbulb className="text-orange-500 mr-2 text-sm sm:text-base" />
            <span className="text-xs sm:text-sm font-semibold text-orange-600">
              {t("home.sections.personalized")}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            {t("home.sections.recommended")}{" "}
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              {t("home.sections.forYou")}
            </span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            {t("home.sections.coursesPickedForYou")}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="self-start sm:self-auto flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-indigo-600 hover:text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-all duration-300 text-sm sm:text-base"
        >
          {t("common.viewAll")} <FaArrowRight className="text-xs sm:text-sm" />
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-4">
        {isLoading
          ? // Loading skeleton for recommended courses
            Array.from({ length: 4 }).map((_, index) => (
              <Loading key={index} variant="card" size="md" message="" />
            ))
          : courses
              .slice(0, 4)
              .map((course: Course, index: number) => (
                <ModernCourseCard
                  key={index}
                  course={course}
                  index={index}
                  onWishlistToggle={onWishlistToggle}
                  onCartToggle={onCartToggle}
                  checkIfInWishlist={checkIfInWishlist}
                  checkIfInCart={checkIfInCart}
                  checkIfEnrolled={checkIfEnrolled}
                  processingWishlist={processingWishlist}
                  processingCart={processingCart}
                  showCartButton={true}
                />
              ))}
      </div>
    </motion.div>
  );
};

export default RecommendedCoursesSection;

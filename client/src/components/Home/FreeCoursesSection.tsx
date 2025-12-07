import { motion } from "framer-motion";
import { FaRocket } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import type { Course } from "../../types/course.type";
import FreeCourseCard from "../Client/FreeCourseCard";
import Loading from "../Common/Loading";

interface FreeCoursesSectionProps {
  courses: Course[];
  isLoading: boolean;
  onWishlistToggle: (e: React.MouseEvent, course: Course) => void;
  onCartToggle: (e: React.MouseEvent, course: Course) => void;
  onCourseClick: (courseId: string | number) => void;
  checkIfInWishlist: (courseId: string) => boolean;
  checkIfInCart: (courseId: string) => boolean;
  processingWishlist: Set<string>;
  processingCart: Set<string>;
}

const FreeCoursesSection: React.FC<FreeCoursesSectionProps> = ({
  courses,
  isLoading,
  onWishlistToggle,
  onCartToggle,
  onCourseClick,
  checkIfInWishlist,
  checkIfInCart,
  processingWishlist,
  processingCart,
}) => {
  const { t } = useTranslation();

  if (!courses.length && !isLoading) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="mb-8 sm:mb-10 md:mb-12"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 px-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2 mb-3 sm:mb-0">
          <FaRocket className="text-green-600 text-lg sm:text-xl" />
          {t("home.sections.freeCoursesToStart")}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4">
        {isLoading
          ? // Loading skeleton for free courses
            Array.from({ length: 4 }).map((_, index) => (
              <Loading key={index} variant="card" size="md" message="" />
            ))
          : courses
              .slice(0, 4)
              .map((course: Course, index: number) => (
                <FreeCourseCard
                  key={index}
                  course={course}
                  index={index}
                  onWishlistToggle={onWishlistToggle}
                  onCartToggle={onCartToggle}
                  checkIfInWishlist={checkIfInWishlist}
                  checkIfInCart={checkIfInCart}
                  processingWishlist={processingWishlist}
                  processingCart={processingCart}
                  onClick={() => onCourseClick(course.id)}
                />
              ))}
      </div>
    </motion.div>
  );
};

export default FreeCoursesSection;

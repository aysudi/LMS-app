import { motion } from "framer-motion";
import { FaGraduationCap } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { COLOR_PALETTES } from "../../constants/homePageConstants";
import type { Course } from "../../types/course.type";
import ModernCourseCard from "../Client/ModernCourseCard";

interface CategoryCoursesSectionProps {
  allCourses: Course[];
  recommendations: { recommended: Course[] };
  onCategoryClick: (categoryId: string) => void;
  onWishlistToggle: (e: React.MouseEvent, course: Course) => void;
  onCartToggle: (e: React.MouseEvent, course: Course) => void;
  checkIfInWishlist: (courseId: string) => boolean;
  checkIfInCart: (courseId: string) => boolean;
  checkIfEnrolled: (courseId: string) => boolean;
  processingWishlist: Set<string>;
  processingCart: Set<string>;
}

const CategoryCoursesSection: React.FC<CategoryCoursesSectionProps> = ({
  allCourses,
  recommendations,
  onWishlistToggle,
  onCartToggle,
  checkIfInWishlist,
  checkIfInCart,
  checkIfEnrolled,
  processingWishlist,
  processingCart,
}) => {
  const { t } = useTranslation();

  const getCoursesForCategory = (category: string) => {
    const coursesToFilter =
      recommendations.recommended.length > 0
        ? recommendations.recommended
        : allCourses;

    return coursesToFilter
      .filter((course: any) => course.category === category)
      .slice(0, 3);
  };

  const generateDynamicCategories = () => {
    if (!allCourses || allCourses.length === 0) return [];

    const uniqueCategories = [
      ...new Set(allCourses.map((course) => course.category)),
    ];

    return uniqueCategories.map((categoryName, index) => {
      const colorIndex = index % COLOR_PALETTES.length;

      return {
        id: categoryName,
        name: categoryName,
        description: `Explore ${categoryName} courses and enhance your skills`,
        icon: FaGraduationCap,
        ...COLOR_PALETTES[colorIndex],
      };
    });
  };

  const dynamicCategories = generateDynamicCategories();

  return (
    <div className="space-y-8 sm:space-y-12 md:space-y-16">
      {dynamicCategories
        .map((category, categoryIndex) => {
          const courses = getCoursesForCategory(category.id);

          if (courses.length === 0) return null;

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 1.0 + categoryIndex * 0.1,
              }}
              className="mb-8 sm:mb-12 md:mb-16"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 px-4">
                <div className="flex items-center gap-3 mb-4 sm:mb-0">
                  <div className={`p-2 sm:p-3 ${category.bgColor} rounded-xl`}>
                    <category.icon
                      className={`${category.iconColor} text-lg sm:text-xl md:text-2xl`}
                    />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                      {category.name}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">
                      {t("home.categories.exploreCategoryDescription", {
                        category: category.name,
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-4">
                {courses.map((course: Course, index: number) => (
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
        })
        .filter(Boolean)}
    </div>
  );
};

export default CategoryCoursesSection;

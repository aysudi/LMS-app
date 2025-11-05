import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FaGraduationCap } from "react-icons/fa";
import { CATEGORY_ICONS } from "../constants/homePageConstants";
import type { Course } from "../types/course.type";

interface Category {
  id: string;
  name: string;
  count: number;
  icon: any;
}

export const useCategories = (allCourses: Course[]): Category[] => {
  const { t } = useTranslation();

  return useMemo(() => {
    if (!allCourses || allCourses.length === 0) return [];

    // Group courses by category and count them
    const categoryGroups = allCourses.reduce((acc, course) => {
      const category = course.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(course);
      return acc;
    }, {} as Record<string, Course[]>);

    // Convert to array with counts and icons, sorted by course count
    const categoriesWithCounts = Object.entries(categoryGroups)
      .map(([categoryName, coursesInCategory]) => ({
        id: categoryName,
        name: categoryName,
        count: coursesInCategory.length,
        icon: CATEGORY_ICONS[categoryName] || CATEGORY_ICONS.default,
      }))
      .sort((a, b) => b.count - a.count) // Sort by course count descending
      .slice(0, 5); // Show only top 5 categories

    // Add "All Courses" as first option
    return [
      {
        id: "all",
        name: t("common.allCourses"),
        count: allCourses.length,
        icon: FaGraduationCap,
      },
      ...categoriesWithCounts,
    ];
  }, [allCourses, t]);
};

import {
  FaGraduationCap,
  FaCode,
  FaPalette,
  FaChartLine,
  FaRocket,
  FaCamera,
} from "react-icons/fa";
import type { IconType } from "react-icons";
import type { Course } from "../types/course.type";

export interface CategoryItem {
  id: string;
  name: string;
  icon: IconType;
  count?: number;
}

export const COURSE_CATEGORIES_BASE: Omit<CategoryItem, "count">[] = [
  {
    id: "all",
    name: "All Courses",
    icon: FaGraduationCap,
  },
  {
    id: "development",
    name: "Development",
    icon: FaCode,
  },
  {
    id: "design",
    name: "Design",
    icon: FaPalette,
  },
  {
    id: "data-science",
    name: "Data Science",
    icon: FaChartLine,
  },
  {
    id: "marketing",
    name: "Marketing",
    icon: FaRocket,
  },
  {
    id: "photography",
    name: "Photography",
    icon: FaCamera,
  },
];

export const generateCategoriesWithCounts = (
  courses: Course[]
): CategoryItem[] => {
  return COURSE_CATEGORIES_BASE.map((category) => ({
    ...category,
    count:
      category.id === "all"
        ? courses.length
        : category.id === "data-science"
        ? courses.filter((c) => c.category.toLowerCase().includes("data"))
            .length
        : courses.filter((c) => c.category.toLowerCase() === category.id)
            .length,
  }));
};

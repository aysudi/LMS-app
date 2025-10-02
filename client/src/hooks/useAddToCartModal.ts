import { useState } from "react";
import type { Course } from "../types/course.type";

export const useAddToCartModal = (courses: Course[]) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addedCourse, setAddedCourse] = useState<Course | null>(null);

  const openModal = (course: Course) => {
    setAddedCourse(course);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAddedCourse(null);
  };

  const getRecommendedCourses = (baseCourse: Course): Course[] => {
    if (!baseCourse) return [];

    const sameCategoryCourses = courses.filter(
      (course) =>
        course.id !== baseCourse.id &&
        course.category === baseCourse.category &&
        !course.isFree
    );

    if (sameCategoryCourses.length >= 3) {
      return sameCategoryCourses
        .sort((a, b) => (b.rating || 0) - (a.rating || 0)) // Sort by rating
        .slice(0, 3);
    }

    const similarLevelCourses = courses.filter(
      (course) =>
        course.id !== baseCourse.id &&
        course.level === baseCourse.level &&
        !course.isFree &&
        !sameCategoryCourses.some((c) => c.id === course.id)
    );

    const combined = [...sameCategoryCourses, ...similarLevelCourses];
    return combined
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);
  };

  const recommendedCourses = addedCourse
    ? getRecommendedCourses(addedCourse)
    : [];

  return {
    isModalOpen,
    addedCourse,
    recommendedCourses,
    openModal,
    closeModal,
  };
};

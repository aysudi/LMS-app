import { useState, useCallback, useMemo } from "react";
import { useSearchCourses, useCoursesByCategory } from "./useCourseQueries";
import type { CourseQuery } from "../services/course.service";

// Hook for course filtering and search functionality
export const useCourseFilters = () => {
  const [filters, setFilters] = useState<CourseQuery>({
    page: 1,
    limit: 12,
    category: "",
    level: "",
    search: "",
    minPrice: undefined,
    maxPrice: undefined,
    sortBy: "rating",
    sortOrder: "desc",
  });

  const updateFilter = useCallback((key: keyof CourseQuery, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1, // Reset page when other filters change
    }));
  }, []);

  const updateFilters = useCallback((newFilters: Partial<CourseQuery>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset page when multiple filters change
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 12,
      category: "",
      level: "",
      search: "",
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: "rating",
      sortOrder: "desc",
    });
  }, []);

  const clearSearch = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      search: "",
      page: 1,
    }));
  }, []);

  const setPriceRange = useCallback((minPrice?: number, maxPrice?: number) => {
    setFilters((prev) => ({
      ...prev,
      minPrice,
      maxPrice,
      page: 1,
    }));
  }, []);

  const setCategory = useCallback((category: string) => {
    setFilters((prev) => ({
      ...prev,
      category,
      page: 1,
    }));
  }, []);

  const setLevel = useCallback((level: string) => {
    setFilters((prev) => ({
      ...prev,
      level,
      page: 1,
    }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({
      ...prev,
      search,
      page: 1,
    }));
  }, []);

  const setSorting = useCallback(
    (
      sortBy: CourseQuery["sortBy"],
      sortOrder: CourseQuery["sortOrder"] = "desc"
    ) => {
      setFilters((prev) => ({
        ...prev,
        sortBy,
        sortOrder,
        page: 1,
      }));
    },
    []
  );

  const nextPage = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      page: (prev.page || 1) + 1,
    }));
  }, []);

  const prevPage = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      page: Math.max((prev.page || 1) - 1, 1),
    }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setFilters((prev) => ({
      ...prev,
      page: Math.max(page, 1),
    }));
  }, []);

  // Check if filters are active (not default)
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.category ||
      filters.level ||
      filters.search ||
      (filters.minPrice !== undefined && filters.minPrice > 0) ||
      filters.maxPrice !== undefined ||
      filters.sortBy !== "rating" ||
      filters.sortOrder !== "desc"
    );
  }, [filters]);

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    clearSearch,
    setPriceRange,
    setCategory,
    setLevel,
    setSearch,
    setSorting,
    nextPage,
    prevPage,
    goToPage,
    hasActiveFilters,
  };
};

// Hook for course search with debounced input
export const useDebouncedCourseSearch = (
  initialFilters: Partial<CourseQuery> = {}
) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Debounce search term
  useState(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsTyping(false);
    }, 500);

    setIsTyping(searchTerm !== debouncedSearchTerm);

    return () => clearTimeout(timer);
  });

  const {
    data: searchResults,
    isLoading: isSearching,
    error: searchError,
    refetch: refetchSearch,
  } = useSearchCourses(debouncedSearchTerm, initialFilters, {
    enabled: debouncedSearchTerm.length > 2,
  });

  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setIsTyping(false);
  }, []);

  return {
    searchTerm,
    debouncedSearchTerm,
    isTyping,
    searchResults,
    isSearching: isSearching || isTyping,
    searchError,
    updateSearchTerm,
    clearSearch,
    refetchSearch,
  };
};

// Hook for managing course categories
export const useCourseCategories = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const {
    data: categoryData,
    isLoading,
    error,
    refetch,
  } = useCoursesByCategory(
    selectedCategory,
    { limit: 20 },
    { enabled: !!selectedCategory }
  );

  const selectCategory = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const clearCategory = useCallback(() => {
    setSelectedCategory("");
  }, []);

  return {
    selectedCategory,
    categoryData,
    isLoading,
    error,
    selectCategory,
    clearCategory,
    refetch,
  };
};

// Hook for course statistics and analytics
export const useCourseStats = (courses: any[] = []) => {
  const stats = useMemo(() => {
    if (!courses || courses.length === 0) {
      return {
        totalCourses: 0,
        averageRating: 0,
        averagePrice: 0,
        totalStudents: 0,
        categoriesCount: 0,
        levelsCount: 0,
        freeCoursesCount: 0,
        paidCoursesCount: 0,
      };
    }

    const totalCourses = courses.length;
    const totalRating = courses.reduce(
      (sum, course) => sum + (course.rating || 0),
      0
    );
    const averageRating = totalRating / totalCourses;

    const totalPrice = courses.reduce(
      (sum, course) => sum + (course.originalPrice || 0),
      0
    );
    const averagePrice = totalPrice / totalCourses;

    const totalStudents = courses.reduce(
      (sum, course) => sum + (course.enrollmentCount || 0),
      0
    );

    const categories = new Set(
      courses.map((course) => course.category).filter(Boolean)
    );
    const categoriesCount = categories.size;

    const levels = new Set(
      courses.map((course) => course.level).filter(Boolean)
    );
    const levelsCount = levels.size;

    const freeCoursesCount = courses.filter(
      (course) => course.isFree || course.originalPrice === 0
    ).length;
    const paidCoursesCount = courses.filter(
      (course) => !course.isFree && course.originalPrice > 0
    ).length;

    return {
      totalCourses,
      averageRating: Number(averageRating.toFixed(2)),
      averagePrice: Number(averagePrice.toFixed(2)),
      totalStudents,
      categoriesCount,
      levelsCount,
      freeCoursesCount,
      paidCoursesCount,
    };
  }, [courses]);

  return stats;
};

// Hook for course price utilities
export const useCoursePrice = () => {
  const formatPrice = useCallback((price: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(price);
  }, []);

  const calculateDiscount = useCallback(
    (originalPrice: number, discountPrice: number) => {
      if (originalPrice <= 0 || discountPrice >= originalPrice) return 0;
      return Math.round(
        ((originalPrice - discountPrice) / originalPrice) * 100
      );
    },
    []
  );

  const isFree = useCallback((course: any) => {
    return (
      course.isFree || course.originalPrice === 0 || course.discountPrice === 0
    );
  }, []);

  const getEffectivePrice = useCallback((course: any) => {
    if (course.isFree || course.originalPrice === 0) return 0;
    if (
      course.discountPrice !== undefined &&
      course.discountPrice < course.originalPrice
    ) {
      return course.discountPrice;
    }
    return course.originalPrice;
  }, []);

  const hasDiscount = useCallback((course: any) => {
    return (
      course.discountPrice !== undefined &&
      course.discountPrice < course.originalPrice &&
      course.discountPrice >= 0 &&
      !course.isFree
    );
  }, []);

  return {
    formatPrice,
    calculateDiscount,
    isFree,
    getEffectivePrice,
    hasDiscount,
  };
};

// Hook for course enrollment status
export const useCourseEnrollment = (userId?: string) => {
  const isEnrolled = useCallback(
    (course: any) => {
      if (!userId || !course.studentsEnrolled) return false;
      return course.studentsEnrolled.includes(userId);
    },
    [userId]
  );

  const getEnrollmentCount = useCallback((course: any) => {
    return course.enrollmentCount || course.studentsEnrolled?.length || 0;
  }, []);

  const canEnroll = useCallback(
    (course: any) => {
      return course.isPublished && !isEnrolled(course);
    },
    [isEnrolled]
  );

  return {
    isEnrolled,
    getEnrollmentCount,
    canEnroll,
  };
};

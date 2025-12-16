import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCourses } from "../../hooks/useCourseHooks";
import type { CourseQuery } from "../../types/course.type";
import CoursesHeader from "../../components/Courses/CoursesHeader";
import CoursesFilters from "../../components/Courses/CoursesFilters";
import CoursesContent from "../../components/Courses/CoursesContent";

const Courses: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentQuery, setCurrentQuery] = useState<CourseQuery>({
    page: 1,
    limit: 12,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    level: "",
    minPrice: "",
    maxPrice: "",
    isFree: false,
  });

  const { data: coursesData, isLoading, error } = useCourses(currentQuery);
  const courses = coursesData?.data || [];
  const pagination = coursesData?.pagination;

  const updateSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });

      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  const handleFilterChange = (key: string, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const updates: Record<string, string | null> = { page: "1" };

    if (key === "category") updates.category = (value as string) || null;
    if (key === "level") updates.level = (value as string) || null;
    if (key === "minPrice") updates.minPrice = (value as string) || null;
    if (key === "maxPrice") updates.maxPrice = (value as string) || null;
    if (key === "isFree") updates.isFree = value ? "true" : null;

    updateSearchParams(updates);
  };

  const handlePageChange = (page: number) => {
    updateSearchParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      level: "",
      minPrice: "",
      maxPrice: "",
      isFree: false,
    });
    setSearchQuery("");
    setSearchParams({});
  };

  useEffect(() => {
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const level = searchParams.get("level") || "";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const isFree = searchParams.get("isFree") === "true";

    setSearchQuery(search);
    setFilters({
      category,
      level,
      minPrice,
      maxPrice,
      isFree,
    });
  }, [searchParams]);

  useEffect(() => {
    const query: CourseQuery = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: 12,
      search: searchQuery || undefined,
      category: filters.category || undefined,
      level: filters.level || undefined,
      minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
      sortBy: (searchParams.get("sortBy") as any) || "rating",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    };

    setCurrentQuery(query);
  }, [searchParams, searchQuery, filters]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <CoursesHeader
        searchQuery={searchQuery}
        filters={filters}
        pagination={pagination}
        isLoading={isLoading}
        viewMode={viewMode}
        setViewMode={setViewMode}
        t={t}
      />

      <CoursesFilters
        filters={filters}
        searchQuery={searchQuery}
        showFilters={showFilters}
        handleFilterChange={handleFilterChange}
        updateSearchParams={updateSearchParams}
        clearFilters={clearFilters}
        t={t}
      />

      <CoursesContent
        isLoading={isLoading}
        error={error}
        courses={courses}
        searchQuery={searchQuery}
        viewMode={viewMode}
        pagination={pagination}
        handlePageChange={handlePageChange}
        clearFilters={clearFilters}
        t={t}
      />
    </div>
  );
};

export default Courses;

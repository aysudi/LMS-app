import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useInstructorAnalytics,
  useInstructorCoursesWithStats,
} from "../../hooks/useInstructor";
import { useDeleteCourse } from "../../hooks/useCourseHooks";
import Loading from "../../components/Common/Loading";
import { useToast } from "../../components/UI/ToastProvider";
import { courseToasts } from "../../utils/toastUtils";
import Swal from "sweetalert2";
import CoursesHeader from "../../components/Instructor/Courses/CoursesHeader";
import CourseFilters, {
  type StatusFilter,
  type SortOption,
  type PriceFilter,
  type RatingFilter,
} from "../../components/Instructor/Courses/CourseFilters";
import CourseList from "../../components/Instructor/Courses/CourseList";

const InstructorCourses = () => {
  const navigate = useNavigate();
  const [searchParams, _] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [page, setPage] = useState(1);

  // Handle URL search parameters
  useEffect(() => {
    const urlSearchTerm = searchParams.get("search") || "";
    if (urlSearchTerm !== searchTerm) {
      setSearchTerm(urlSearchTerm);
      setDebouncedSearchTerm(urlSearchTerm);
      setPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Convert filters to server-compatible format
  const getServerPriceFilter = (priceFilter: PriceFilter) => {
    switch (priceFilter) {
      case "free":
        return { minPrice: 0, maxPrice: 0 };
      case "paid":
        return { minPrice: 1 };
      case "under-50":
        return { minPrice: 1, maxPrice: 49.99 };
      case "50-100":
        return { minPrice: 50, maxPrice: 100 };
      case "over-100":
        return { minPrice: 100.01 };
      default:
        return {};
    }
  };

  const getServerRatingFilter = (ratingFilter: RatingFilter) => {
    switch (ratingFilter) {
      case "4-plus":
        return 4;
      case "3-plus":
        return 3;
      case "2-plus":
        return 2;
      case "1-plus":
        return 1;
      default:
        return undefined;
    }
  };

  const priceParams = getServerPriceFilter(priceFilter);
  const minRating = getServerRatingFilter(ratingFilter);

  const {
    data: coursesData,
    isLoading,
    error,
    isPlaceholderData,
    isFetching,
  } = useInstructorCoursesWithStats(
    {
      page,
      limit: 12,
      status: statusFilter !== "all" ? statusFilter : undefined,
      search: debouncedSearchTerm || undefined,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      sortBy: getSortByValue(sortBy),
      sortOrder: getSortOrder(sortBy),
      ...priceParams,
      ...(minRating && { minRating }),
    },
    {
      placeholderData: (previousData) => previousData,
      staleTime: 1 * 60 * 1000,
    }
  );

  const { formatCurrency } = useInstructorAnalytics();
  const { showToast } = useToast();

  const deleteMutation = useDeleteCourse({
    onSuccess: () => {
      showToast(courseToasts.deleted());
      setSelectedCourses((prev) => prev.filter((id) => !prev.includes(id)));
    },
    onError: () => {
      showToast(courseToasts.deleteError());
    },
  });

  const courses = coursesData?.data?.courses || [];
  const totalPages = coursesData?.data?.pagination?.totalPages || 1;
  const totalCourses = coursesData?.data?.pagination?.totalCourses || 0;

  function getSortByValue(
    sort: SortOption
  ): "createdAt" | "title" | "studentsCount" | "originalPrice" | "rating" {
    switch (sort) {
      case "newest":
      case "oldest":
        return "createdAt";
      case "title-asc":
      case "title-desc":
        return "title";
      case "students-desc":
      case "students-asc":
        return "studentsCount";
      case "price-desc":
      case "price-asc":
        return "originalPrice";
      case "rating-desc":
      case "rating-asc":
        return "rating";
      default:
        return "createdAt";
    }
  }

  function getSortOrder(sort: SortOption): "asc" | "desc" {
    if (sort.includes("asc") || sort === "oldest") {
      return "asc";
    }
    return "desc";
  }

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  const handleStatusFilterChange = (status: StatusFilter) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handlePriceFilterChange = (price: PriceFilter) => {
    setPriceFilter(price);
    setPage(1);
  };

  const handleRatingFilterChange = (rating: RatingFilter) => {
    setRatingFilter(rating);
    setPage(1);
  };

  const handleEditCourse = (courseId: string) => {
    navigate(`/instructor/courses/${courseId}/edit`);
  };

  const handleDeleteCourse = async (courseId: string) => {
    const course = courses.find((c: any) => c._id === courseId);
    const courseTitle = course?.title || "this course";

    const result = await Swal.fire({
      title: "Delete Course",
      html: `Are you sure you want to delete <strong>"${courseTitle}"</strong>?<br><br>This action cannot be undone and will remove all associated lessons, sections, and student progress.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteMutation.mutateAsync(courseId);
      } catch (error) {
        console.error("Failed to delete course:", error);
      }
    }
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCourses.length === courses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(courses.map((course: any) => course._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCourses.length === 0) return;

    const result = await Swal.fire({
      title: "Delete Selected Courses",
      html: `Are you sure you want to delete <strong>${selectedCourses.length} selected course(s)</strong>?<br><br>This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `Yes, Delete ${selectedCourses.length} Course(s)`,
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        for (const courseId of selectedCourses) {
          await deleteMutation.mutateAsync(courseId!);
          // window.location.reload();
        }
        setSelectedCourses([]);
      } catch (error) {
        console.error("Failed to delete selected courses:", error);
      }
    }
  };

  if (isLoading && !isPlaceholderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Error loading courses
          </h2>
          <p className="text-gray-600 mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  const publishedCourses = courses.filter(
    (course: any) => course.isPublished
  ).length;
  const draftCourses = courses.filter(
    (course: any) => !course.isPublished
  ).length;

  const publishedCoursesForRating = courses.filter(
    (course: any) => course.isPublished && course.rating > 0
  );
  const averageRating =
    publishedCoursesForRating.length > 0
      ? publishedCoursesForRating.reduce(
          (acc: number, course: any) => acc + (course.rating || 0),
          0
        ) / publishedCoursesForRating.length
      : 0;

  const categories = Array.from(
    new Set(courses.map((course: any) => course.category).filter(Boolean))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <CoursesHeader
            totalCourses={totalCourses}
            publishedCourses={publishedCourses}
            draftCourses={draftCourses}
            averageRating={averageRating}
            selectedCourses={selectedCourses}
            onBulkDelete={handleBulkDelete}
          />

          {/* Filters */}
          <CourseFilters
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            priceFilter={priceFilter}
            onPriceFilterChange={handlePriceFilterChange}
            ratingFilter={ratingFilter}
            onRatingFilterChange={handleRatingFilterChange}
            courseCount={totalCourses}
          />

          {/* Course List */}
          <div
            className={`relative ${
              isFetching && isPlaceholderData
                ? "opacity-75 pointer-events-none"
                : ""
            }`}
          >
            {isFetching && isPlaceholderData && (
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-white rounded-full p-2 shadow-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></div>
                </div>
              </div>
            )}

            <CourseList
              courses={courses}
              onEdit={handleEditCourse}
              onDelete={handleDeleteCourse}
              selectedCourses={selectedCourses}
              onSelectCourse={handleSelectCourse}
              onSelectAll={handleSelectAll}
              isAllSelected={
                selectedCourses.length === courses.length && courses.length > 0
              }
              formatCurrency={formatCurrency}
            />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center mt-12"
            >
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        page === pageNum
                          ? "text-white bg-indigo-600 border border-indigo-600"
                          : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                )}

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default InstructorCourses;

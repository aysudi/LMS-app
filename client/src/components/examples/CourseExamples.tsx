import React from "react";
import {
  useCourses,
  useCourse,
  useFeaturedCourses,
  useSearchCourses,
  useCourseFilters,
  useEnrollCourse,
  useRateCourse,
  useCoursePrice,
  useCourseEnrollment,
  type Course,
} from "../../hooks/useCourse";
import { useAuthContext } from "../../context/AuthContext";

// Example component showing how to use the course hooks
export const CourseExamples: React.FC = () => {
  const { user } = useAuthContext();

  // Basic course fetching
  const { data: coursesData, isLoading: coursesLoading } = useCourses({
    page: 1,
    limit: 12,
    sortBy: "rating",
    sortOrder: "desc",
  });

  // Featured courses
  const { data: featuredData, isLoading: featuredLoading } =
    useFeaturedCourses(6);

  // Course filtering
  const {
    filters,
    setSearch,
    setCategory,
    setSorting,
    resetFilters,
    hasActiveFilters,
  } = useCourseFilters();

  // Search courses based on current filters
  const { data: searchData, isLoading: searchLoading } = useSearchCourses(
    filters.search || "",
    filters,
    { enabled: !!filters.search }
  );

  // Get specific course details
  const { data: courseDetails } = useCourse("course-id-here", {
    enabled: false, // Set to true when you have a real course ID
  });

  // Course mutations
  const enrollMutation = useEnrollCourse({
    onSuccess: () => {
      console.log("Successfully enrolled in course!");
    },
    onError: (error) => {
      console.error("Failed to enroll:", error);
    },
  });

  const rateMutation = useRateCourse({
    onSuccess: () => {
      console.log("Rating submitted successfully!");
    },
  });

  // Course utilities
  const { formatPrice, isFree, hasDiscount } = useCoursePrice();
  const { isEnrolled, canEnroll } = useCourseEnrollment(user?.id);

  // Example handlers
  const handleEnroll = (courseId: string) => {
    enrollMutation.mutate(courseId);
  };

  const handleRate = (courseId: string, rating: number, comment?: string) => {
    rateMutation.mutate({
      courseId,
      ratingData: { rating, comment },
    });
  };

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm);
  };

  if (coursesLoading || featuredLoading) {
    return <div>Loading courses...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Course Search & Filters</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Search courses..."
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full p-2 border rounded"
          />

          <div className="flex gap-4">
            <select
              value={filters.category}
              onChange={(e) => setCategory(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">All Categories</option>
              <option value="development">Development</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
            </select>

            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split("-");
                setSorting(sortBy as any, sortOrder as any);
              }}
              className="p-2 border rounded"
            >
              <option value="rating-desc">Highest Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="createdAt-desc">Newest First</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Featured Courses */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Featured Courses</h2>
        {featuredLoading ? (
          <div>Loading featured courses...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredData?.data.map((course) => (
              <div key={course._id} className="border rounded-lg p-4">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <h3 className="font-bold text-lg">{course.title}</h3>
                <p className="text-gray-600 text-sm">
                  {course.shortDescription}
                </p>
                <div className="mt-2">
                  <span className="text-yellow-500">
                    ★ {course.rating.toFixed(1)} ({course.ratingsCount})
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div>
                    {isFree(course) ? (
                      <span className="text-green-600 font-bold">Free</span>
                    ) : (
                      <div>
                        <span className="text-lg font-bold">
                          {formatPrice(course.discountPrice || course.price)}
                        </span>
                        {hasDiscount(course) && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            {formatPrice(course.price)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    {user && canEnroll(course) && (
                      <button
                        onClick={() => handleEnroll(course._id)}
                        disabled={enrollMutation.isPending}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                      >
                        {enrollMutation.isPending ? "Enrolling..." : "Enroll"}
                      </button>
                    )}
                    {user && isEnrolled(course) && (
                      <span className="px-4 py-2 bg-green-100 text-green-800 rounded">
                        Enrolled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search Results */}
      {filters.search && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">
            Search Results for "{filters.search}"
          </h2>
          {searchLoading ? (
            <div>Searching...</div>
          ) : searchData?.data.length === 0 ? (
            <div>No courses found matching your search.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchData?.data.map((course) => (
                <div key={course._id} className="border rounded-lg p-4">
                  <h3 className="font-bold">{course.title}</h3>
                  <p className="text-gray-600 text-sm">{course.category}</p>
                  <div className="mt-2">
                    <span className="text-yellow-500">
                      ★ {course.rating.toFixed(1)}
                    </span>
                    <span className="ml-2 font-bold">
                      {formatPrice(course.discountPrice || course.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Courses */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">All Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {coursesData?.data.map((course) => (
            <div key={course._id} className="border rounded-lg p-4">
              <h3 className="font-bold text-sm">{course.title}</h3>
              <p className="text-gray-600 text-xs">{course.category}</p>
              <div className="text-xs mt-1">
                ★ {course.rating.toFixed(1)} • {formatPrice(course.price)}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {coursesData?.pagination && (
          <div className="flex justify-center gap-2 mt-4">
            <span className="text-sm">
              Page {coursesData.pagination.currentPage} of{" "}
              {coursesData.pagination.totalPages}
            </span>
          </div>
        )}
      </div>

      {/* Example Rating Component */}
      {courseDetails && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Rate This Course</h2>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRate(courseDetails.data._id, rating)}
                className="text-2xl text-yellow-500 hover:text-yellow-600"
              >
                ★
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseExamples;

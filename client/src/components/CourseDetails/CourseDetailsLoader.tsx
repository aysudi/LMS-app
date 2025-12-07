const CourseDetailsLoader = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Skeleton */}
      <div className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-6 bg-gray-700 rounded w-2/3 mb-6"></div>
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-700 rounded w-24"></div>
                  <div className="h-4 bg-gray-700 rounded w-24"></div>
                  <div className="h-4 bg-gray-700 rounded w-24"></div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="animate-pulse bg-white rounded-lg overflow-hidden">
                <div className="aspect-video bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-12 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsLoader;

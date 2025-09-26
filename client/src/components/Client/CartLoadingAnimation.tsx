import { motion } from "framer-motion";

const CartLoadingAnimation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            <div>
              <div className="w-48 h-8 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Skeleton */}
          <div className="lg:col-span-2">
            {/* Select All Skeleton */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
            >
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            </motion.div>

            {/* Cart Items Skeleton */}
            <div className="space-y-4">
              {[1, 2, 3].map((index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse mt-1" />
                    <div className="w-24 h-16 md:w-32 md:h-20 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="w-3/4 h-6 bg-gray-200 rounded animate-pulse mb-2" />
                          <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse mb-3" />
                          <div className="flex space-x-4 mb-3">
                            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                          </div>
                          <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse" />
                        </div>
                        <div className="ml-4">
                          <div className="w-16 h-8 bg-gray-200 rounded animate-pulse mb-1" />
                          <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <div className="flex space-x-4">
                          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Checkout Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-xl p-6 border border-gray-200"
              >
                <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-6" />

                {/* Selected Items */}
                <div className="mb-6">
                  <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="w-full h-3 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                  <div className="w-28 h-4 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between">
                    <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="flex justify-between">
                    <div className="w-12 h-6 bg-gray-200 rounded animate-pulse" />
                    <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>

                {/* Benefits */}
                <div className="mb-6 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>

                {/* Checkout Button */}
                <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse mb-4" />
                <div className="w-32 h-3 bg-gray-200 rounded animate-pulse mx-auto" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartLoadingAnimation;

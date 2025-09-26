import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaCreditCard,
  FaLock,
  FaCheckCircle,
  FaInfoCircle,
} from "react-icons/fa";
import { useSnackbar } from "notistack";
import { useCartHelpers } from "../../hooks/useCart";
import { useAuthContext } from "../../context/AuthContext";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthenticated } = useAuthContext();
  const { cartItems } = useCartHelpers();

  // Get selected items from cart page
  const selectedItemIds = location.state?.selectedItems || [];
  const selectedCourses = cartItems.filter((course) =>
    selectedItemIds.includes(course.id)
  );

  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/login");
    }
  }, [isAuthenticated, navigate]);

  // Redirect if no items selected
  useEffect(() => {
    if (selectedCourses.length === 0) {
      navigate("/cart");
    }
  }, [selectedCourses.length, navigate]);

  // Calculate totals
  const subtotal = selectedCourses.reduce(
    (sum, course) => sum + (course.discountPrice || course.originalPrice),
    0
  );

  const handleProcessPayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      enqueueSnackbar("Payment successful! Welcome to your courses!", {
        variant: "success",
        autoHideDuration: 4000,
      });
      navigate("/my-learning");
    }, 3000);
  };

  if (!isAuthenticated || selectedCourses.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/cart")}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaArrowLeft className="text-lg" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
                <FaLock className="text-green-600" />
                <span>Secure Checkout</span>
              </h1>
              <p className="text-gray-600 mt-1">
                Complete your purchase for {selectedCourses.length} course
                {selectedCourses.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-xl p-8 border border-gray-200"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Payment Information
              </h2>

              {/* Payment Method Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Payment Method
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 border-blue-500 bg-blue-50">
                    <input
                      type="radio"
                      name="payment"
                      value="credit-card"
                      checked={paymentMethod === "credit-card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-blue-600"
                    />
                    <FaCreditCard className="ml-3 text-blue-600" />
                    <span className="ml-3 font-medium">Credit/Debit Card</span>
                  </label>
                </div>
              </div>

              {/* Card Form */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 text-green-700">
                  <FaLock className="text-sm" />
                  <span className="text-sm font-medium">
                    Your payment information is secure and encrypted
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-xl p-6 border border-gray-200"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Order Summary
                </h2>

                {/* Course List */}
                <div className="space-y-4 mb-6">
                  {selectedCourses.map((course) => (
                    <div key={course.id} className="flex items-start space-x-3">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {course.title}
                        </h4>
                        <p className="text-xs text-gray-600">
                          By {course.instructor.firstName}{" "}
                          {course.instructor.lastName}
                        </p>
                        <p className="text-sm font-bold text-gray-900 mt-1">
                          ${course.discountPrice || course.originalPrice}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                    <span>Total:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Benefits */}
                <div className="mt-6 space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <FaCheckCircle className="text-xs" />
                    <span>Lifetime access</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <FaCheckCircle className="text-xs" />
                    <span>Mobile and TV access</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <FaCheckCircle className="text-xs" />
                    <span>Certificate of completion</span>
                  </div>
                </div>

                {/* Complete Purchase Button */}
                <button
                  onClick={handleProcessPayment}
                  disabled={isProcessing}
                  className="w-full mt-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <FaCreditCard className="text-lg" />
                      <span>Complete Purchase</span>
                    </>
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <FaInfoCircle />
                  <span>30-Day Money-Back Guarantee</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

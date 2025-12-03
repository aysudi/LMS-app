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
import { Elements } from "@stripe/react-stripe-js";
import { useCartHelpers, useClearCart } from "../../hooks/useCart";
import { useAuthContext } from "../../context/AuthContext";
import {
  useCreateOrder,
  useCreatePaymentIntent,
  useConfirmPayment,
} from "../../hooks/usePayment";
import { stripePromise, stripeConfig } from "../../utils/stripe";
import StripePaymentForm from "../../components/Client/Cart/StripePaymentForm";
import type { CreateOrderRequest } from "../../services/payment.service";
import { getImageUrl } from "../../utils/mediaHelpers";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuthContext();
  const { cartItems } = useCartHelpers();

  const createOrderMutation = useCreateOrder();
  const createPaymentIntentMutation = useCreatePaymentIntent();
  const confirmPaymentMutation = useConfirmPayment();
  const clearCartMutation = useClearCart();

  const selectedItemIds = location.state?.selectedItems || [];
  const selectedCourses = cartItems.filter((course) =>
    selectedItemIds.includes(course.id)
  );

  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [paymentStep, setPaymentStep] = useState<
    "order" | "payment" | "processing" | "success"
  >("order");
  const [billingInfo, setBillingInfo] = useState({
    fullName: user?.firstName ? `${user.firstName} ${user.lastName}` : "",
    email: user?.email || "",
    country: "",
    state: "",
    city: "",
    postalCode: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (selectedCourses.length === 0) {
      navigate("/cart");
    }
  }, [selectedCourses.length, navigate]);

  const subtotal = selectedCourses.reduce(
    (sum, course) => sum + (course.discountPrice || course.originalPrice),
    0
  );

  const handleCreateOrder = async () => {
    try {
      const orderData: CreateOrderRequest = {
        items: selectedCourses.map((course) => ({
          course: course.id,
          price: course.originalPrice,
          discountPrice: course.discountPrice,
        })),
        billingAddress: billingInfo,
      };

      const response = await createOrderMutation.mutateAsync(orderData);
      const order = response.data.order;
      setCurrentOrder(order);

      // Step 2: Create payment intent
      const paymentResponse = await createPaymentIntentMutation.mutateAsync({
        orderId: order._id,
        amount: order.total,
        currency: "usd",
      });

      setClientSecret(paymentResponse.clientSecret);
      setPaymentStep("payment");
    } catch (error) {
      console.error("Order creation failed:", error);
    }
  };

  const handlePaymentSuccess = async (paymentIntent: any) => {
    try {
      setPaymentStep("processing");

      await confirmPaymentMutation.mutateAsync({
        orderId: currentOrder._id,
        paymentIntentId: paymentIntent.id,
        paymentMethodId: paymentIntent.payment_method,
      });

      await clearCartMutation.mutateAsync();

      setPaymentStep("success");

      setTimeout(() => {
        navigate("/my-learning");
      }, 2000);
    } catch (error) {
      console.error("Payment confirmation failed:", error);
      setPaymentStep("payment");
    }
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
    setPaymentStep("payment");
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

              {/* Billing Information Form */}
              {paymentStep === "order" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Billing Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={billingInfo.fullName}
                        onChange={(e) =>
                          setBillingInfo({
                            ...billingInfo,
                            fullName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={billingInfo.email}
                        onChange={(e) =>
                          setBillingInfo({
                            ...billingInfo,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={billingInfo.country}
                        onChange={(e) =>
                          setBillingInfo({
                            ...billingInfo,
                            country: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="United States"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State/Province
                      </label>
                      <input
                        type="text"
                        value={billingInfo.state}
                        onChange={(e) =>
                          setBillingInfo({
                            ...billingInfo,
                            state: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="California"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={billingInfo.city}
                        onChange={(e) =>
                          setBillingInfo({
                            ...billingInfo,
                            city: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Los Angeles"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={billingInfo.postalCode}
                        onChange={(e) =>
                          setBillingInfo({
                            ...billingInfo,
                            postalCode: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="90210"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleCreateOrder}
                    disabled={createOrderMutation.isPending}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {createOrderMutation.isPending ? (
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
                        <span>Creating Order...</span>
                      </>
                    ) : (
                      <>
                        <FaCreditCard className="text-lg" />
                        <span>Proceed to Payment</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Stripe Payment Form */}
              {paymentStep === "payment" && clientSecret && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: stripeConfig.appearance,
                  }}
                >
                  <StripePaymentForm
                    clientSecret={clientSecret}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                    amount={subtotal}
                  />
                </Elements>
              )}

              {/* Processing State */}
              {paymentStep === "processing" && (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
                  />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Processing Payment...
                  </h3>
                  <p className="text-gray-600">
                    Please wait while we confirm your payment
                  </p>
                </div>
              )}

              {/* Success State */}
              {paymentStep === "success" && (
                <div className="text-center py-12">
                  <FaCheckCircle className="text-6xl text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Payment Successful!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Welcome to your new courses! Redirecting to My Learning...
                  </p>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full mx-auto"
                  />
                </div>
              )}

              {/* Security Notice */}
              <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 text-green-700">
                  <FaLock className="text-sm" />
                  <span className="text-sm font-medium">
                    Your payment information is secure and encrypted by Stripe
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
                        src={getImageUrl(course.image)}
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

                {/* Order Status Info */}
                {paymentStep === "order" && (
                  <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 text-blue-700 text-sm">
                      <FaInfoCircle />
                      <span>
                        Complete billing information to proceed to payment
                      </span>
                    </div>
                  </div>
                )}

                {paymentStep === "payment" && (
                  <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2 text-green-700 text-sm">
                      <FaLock />
                      <span>Secure payment powered by Stripe</span>
                    </div>
                  </div>
                )}

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

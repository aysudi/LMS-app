import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { useToast } from "../../components/UI/ToastProvider";
import { paymentToasts } from "../../utils/toastUtils";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );

  useEffect(() => {
    const paymentIntent = searchParams.get("payment_intent");
    const redirectStatus = searchParams.get("redirect_status");

    if (redirectStatus === "succeeded" && paymentIntent) {
      setStatus("success");
      showToast(paymentToasts.success());

      setTimeout(() => {
        navigate("/my-learning");
      }, 3000);
    } else if (redirectStatus === "failed") {
      setStatus("error");
      showToast(paymentToasts.failed());

      // Redirect to cart after 3 seconds
      setTimeout(() => {
        navigate("/cart");
      }, 3000);
    } else {
      // Still processing or unknown status
      setTimeout(() => {
        if (status === "verifying") {
          setStatus("error");
          showToast(paymentToasts.failed());
        }
      }, 10000); // 10 second timeout
    }
  }, [searchParams, navigate, status]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-12 text-center"
        >
          {status === "verifying" && (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"
              />
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Verifying Payment...
              </h1>
              <p className="text-gray-600">
                Please wait while we confirm your payment with our secure
                payment processor.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <FaCheckCircle className="text-6xl text-green-600 mx-auto mb-6" />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Payment Successful!
              </h1>
              <p className="text-gray-600 mb-6">
                🎉 Congratulations! You now have access to your new courses.
                Start learning today and unlock your potential!
              </p>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-sm text-gray-500">
                Redirecting to My Learning...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <FaExclamationTriangle className="text-6xl text-red-600 mx-auto mb-6" />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Payment Issue
              </h1>
              <p className="text-gray-600 mb-6">
                We encountered an issue with your payment. Don't worry - if your
                card was charged, we'll process a refund within 3-5 business
                days.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/cart")}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  Return to Cart
                </button>
                <button
                  onClick={() => navigate("/contact")}
                  className="w-full py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-all duration-300"
                >
                  Contact Support
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccess;

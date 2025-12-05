import { useState, useEffect } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { motion } from "framer-motion";
import { FaCreditCard, FaLock, FaSpinner } from "react-icons/fa";
import { t } from "i18next";

interface StripePaymentFormProps {
  clientSecret: string;
  onPaymentSuccess: (paymentIntent: any) => void;
  onPaymentError: (error: string) => void;
  amount: number;
  disabled?: boolean;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  clientSecret,
  onPaymentSuccess,
  onPaymentError,
  amount,
  disabled = false,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!stripe || !clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (paymentIntent) {
        switch (paymentIntent.status) {
          case "succeeded":
            onPaymentSuccess(paymentIntent);
            break;
          case "processing":
            setIsProcessing(true);
            break;
          case "requires_payment_method":
            // Default state - ready for payment
            break;
          default:
            onPaymentError("Something went wrong with the payment.");
            break;
        }
      }
    });
  }, [stripe, clientSecret, onPaymentSuccess, onPaymentError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || disabled) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "An unexpected error occurred.");
        onPaymentError(error.message || "Payment failed");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onPaymentSuccess(paymentIntent);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
      onPaymentError(err.message || "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentElementOptions = {
    layout: "tabs" as const,
  };

  if (!stripe || !elements) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-3 text-gray-600">
          <FaSpinner className="animate-spin" />
          <span>Loading payment form...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Payment Element */}
      <div className="p-4 border border-gray-200 rounded-lg bg-white">
        <PaymentElement id="payment-element" options={paymentElementOptions} />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
        >
          {errorMessage}
        </motion.div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements || disabled}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer"
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
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full "
            />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <FaCreditCard className="text-lg" />
            <span>
              {t("cart.pay")} ${amount.toFixed(2)}
            </span>
          </>
        )}
      </button>

      {/* Security Notice */}
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
        <FaLock className="text-xs" />
        <span>{t("cart.paymentSecure")}</span>
      </div>
    </motion.form>
  );
};

export default StripePaymentForm;

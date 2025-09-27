import { loadStripe } from "@stripe/stripe-js";

// Get publishable key from environment variables
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.error(
    "VITE_STRIPE_PUBLISHABLE_KEY is not defined in environment variables"
  );
}

// Create Stripe instance
export const stripePromise = loadStripe(stripePublishableKey);

// Stripe configuration
export const stripeConfig = {
  publishableKey: stripePublishableKey,
  appearance: {
    theme: "stripe" as const,
    variables: {
      colorPrimary: "#3B82F6",
      colorBackground: "#ffffff",
      colorText: "#374151",
      colorDanger: "#EF4444",
      fontFamily: "system-ui, -apple-system, sans-serif",
      spacingUnit: "4px",
      borderRadius: "8px",
    },
  },
  clientOptions: {
    fonts: [
      {
        cssSrc:
          "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
      },
    ],
  },
};

export default stripePromise;

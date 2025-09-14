import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaExclamationTriangle, FaHome, FaUser } from "react-icons/fa";
import { useSnackbar } from "notistack";

const AuthError = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();

  const error = searchParams.get("error") || "Authentication failed";
  const provider = searchParams.get("provider") || "OAuth";

  useEffect(() => {
    enqueueSnackbar(`❌ ${provider} authentication failed: ${error}`, {
      variant: "error",
      autoHideDuration: 8000,
      anchorOrigin: {
        vertical: "top",
        horizontal: "right",
      },
    });
  }, [error, provider, enqueueSnackbar]);

  const handleRetry = () => {
    navigate("/auth/login", { replace: true });
  };

  const handleGoHome = () => {
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-auto"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 p-4 rounded-full">
                <FaExclamationTriangle className="text-4xl text-red-500" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Authentication Failed
            </h1>

            <p className="text-gray-600 mb-2">
              We encountered an issue while signing you in with {provider}:
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>

            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRetry}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FaUser className="text-sm" />
                <span>Try Again</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoHome}
                className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
                <FaHome className="text-sm" />
                <span>Go to Home</span>
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Additional info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center mt-6"
        >
          <p className="text-sm text-gray-500">
            Having trouble? Contact our{" "}
            <a
              href="/support"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              support team
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthError;

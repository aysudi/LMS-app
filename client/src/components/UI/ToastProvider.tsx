import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import Toast from "./Toast";

interface ToastData {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
  onUndo?: () => void;
  showUndo?: boolean;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastData, "id">) => string;
  removeToast: (id: string) => void;
  showWishlistRemovalToast: (courseTitle: string, onUndo?: () => void) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((toast: Omit<ToastData, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastData = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showWishlistRemovalToast = useCallback(
    (courseTitle: string, onUndo?: () => void) => {
      showToast({
        title: "💔 Course Removed",
        message: `"${courseTitle}" has been removed from your wishlist`,
        type: "success",
        duration: 2000,
        onUndo,
        showUndo: !!onUndo,
      });
    },
    [showToast]
  );

  const contextValue: ToastContextType = {
    showToast,
    removeToast,
    showWishlistRemovalToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast
                id={toast.id}
                title={toast.title}
                message={toast.message}
                type={toast.type}
                duration={toast.duration}
                onClose={removeToast}
                onUndo={toast.onUndo}
                showUndo={toast.showUndo}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;

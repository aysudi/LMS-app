export interface ToastConfig {
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

// Course-related toasts
export const courseToasts = {
  created: (courseTitle: string): ToastConfig => ({
    title: "✅ Course Created",
    message: `"${courseTitle}" has been created successfully`,
    type: "success",
    duration: 3000,
  }),

  updated: (courseTitle: string): ToastConfig => ({
    title: "✅ Course Updated",
    message: `"${courseTitle}" has been updated successfully`,
    type: "success",
    duration: 3000,
  }),

  deleted: (courseTitle?: string): ToastConfig => ({
    title: "✅ Course Deleted",
    message: courseTitle
      ? `"${courseTitle}" has been deleted successfully`
      : "Course has been deleted successfully",
    type: "success",
    duration: 3000,
  }),

  published: (courseTitle: string): ToastConfig => ({
    title: "🎯 Course Published",
    message: `"${courseTitle}" is now published and visible to students`,
    type: "success",
    duration: 3000,
  }),

  unpublished: (courseTitle: string): ToastConfig => ({
    title: "🎯 Course Unpublished",
    message: `"${courseTitle}" has been unpublished and hidden from students`,
    type: "success",
    duration: 3000,
  }),

  deleteError: (): ToastConfig => ({
    title: "❌ Delete Failed",
    message: "Failed to delete course. Please try again.",
    type: "error",
    duration: 4000,
  }),

  updateError: (): ToastConfig => ({
    title: "❌ Update Failed",
    message: "Failed to update course. Please try again.",
    type: "error",
    duration: 4000,
  }),

  statusToggleError: (): ToastConfig => ({
    title: "❌ Status Update Failed",
    message: "Failed to update course status. Please try again.",
    type: "error",
    duration: 4000,
  }),
};

// Section-related toasts
export const sectionToasts = {
  created: (sectionTitle: string): ToastConfig => ({
    title: "✅ Section Added",
    message: `"${sectionTitle}" has been added to the course`,
    type: "success",
    duration: 3000,
  }),

  updated: (sectionTitle: string): ToastConfig => ({
    title: "✅ Section Updated",
    message: `"${sectionTitle}" has been updated successfully`,
    type: "success",
    duration: 3000,
  }),

  deleted: (sectionTitle: string): ToastConfig => ({
    title: "✅ Section Deleted",
    message: `"${sectionTitle}" has been removed from the course`,
    type: "success",
    duration: 3000,
  }),

  error: (action: string): ToastConfig => ({
    title: "❌ Section Error",
    message: `Failed to ${action} section. Please try again.`,
    type: "error",
    duration: 4000,
  }),
};

// Lesson-related toasts
export const lessonToasts = {
  created: (lessonTitle: string): ToastConfig => ({
    title: "✅ Lesson Added",
    message: `"${lessonTitle}" has been added to the section`,
    type: "success",
    duration: 3000,
  }),

  updated: (lessonTitle: string): ToastConfig => ({
    title: "✅ Lesson Updated",
    message: `"${lessonTitle}" has been updated successfully`,
    type: "success",
    duration: 3000,
  }),

  deleted: (lessonTitle: string): ToastConfig => ({
    title: "✅ Lesson Deleted",
    message: `"${lessonTitle}" has been removed from the section`,
    type: "success",
    duration: 3000,
  }),

  error: (action: string): ToastConfig => ({
    title: "❌ Lesson Error",
    message: `Failed to ${action} lesson. Please try again.`,
    type: "error",
    duration: 4000,
  }),
};

// User-related toasts
export const userToasts = {
  loginSuccess: (userName?: string): ToastConfig => ({
    title: "✅ Welcome Back!",
    message: userName
      ? `Welcome back, ${userName}!`
      : "You have been logged in successfully",
    type: "success",
    duration: 3000,
  }),

  logoutSuccess: (): ToastConfig => ({
    title: "✅ Logged Out",
    message: "You have been logged out successfully",
    type: "success",
    duration: 3000,
  }),

  profileUpdated: (): ToastConfig => ({
    title: "✅ Profile Updated",
    message: "Your profile has been updated successfully",
    type: "success",
    duration: 3000,
  }),

  passwordChanged: (): ToastConfig => ({
    title: "✅ Password Changed",
    message: "Your password has been updated successfully",
    type: "success",
    duration: 3000,
  }),

  error: (action: string): ToastConfig => ({
    title: "❌ Error",
    message: `Failed to ${action}. Please try again.`,
    type: "error",
    duration: 4000,
  }),
};

// General toasts
export const generalToasts = {
  success: (title: string, message: string): ToastConfig => ({
    title: `✅ ${title}`,
    message,
    type: "success",
    duration: 3000,
  }),

  error: (title: string, message: string): ToastConfig => ({
    title: `❌ ${title}`,
    message,
    type: "error",
    duration: 4000,
  }),

  info: (title: string, message: string): ToastConfig => ({
    title: `ℹ️ ${title}`,
    message,
    type: "info",
    duration: 3000,
  }),

  warning: (title: string, message: string): ToastConfig => ({
    title: `⚠️ ${title}`,
    message,
    type: "warning",
    duration: 4000,
  }),

  saved: (itemName: string): ToastConfig => ({
    title: "✅ Saved",
    message: `${itemName} has been saved successfully`,
    type: "success",
    duration: 3000,
  }),

  networkError: (): ToastConfig => ({
    title: "❌ Network Error",
    message: "Please check your internet connection and try again",
    type: "error",
    duration: 5000,
  }),

  unauthorized: (): ToastConfig => ({
    title: "❌ Access Denied",
    message: "You don't have permission to perform this action",
    type: "error",
    duration: 4000,
  }),
};

// Cart and enrollment toasts
export const cartToasts = {
  added: (courseTitle: string): ToastConfig => ({
    title: "🛒 Added to Cart",
    message: `"${courseTitle}" has been added to your cart`,
    type: "success",
    duration: 3000,
  }),

  removed: (courseTitle: string): ToastConfig => ({
    title: "🛒 Removed from Cart",
    message: `"${courseTitle}" has been removed from your cart`,
    type: "success",
    duration: 3000,
  }),

  enrolled: (courseTitle: string): ToastConfig => ({
    title: "🎉 Enrollment Successful",
    message: `You're now enrolled in "${courseTitle}"`,
    type: "success",
    duration: 4000,
  }),

  wishlistAdded: (courseTitle: string): ToastConfig => ({
    title: "💖 Added to Wishlist",
    message: `"${courseTitle}" has been added to your wishlist`,
    type: "success",
    duration: 3000,
  }),

  wishlistRemoved: (courseTitle: string): ToastConfig => ({
    title: "💔 Removed from Wishlist",
    message: `"${courseTitle}" has been removed from your wishlist`,
    type: "success",
    duration: 3000,
  }),
};

// Payment toasts
export const paymentToasts = {
  success: (amount: string): ToastConfig => ({
    title: "🎉 Payment Successful",
    message: `Your payment of ${amount} has been processed successfully`,
    type: "success",
    duration: 4000,
  }),

  failed: (): ToastConfig => ({
    title: "❌ Payment Failed",
    message: "Your payment could not be processed. Please try again.",
    type: "error",
    duration: 5000,
  }),

  cancelled: (): ToastConfig => ({
    title: "⚠️ Payment Cancelled",
    message: "Your payment has been cancelled",
    type: "warning",
    duration: 3000,
  }),
};

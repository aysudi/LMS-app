export interface ToastConfig {
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

// Course-related toasts
export const courseToasts = {
  created: (courseTitle: string): ToastConfig => ({
    type: "success",
    title: "Course Created",
    message: `"${courseTitle}" has been created successfully!`,
    duration: 4000,
  }),

  updated: (courseTitle: string): ToastConfig => ({
    type: "success",
    title: "Course Updated",
    message: `"${courseTitle}" has been updated successfully!`,
    duration: 4000,
  }),

  deleted: (courseTitle?: string): ToastConfig => ({
    type: "success",
    title: "Course Deleted",
    message: courseTitle
      ? `"${courseTitle}" has been deleted successfully!`
      : "Course has been deleted successfully!",
    duration: 4000,
  }),

  completed: (): ToastConfig => ({
    type: "success",
    title: "Course Completed",
    message: `🎉 Congratulations! You have completed the course!`,
    duration: 3000,
  }),

  published: (courseTitle: string): ToastConfig => ({
    type: "success",
    title: "Course Published",
    message: `"${courseTitle}" is now live and visible to students!`,
    duration: 4000,
  }),

  unpublished: (courseTitle: string): ToastConfig => ({
    type: "info",
    title: "Course Unpublished",
    message: `"${courseTitle}" has been unpublished and is no longer visible to new students.`,
    duration: 4000,
  }),

  bulkPublished: (count: number): ToastConfig => ({
    type: "success",
    title: "Courses Published",
    message: `${count} course${count > 1 ? "s" : ""} published successfully!`,
    duration: 4000,
  }),

  bulkUnpublished: (count: number): ToastConfig => ({
    type: "info",
    title: "Courses Unpublished",
    message: `${count} course${count > 1 ? "s" : ""} unpublished successfully!`,
    duration: 4000,
  }),

  createError: (): ToastConfig => ({
    type: "error",
    title: "Create Failed",
    message: "Failed to create course. Please try again.",
    duration: 4000,
  }),

  updateError: (): ToastConfig => ({
    type: "error",
    title: "Update Failed",
    message:
      "Failed to update course. Please check your connection and try again.",
    duration: 4000,
  }),

  deleteError: (): ToastConfig => ({
    type: "error",
    title: "Delete Failed",
    message: "Failed to delete course. Please try again.",
    duration: 4000,
  }),

  statusToggleError: (): ToastConfig => ({
    type: "error",
    title: "Status Update Failed",
    message: "Failed to update course status. Please try again.",
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

  completed: (): ToastConfig => ({
    title: "Lesson Completed",
    message: `🎉 Congratulations! You have completed the lesson`,
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
  success: (): ToastConfig => ({
    title: "🎉 Payment Successful",
    message: `Your payment has been processed successfully`,
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

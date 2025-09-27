import { useState } from "react";
import { useToast } from "../components/UI/ToastProvider";
import { useToggleWishlist } from "./useWishlist";

interface UseWishlistToastOptions {
  onRemoveSuccess?: (courseId: string) => void;
  onRemoveError?: (error: any) => void;
}

export const useWishlistToast = (options: UseWishlistToastOptions = {}) => {
  const { showWishlistRemovalToast, showToast } = useToast();
  const { toggleWishlist } = useToggleWishlist();
  const [isRemoving, setIsRemoving] = useState(false);

  const removeFromWishlistWithToast = async (
    courseId: string,
    courseTitle: string,
    enableUndo: boolean = true
  ) => {
    setIsRemoving(true);

    try {
      // Store the original state for potential undo
      let isUndone = false;

      const undoAction = enableUndo
        ? async () => {
            if (!isUndone) {
              isUndone = true;
              try {
                await toggleWishlist(courseId, false); // Add back to wishlist
                showToast({
                  title: "💖 Course Restored",
                  message: `"${courseTitle}" has been added back to your wishlist`,
                  type: "success",
                  duration: 3000,
                });
              } catch (undoError) {
                showToast({
                  title: "❌ Undo Failed",
                  message: "Failed to restore course to wishlist",
                  type: "error",
                  duration: 4000,
                });
              }
            }
          }
        : undefined;

      // Remove from wishlist
      await toggleWishlist(courseId, true);

      // Show success toast with undo option
      showWishlistRemovalToast(courseTitle, undoAction);

      // Call success callback
      options.onRemoveSuccess?.(courseId);
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);

      // Show error toast
      showToast({
        title: "❌ Removal Failed",
        message: "Failed to remove course from wishlist. Please try again.",
        type: "error",
        duration: 4000,
      });

      // Call error callback
      options.onRemoveError?.(error);
    } finally {
      setIsRemoving(false);
    }
  };

  const removeBulkFromWishlistWithToast = async (
    courses: Array<{ id: string; title: string }>,
    onProgress?: (current: number, total: number) => void
  ) => {
    setIsRemoving(true);

    try {
      const total = courses.length;
      let successCount = 0;
      let failedCourses: string[] = [];

      for (let i = 0; i < courses.length; i++) {
        const course = courses[i];
        onProgress?.(i + 1, total);

        try {
          await toggleWishlist(course.id, true);
          successCount++;
        } catch (error) {
          console.error(`Failed to remove course ${course.id}:`, error);
          failedCourses.push(course.title);
        }

        // Small delay to prevent overwhelming the server
        if (i < courses.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      // Show appropriate toast based on results
      if (successCount === total) {
        showToast({
          title: "🎉 Bulk Removal Complete",
          message: `Successfully removed ${successCount} course${
            successCount > 1 ? "s" : ""
          } from wishlist`,
          type: "success",
          duration: 4000,
        });
      } else if (successCount > 0) {
        showToast({
          title: "⚠️ Partial Success",
          message: `Removed ${successCount} of ${total} courses. ${failedCourses.length} failed.`,
          type: "warning",
          duration: 5000,
        });
      } else {
        showToast({
          title: "❌ Bulk Removal Failed",
          message: "Failed to remove courses from wishlist. Please try again.",
          type: "error",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Bulk removal error:", error);
      showToast({
        title: "❌ Operation Failed",
        message: "An error occurred during bulk removal. Please try again.",
        type: "error",
        duration: 4000,
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return {
    removeFromWishlistWithToast,
    removeBulkFromWishlistWithToast,
    isRemoving,
  };
};

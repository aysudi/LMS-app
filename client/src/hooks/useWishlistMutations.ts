import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationOptions } from "@tanstack/react-query";
import {
  addToWishlist,
  removeFromWishlist,
} from "../services/wishlist.service";
import type { WishlistActionResponse } from "../types/wishlist.type";
import { wishlistQueryKeys } from "./useWishlistQueries";
import { courseQueryKeys } from "./useCourseQueries";

export const useAddToWishlist = (
  options?: UseMutationOptions<WishlistActionResponse, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToWishlist,
    onSuccess: (_, courseId) => {
      // Invalidate wishlist to refresh the data
      queryClient.invalidateQueries({
        queryKey: wishlistQueryKeys.list(),
      });

      // Optionally invalidate course details to update wishlist status
      queryClient.invalidateQueries({
        queryKey: courseQueryKeys.detail(courseId),
      });
    },
    onError: (error) => {
      console.error("Error adding to wishlist:", error);
    },
    ...options,
  });
};

export const useRemoveFromWishlist = (
  options?: UseMutationOptions<WishlistActionResponse, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFromWishlist,
    onSuccess: (_, courseId) => {
      // Invalidate wishlist to refresh the data
      queryClient.invalidateQueries({
        queryKey: wishlistQueryKeys.list(),
      });

      // Optionally invalidate course details to update wishlist status
      queryClient.invalidateQueries({
        queryKey: courseQueryKeys.detail(courseId),
      });
    },
    onError: (error) => {
      console.error("Error removing from wishlist:", error);
    },
    ...options,
  });
};

export const useToggleWishlist = () => {
  const addMutation = useAddToWishlist();
  const removeMutation = useRemoveFromWishlist();

  const toggleWishlist = (courseId: string, isCurrentlyInWishlist: boolean) => {
    if (isCurrentlyInWishlist) {
      return removeMutation.mutate(courseId);
    } else {
      return addMutation.mutate(courseId);
    }
  };

  return {
    toggleWishlist,
    isLoading: addMutation.isPending || removeMutation.isPending,
    error: addMutation.error || removeMutation.error,
    isSuccess: addMutation.isSuccess || removeMutation.isSuccess,
    isAddingToWishlist: addMutation.isPending,
    isRemovingFromWishlist: removeMutation.isPending,
  };
};

// Hook for optimistic updates (for better UX)
export const useOptimisticWishlist = () => {
  const queryClient = useQueryClient();
  const addMutation = useAddToWishlist();
  const removeMutation = useRemoveFromWishlist();

  const optimisticToggle = (
    courseId: string,
    isCurrentlyInWishlist: boolean
  ) => {
    // Optimistically update the cache
    queryClient.setQueryData(wishlistQueryKeys.list(), (oldData: any) => {
      if (!oldData) return oldData;

      if (isCurrentlyInWishlist) {
        // Remove from wishlist optimistically
        return {
          ...oldData,
          data: {
            ...oldData.data,
            wishlist: oldData.data.wishlist.filter(
              (course: any) => course.id !== courseId
            ),
          },
        };
      } else {
        // We can't add optimistically without course data
        // Just proceed with the mutation
        return oldData;
      }
    });

    // Perform the actual mutation
    if (isCurrentlyInWishlist) {
      return removeMutation.mutate(courseId, {
        onError: () => {
          // Revert on error
          queryClient.invalidateQueries({
            queryKey: wishlistQueryKeys.list(),
          });
        },
      });
    } else {
      return addMutation.mutate(courseId, {
        onError: () => {
          // Revert on error
          queryClient.invalidateQueries({
            queryKey: wishlistQueryKeys.list(),
          });
        },
      });
    }
  };

  return {
    optimisticToggle,
    isLoading: addMutation.isPending || removeMutation.isPending,
    error: addMutation.error || removeMutation.error,
  };
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToCart, removeFromCart, clearCart } from "../services/cart.service";
import { cartQueryKeys } from "./useCartQueries";
import { wishlistQueryKeys } from "./useWishlistQueries";

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => addToCart(courseId),
    onSuccess: () => {
      // Invalidate and refetch cart queries
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.all });

      // Also invalidate wishlist in case the course was moved from wishlist to cart
      queryClient.invalidateQueries({ queryKey: wishlistQueryKeys.all });
    },
    onError: (error) => {
      console.error("Failed to add to cart:", error);
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => removeFromCart(courseId),
    onSuccess: () => {
      // Invalidate and refetch cart queries
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.all });
    },
    onError: (error) => {
      console.error("Failed to remove from cart:", error);
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      // Invalidate and refetch cart queries
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.all });
    },
    onError: (error) => {
      console.error("Failed to clear cart:", error);
    },
  });
};

export const useToggleCart = () => {
  const addToCartMutation = useAddToCart();
  const removeFromCartMutation = useRemoveFromCart();

  return {
    toggleCart: (courseId: string, isInCart: boolean) => {
      if (isInCart) {
        return removeFromCartMutation.mutateAsync(courseId);
      } else {
        return addToCartMutation.mutateAsync(courseId);
      }
    },
    isLoading: addToCartMutation.isPending || removeFromCartMutation.isPending,
  };
};

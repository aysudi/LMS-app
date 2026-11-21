import type { Course } from "../types/course.type";
import { useCart } from "./useCartQueries";

export { useCart, useIsInCart, cartQueryKeys } from "./useCartQueries";

export {
  useAddToCart,
  useRemoveFromCart,
  useClearCart,
  useToggleCart,
} from "./useCartMutations";

export const useCartHelpers = () => {
  const {
    data: cartData,
    isLoading: isLoadingCart,
    error: cartError,
  } = useCart();

  const getCartItems = () => cartData?.data || [];

  const getCartCount = () => cartData?.totalItems || 0;

  const getCartTotalValue = () => cartData?.totalValue || 0;

  const checkIfInCartLocal = (courseId: string) => {
    return (
      cartData?.data?.some((course: Course) => course.id === courseId) || false
    );
  };

  return {
    cartItems: getCartItems(),
    cartCount: getCartCount(),
    cartTotalValue: getCartTotalValue(),
    checkIfInCartLocal,
    isLoadingCart,
    isLoadingCartCount: isLoadingCart,
    cartError,
    cartCountError: cartError,
  };
};

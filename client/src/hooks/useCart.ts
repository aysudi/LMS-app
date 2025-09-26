import type { Course } from "../types/course.type";
import { useCart, useCartCount } from "./useCartQueries";

export {
  useCart,
  useCartCount,
  useIsInCart,
  cartQueryKeys,
} from "./useCartQueries";

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

  const {
    data: cartCountData,
    isLoading: isLoadingCartCount,
    error: cartCountError,
  } = useCartCount();

  const getCartItems = () => cartData?.data || [];

  const getCartCount = () => cartCountData?.data?.count || 0;

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
    isLoadingCartCount,
    cartError,
    cartCountError,
  };
};

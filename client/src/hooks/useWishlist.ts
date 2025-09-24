import type { Course } from "../types/course.type";
import { useWishlist } from "./useWishlistQueries";

export {
  useWishlist,
  useIsInWishlist,
  wishlistQueryKeys,
} from "./useWishlistQueries";

export {
  useAddToWishlist,
  useRemoveFromWishlist,
  useToggleWishlist,
  useOptimisticWishlist,
} from "./useWishlistMutations";

export const useWishlistHelpers = () => {
  const {
    data: wishlistData,
    isLoading: isLoadingWishlist,
    error,
  } = useWishlist();

  const getWishlistItems = () => wishlistData?.data || [];

  const getWishlistCount = () => wishlistData?.data.length || 0;

  const checkIfInWishlist = (courseId: string) => {
    return (
      wishlistData?.data.some((course: Course) => course.id === courseId) ||
      false
    );
  };

  return {
    wishlistItems: getWishlistItems(),
    wishlistCount: getWishlistCount(),
    checkIfInWishlist,
    isLoadingWishlist,
    error,
  };
};

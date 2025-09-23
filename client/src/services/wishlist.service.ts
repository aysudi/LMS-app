import { api } from "./api";
import type { Course } from "../types/course.type";
import type {
  WishlistResponse,
  WishlistActionResponse,
} from "../types/wishlist.type";

export const getWishlist = async (): Promise<WishlistResponse> => {
  const response = await api.get("/api/wishlist");
  return response.data;
};

export const addToWishlist = async (
  courseId: string
): Promise<WishlistActionResponse> => {
  const response = await api.post(`/api/wishlist/${courseId}`);
  return response.data;
};

export const removeFromWishlist = async (
  courseId: string
): Promise<WishlistActionResponse> => {
  const response = await api.delete(`/api/wishlist/${courseId}`);
  return response.data;
};

export const checkIfInWishlist = (
  wishlist: Course[],
  courseId: string
): boolean => {
  return wishlist.some((course) => course.id === courseId);
};

export type { WishlistResponse, WishlistActionResponse };

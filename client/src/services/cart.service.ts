import { api } from "./api";
import type { Course } from "../types/course.type";
import type {
  CartResponse,
  CartActionResponse,
  CartSummaryResponse,
  CartCountResponse,
  CartCheckResponse,
} from "../types/cart.type";

// Get user's cart with full course details
export const getCart = async (): Promise<CartResponse> => {
  const response = await api.get("/api/cart");
  return response.data;
};

// Add course to cart
export const addToCart = async (
  courseId: string
): Promise<CartActionResponse> => {
  const response = await api.post(`/api/cart/${courseId}`);
  return response.data;
};

// Remove course from cart
export const removeFromCart = async (
  courseId: string
): Promise<CartActionResponse> => {
  const response = await api.delete(`/api/cart/${courseId}`);
  return response.data;
};

// Clear entire cart
export const clearCart = async (): Promise<CartActionResponse> => {
  const response = await api.delete("/api/cart/clear");
  return response.data;
};

// Get cart summary (for header display)
export const getCartSummary = async (): Promise<CartSummaryResponse> => {
  const response = await api.get("/api/cart/summary");
  return response.data;
};

// Get cart count
export const getCartCount = async (): Promise<CartCountResponse> => {
  const response = await api.get("/api/cart/count");
  return response.data;
};

// Check if course is in cart
export const checkIfInCart = async (
  courseId: string
): Promise<CartCheckResponse> => {
  const response = await api.get(`/api/cart/check/${courseId}`);
  return response.data;
};

// Local utility function to check if course is in cart array
export const checkIfInCartLocal = (
  cart: Course[],
  courseId: string
): boolean => {
  return cart.some((course) => course.id === courseId);
};

export type {
  CartResponse,
  CartActionResponse,
  CartSummaryResponse,
  CartCountResponse,
  CartCheckResponse,
};

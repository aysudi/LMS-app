import type { Course } from "./course.type";

export interface WishlistItem extends Course {
  addedAt?: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  courses: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface WishlistResponse {
  success: boolean;
  message: string;
  data: {
    wishlist: Course[];
  };
}

export interface WishlistActionResponse {
  success: boolean;
  message: string;
  data: {
    courseId: string;
  };
}

export interface WishlistStats {
  totalItems: number;
  totalValue: number;
  categories: string[];
  averageRating: number;
}

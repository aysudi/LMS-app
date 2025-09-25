import type { Course } from "./course.type";

export interface CartItem {
  courseId: Course;
  addedAt: Date;
  priceAtTimeOfAdding: number;
}

export interface CartResponse {
  success: boolean;
  message: string;
  data: Course[];
  totalItems: number;
  totalValue: number;
}

export interface CartActionResponse {
  success: boolean;
  message: string;
  data?: {
    courseId: string;
  };
}

export interface CartSummaryResponse {
  success: boolean;
  data: {
    totalItems: number;
    totalValue: number;
  };
}

export interface CartCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

export interface CartCheckResponse {
  success: boolean;
  data: {
    isInCart: boolean;
  };
}

import type {
  CreateReviewData,
  Review,
  ReviewsResponse,
  UpdateReviewData,
} from "../types/review.types";
import { api } from "./api";

export interface CreateReviewResponse {
  success: boolean;
  message: string;
  review: Review;
  newAverageRating: number;
}

class ReviewService {
  // Get all reviews for a course
  async getCourseReviews(
    courseId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ReviewsResponse> {
    try {
      const response = await api.get(
        `/api/courses/${courseId}/reviews?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching course reviews:", error);
      throw error;
    }
  }

  // Add a new review
  async addReview(
    courseId: string,
    reviewData: CreateReviewData
  ): Promise<CreateReviewResponse> {
    try {
      const response = await api.post(
        `/api/courses/${courseId}/reviews`,
        reviewData
      );
      return response.data;
    } catch (error) {
      console.error("Error adding review:", error);
      throw error;
    }
  }

  // Update an existing review
  async updateReview(
    courseId: string,
    reviewId: string,
    reviewData: UpdateReviewData
  ): Promise<CreateReviewResponse> {
    try {
      const response = await api.put(
        `/api/courses/${courseId}/reviews/${reviewId}`,
        reviewData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating review:", error);
      throw error;
    }
  }

  // Delete a review
  async deleteReview(
    courseId: string,
    reviewId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(
        `/api/courses/${courseId}/reviews/${reviewId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting review:", error);
      throw error;
    }
  }
}

export const reviewService = new ReviewService();

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reviewService } from "../services/review.service";
import type {
  CreateReviewData,
  UpdateReviewData,
  Review,
} from "../types/review.types";
import type { CreateReviewResponse } from "../services/review.service";
import { toast } from "react-hot-toast";

// Get course reviews
export const useGetCourseReviews = (
  courseId: string,
  page: number = 1,
  limit: number = 10
) => {
  return useQuery({
    queryKey: ["courseReviews", courseId, page, limit],
    queryFn: () => reviewService.getCourseReviews(courseId, page, limit),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Add review mutation
export const useAddReview = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewData: CreateReviewData) =>
      reviewService.addReview(courseId, reviewData),
    onSuccess: (data: CreateReviewResponse) => {
      toast.success(data.message || "Review added successfully!");
      queryClient.invalidateQueries({ queryKey: ["courseReviews", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to add review";
      toast.error(errorMessage);
    },
  });
};

// Update review mutation
export const useUpdateReview = (courseId: string, reviewId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewData: UpdateReviewData) =>
      reviewService.updateReview(courseId, reviewId, reviewData),
    onSuccess: (data: CreateReviewResponse) => {
      toast.success(data.message || "Review updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["courseReviews", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to update review";
      toast.error(errorMessage);
    },
  });
};

// Delete review mutation
export const useDeleteReview = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) =>
      reviewService.deleteReview(courseId, reviewId),
    onSuccess: (data: { success: boolean; message: string }) => {
      toast.success(data.message || "Review deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["courseReviews", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to delete review";
      toast.error(errorMessage);
    },
  });
};

// Review form hook
export const useReviewForm = () => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const resetForm = () => {
    setRating(0);
    setComment("");
    setHoverRating(0);
    setIsEditing(false);
    setEditingReview(null);
  };

  const startEditing = (review: Review) => {
    setRating(review.rating);
    setComment(review.comment);
    setIsEditing(true);
    setEditingReview(review);
  };

  const cancelEditing = () => {
    resetForm();
  };

  return {
    rating,
    setRating,
    comment,
    setComment,
    hoverRating,
    setHoverRating,
    isEditing,
    editingReview,
    resetForm,
    startEditing,
    cancelEditing,
  };
};

// Review pagination hook
export const useReviewPagination = (totalPages: number) => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  return {
    currentPage,
    goToPage,
    nextPage,
    prevPage,
    resetPagination,
    hasNext: currentPage < totalPages,
    hasPrevious: currentPage > 1,
  };
};

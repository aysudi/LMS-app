import { useState, useCallback } from "react";
import { useSnackbar } from "notistack";
import {
  useReplyToMessage,
  useMarkMessageAsRead,
  useMarkMessageAsResolved,
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
  useUpdatePayoutStatus,
} from "./useInstructor";
import type {
  ReplyToMessageData,
  CreateSectionData,
  UpdateSectionData,
  CreateLessonData,
  UpdateLessonData,
  UpdatePayoutStatusData,
} from "../types/instructor.type";

// Message Management Helper Hook
export const useInstructorMessaging = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [processingMessages, setProcessingMessages] = useState<Set<string>>(
    new Set()
  );

  const replyMutation = useReplyToMessage({
    onMutate: (variables) => {
      setProcessingMessages((prev) => new Set(prev).add(variables.messageId));
    },
    onSuccess: () => {
      enqueueSnackbar("Reply sent successfully!", { variant: "success" });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to send reply";
      enqueueSnackbar(message, { variant: "error" });
    },
    onSettled: (_, __, variables) => {
      setProcessingMessages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(variables.messageId);
        return newSet;
      });
    },
  });

  const markAsReadMutation = useMarkMessageAsRead({
    onSuccess: () => {
      enqueueSnackbar("Message marked as read", { variant: "success" });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to mark as read";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const markAsResolvedMutation = useMarkMessageAsResolved({
    onSuccess: () => {
      enqueueSnackbar("Message resolved successfully", { variant: "success" });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to resolve message";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const handleReply = useCallback(
    (messageId: string, data: ReplyToMessageData) => {
      replyMutation.mutate({ messageId, data });
    },
    [replyMutation]
  );

  const handleMarkAsRead = useCallback(
    (messageId: string) => {
      markAsReadMutation.mutate(messageId);
    },
    [markAsReadMutation]
  );

  const handleMarkAsResolved = useCallback(
    (messageId: string) => {
      markAsResolvedMutation.mutate(messageId);
    },
    [markAsResolvedMutation]
  );

  const isProcessing = useCallback(
    (messageId: string) => processingMessages.has(messageId),
    [processingMessages]
  );

  return {
    handleReply,
    handleMarkAsRead,
    handleMarkAsResolved,
    isProcessing,
    isReplying: replyMutation.isPending,
    isMarkingRead: markAsReadMutation.isPending,
    isMarkingResolved: markAsResolvedMutation.isPending,
  };
};

// Course Content Management Helper Hook
export const useInstructorCourseContent = () => {
  const { enqueueSnackbar } = useSnackbar();

  // Section Management
  const createSectionMutation = useCreateSection({
    onSuccess: () => {
      enqueueSnackbar("Section created successfully!", { variant: "success" });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to create section";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const updateSectionMutation = useUpdateSection({
    onSuccess: () => {
      enqueueSnackbar("Section updated successfully!", { variant: "success" });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to update section";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const deleteSectionMutation = useDeleteSection({
    onSuccess: () => {
      enqueueSnackbar("Section deleted successfully!", { variant: "success" });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to delete section";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  // Lesson Management
  const createLessonMutation = useCreateLesson({
    onSuccess: () => {
      enqueueSnackbar("Lesson created successfully!", { variant: "success" });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to create lesson";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const updateLessonMutation = useUpdateLesson({
    onSuccess: () => {
      enqueueSnackbar("Lesson updated successfully!", { variant: "success" });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to update lesson";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const deleteLessonMutation = useDeleteLesson({
    onSuccess: () => {
      enqueueSnackbar("Lesson deleted successfully!", { variant: "success" });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to delete lesson";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  // Helper functions
  const handleCreateSection = useCallback(
    (data: CreateSectionData) => {
      createSectionMutation.mutate(data);
    },
    [createSectionMutation]
  );

  const handleUpdateSection = useCallback(
    (sectionId: string, updateData: UpdateSectionData) => {
      updateSectionMutation.mutate({ sectionId, updateData });
    },
    [updateSectionMutation]
  );

  const handleDeleteSection = useCallback(
    (sectionId: string) => {
      if (
        window.confirm(
          "Are you sure you want to delete this section? This action cannot be undone."
        )
      ) {
        deleteSectionMutation.mutate(sectionId);
      }
    },
    [deleteSectionMutation]
  );

  const handleCreateLesson = useCallback(
    (data: CreateLessonData) => {
      createLessonMutation.mutate(data);
    },
    [createLessonMutation]
  );

  const handleUpdateLesson = useCallback(
    (courseId: string, lessonId: string, updateData: UpdateLessonData) => {
      updateLessonMutation.mutate({ courseId, lessonId, updateData });
    },
    [updateLessonMutation]
  );

  const handleDeleteLesson = useCallback(
    (courseId: string, lessonId: string, lessonTitle?: string) => {
      const message = lessonTitle
        ? `Are you sure you want to delete the lesson "${lessonTitle}"? This action cannot be undone.`
        : "Are you sure you want to delete this lesson? This action cannot be undone.";

      if (window.confirm(message)) {
        deleteLessonMutation.mutate({ courseId, lessonId });
      }
    },
    [deleteLessonMutation]
  );

  return {
    // Section methods
    handleCreateSection,
    handleUpdateSection,
    handleDeleteSection,
    isCreatingSection: createSectionMutation.isPending,
    isUpdatingSection: updateSectionMutation.isPending,
    isDeletingSection: deleteSectionMutation.isPending,

    // Lesson methods
    handleCreateLesson,
    handleUpdateLesson,
    handleDeleteLesson,
    isCreatingLesson: createLessonMutation.isPending,
    isUpdatingLesson: updateLessonMutation.isPending,
    isDeletingLesson: deleteLessonMutation.isPending,

    // General loading state
    isLoading:
      createSectionMutation.isPending ||
      updateSectionMutation.isPending ||
      deleteSectionMutation.isPending ||
      createLessonMutation.isPending ||
      updateLessonMutation.isPending ||
      deleteLessonMutation.isPending,
  };
};

// Earnings Management Helper Hook
export const useInstructorEarningsManagement = () => {
  const { enqueueSnackbar } = useSnackbar();

  const updatePayoutMutation = useUpdatePayoutStatus({
    onSuccess: () => {
      enqueueSnackbar("Payout status updated successfully!", {
        variant: "success",
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to update payout status";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const handleUpdatePayoutStatus = useCallback(
    (data: UpdatePayoutStatusData) => {
      updatePayoutMutation.mutate(data);
    },
    [updatePayoutMutation]
  );

  const requestPayout = useCallback(
    (earningIds: string[]) => {
      handleUpdatePayoutStatus({
        earningIds,
        status: "processing",
      });
    },
    [handleUpdatePayoutStatus]
  );

  return {
    handleUpdatePayoutStatus,
    requestPayout,
    isUpdatingPayout: updatePayoutMutation.isPending,
  };
};

// Analytics Helper Hook
export const useInstructorAnalytics = () => {
  const [selectedDateRange, setSelectedDateRange] = useState<{
    start: Date;
    end: Date;
  }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
  });

  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }, []);

  const formatPercentage = useCallback((value: number) => {
    return `${value.toFixed(1)}%`;
  }, []);

  const calculateGrowthRate = useCallback(
    (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    },
    []
  );

  const formatDuration = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }, []);

  return {
    selectedDateRange,
    setSelectedDateRange,
    selectedCourse,
    setSelectedCourse,
    formatCurrency,
    formatPercentage,
    calculateGrowthRate,
    formatDuration,
  };
};

// Bulk Actions Helper Hook
export const useInstructorBulkActions = () => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSelectAll, setIsSelectAll] = useState(false);

  const toggleSelectItem = useCallback((itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((itemIds: string[]) => {
    setSelectedItems(new Set(itemIds));
    setIsSelectAll(true);
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedItems(new Set());
    setIsSelectAll(false);
  }, []);

  const toggleSelectAll = useCallback(
    (itemIds: string[]) => {
      if (isSelectAll || selectedItems.size === itemIds.length) {
        deselectAll();
      } else {
        selectAll(itemIds);
      }
    },
    [isSelectAll, selectedItems.size, deselectAll, selectAll]
  );

  const isSelected = useCallback(
    (itemId: string) => selectedItems.has(itemId),
    [selectedItems]
  );

  const getSelectedCount = useCallback(
    () => selectedItems.size,
    [selectedItems]
  );

  const getSelectedItems = useCallback(
    () => Array.from(selectedItems),
    [selectedItems]
  );

  return {
    selectedItems: selectedItems,
    isSelectAll,
    toggleSelectItem,
    selectAll,
    deselectAll,
    toggleSelectAll,
    isSelected,
    getSelectedCount,
    getSelectedItems,
  };
};

import { useState, useCallback } from "react";
import type { QuestionsQuery } from "../types/qa.types";

/**
 * Hook for managing Q&A filters and search state
 */
export const useQAFilters = (initialFilters: Partial<QuestionsQuery> = {}) => {
  const [filters, setFilters] = useState<QuestionsQuery>({
    page: 1,
    limit: 10,
    sortBy: "newest",
    ...initialFilters,
  });

  const updateFilter = useCallback((key: keyof QuestionsQuery, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      // Reset to first page when changing filters (except pagination)
      ...(key !== "page" && key !== "limit" ? { page: 1 } : {}),
    }));
  }, []);

  const updateFilters = useCallback((newFilters: Partial<QuestionsQuery>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      // Reset to first page when changing multiple filters
      page: newFilters.page || 1,
    }));
  }, []);

  const resetFilters = useCallback(
    (keepPagination = false) => {
      setFilters((prev) => ({
        page: keepPagination ? prev.page : 1,
        limit: prev.limit,
        sortBy: "newest",
        ...initialFilters,
      }));
    },
    [initialFilters]
  );

  const setSearch = useCallback(
    (search: string) => {
      updateFilter("search", search || undefined);
    },
    [updateFilter]
  );

  const setLesson = useCallback(
    (lessonId: string) => {
      updateFilter("lessonId", lessonId || undefined);
    },
    [updateFilter]
  );

  const setTags = useCallback(
    (tags: string[]) => {
      updateFilter("tags", tags.length > 0 ? tags.join(",") : undefined);
    },
    [updateFilter]
  );

  const setAnswered = useCallback(
    (answered: boolean | null) => {
      updateFilter(
        "answered",
        answered === null ? undefined : answered.toString()
      );
    },
    [updateFilter]
  );

  const setSortBy = useCallback(
    (sortBy: string) => {
      updateFilter("sortBy", sortBy);
    },
    [updateFilter]
  );

  const setPage = useCallback(
    (page: number) => {
      updateFilter("page", page);
    },
    [updateFilter]
  );

  const setLimit = useCallback(
    (limit: number) => {
      updateFilter("limit", limit);
    },
    [updateFilter]
  );

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    // Specific filter setters
    setSearch,
    setLesson,
    setTags,
    setAnswered,
    setSortBy,
    setPage,
    setLimit,
    // Helper getters
    hasActiveFilters: Boolean(
      filters.search ||
        filters.lessonId ||
        filters.tags ||
        filters.answered ||
        (filters.sortBy && filters.sortBy !== "newest")
    ),
  };
};

/**
 * Hook for managing question/answer form state
 */
export const useQAFormState = () => {
  const [isAsking, setIsAsking] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [replyingToQuestionId, setReplyingToQuestionId] = useState<
    string | null
  >(null);

  const startAsking = useCallback(() => setIsAsking(true), []);
  const stopAsking = useCallback(() => setIsAsking(false), []);

  const startEditingQuestion = useCallback((questionId: string) => {
    setEditingQuestionId(questionId);
  }, []);

  const stopEditingQuestion = useCallback(() => {
    setEditingQuestionId(null);
  }, []);

  const startEditingAnswer = useCallback((answerId: string) => {
    setEditingAnswerId(answerId);
  }, []);

  const stopEditingAnswer = useCallback(() => {
    setEditingAnswerId(null);
  }, []);

  const startReplyingToQuestion = useCallback((questionId: string) => {
    setReplyingToQuestionId(questionId);
  }, []);

  const stopReplyingToQuestion = useCallback(() => {
    setReplyingToQuestionId(null);
  }, []);

  const resetAllForms = useCallback(() => {
    setIsAsking(false);
    setEditingQuestionId(null);
    setEditingAnswerId(null);
    setReplyingToQuestionId(null);
  }, []);

  return {
    isAsking,
    editingQuestionId,
    editingAnswerId,
    replyingToQuestionId,
    startAsking,
    stopAsking,
    startEditingQuestion,
    stopEditingQuestion,
    startEditingAnswer,
    stopEditingAnswer,
    startReplyingToQuestion,
    stopReplyingToQuestion,
    resetAllForms,
    // Helper getters
    isEditingQuestion: (questionId: string) => editingQuestionId === questionId,
    isEditingAnswer: (answerId: string) => editingAnswerId === answerId,
    isReplyingToQuestion: (questionId: string) =>
      replyingToQuestionId === questionId,
    hasActiveForm:
      isAsking ||
      !!editingQuestionId ||
      !!editingAnswerId ||
      !!replyingToQuestionId,
  };
};

/**
 * Hook for managing voting state and optimistic updates
 */
export const useVoteState = (
  initialVoteType?: "upvote" | "downvote" | null
) => {
  const [optimisticVote, setOptimisticVote] = useState<
    "upvote" | "downvote" | null
  >(initialVoteType || null);

  const handleVoteUpdate = useCallback(
    (newVoteType: "upvote" | "downvote" | null) => {
      setOptimisticVote(newVoteType);
    },
    []
  );

  const resetVote = useCallback(() => {
    setOptimisticVote(initialVoteType || null);
  }, [initialVoteType]);

  return {
    optimisticVote,
    handleVoteUpdate,
    resetVote,
  };
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../components/UI/ToastProvider";
import type {
  CreateQuestionData,
  UpdateQuestionData,
  CreateAnswerData,
  UpdateAnswerData,
  VoteData,
  QuestionsQuery,
} from "../types/qa.types";
import * as qaService from "../services/qa.service";

// Custom hook for Q&A toasts
const useQAToasts = () => {
  const { showToast } = useToast();

  return {
    success: (message: string) =>
      showToast({
        title: "✅ Success",
        message,
        type: "success",
        duration: 3000,
      }),
    error: (message: string) =>
      showToast({
        title: "❌ Error",
        message,
        type: "error",
        duration: 4000,
      }),
  };
};

// Query Keys
export const QA_QUERY_KEYS = {
  courseQuestions: (courseId: string) =>
    ["qa", "courses", courseId, "questions"] as const,
  courseQuestionsWithParams: (courseId: string, params: QuestionsQuery) =>
    ["qa", "courses", courseId, "questions", params] as const,
  questionDetails: (questionId: string) =>
    ["qa", "questions", questionId] as const,
} as const;

// Questions Queries
export const useQuestionsByCourse = (
  courseId: string,
  params: QuestionsQuery = {},
  options: { enabled?: boolean } = {}
) => {
  return useQuery({
    queryKey: QA_QUERY_KEYS.courseQuestionsWithParams(courseId, params),
    queryFn: () => qaService.getQuestionsByCourse(courseId, params),
    enabled: options.enabled !== false && !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

export const useQuestionDetails = (
  questionId: string,
  options: { enabled?: boolean } = {}
) => {
  return useQuery({
    queryKey: QA_QUERY_KEYS.questionDetails(questionId),
    queryFn: () => qaService.getQuestionById(questionId),
    enabled: options.enabled !== false && !!questionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Helper hooks for specific question queries
export const useQuestionsByLesson = (
  courseId: string,
  lessonId: string,
  params: Omit<QuestionsQuery, "lessonId"> = {},
  options: { enabled?: boolean } = {}
) => {
  return useQuestionsByCourse(courseId, { ...params, lessonId }, options);
};

export const useUnansweredQuestions = (
  courseId: string,
  params: Omit<QuestionsQuery, "answered"> = {},
  options: { enabled?: boolean } = {}
) => {
  return useQuestionsByCourse(
    courseId,
    { ...params, answered: "false" },
    options
  );
};

export const useSearchQuestions = (
  courseId: string,
  searchTerm: string,
  params: Omit<QuestionsQuery, "search"> = {},
  options: { enabled?: boolean } = {}
) => {
  return useQuestionsByCourse(
    courseId,
    { ...params, search: searchTerm },
    {
      ...options,
      enabled: options.enabled !== false && !!searchTerm && !!courseId,
    }
  );
};

// Question Mutations
export const useCreateQuestion = (courseId: string) => {
  const queryClient = useQueryClient();
  const toast = useQAToasts();

  return useMutation({
    mutationFn: (data: CreateQuestionData) =>
      qaService.createQuestion(courseId, data),
    onSuccess: () => {
      // Invalidate all questions queries for this course
      queryClient.invalidateQueries({
        queryKey: QA_QUERY_KEYS.courseQuestions(courseId),
      });
      toast.success("Question created successfully!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to create question";
      toast.error(message);
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();
  const toast = useQAToasts();

  return useMutation({
    mutationFn: ({
      questionId,
      data,
    }: {
      questionId: string;
      data: UpdateQuestionData;
    }) => qaService.updateQuestion(questionId, data),
    onSuccess: (_, { questionId }) => {
      // Invalidate the specific question details
      queryClient.invalidateQueries({
        queryKey: QA_QUERY_KEYS.questionDetails(questionId),
      });
      // Also invalidate course questions list
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.includes("qa") &&
          query.queryKey.includes("courses") &&
          query.queryKey.includes("questions"),
      });
      toast.success("Question updated successfully!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to update question";
      toast.error(message);
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  const toast = useQAToasts();

  return useMutation({
    mutationFn: (questionId: string) => qaService.deleteQuestion(questionId),
    onSuccess: () => {
      // Invalidate all questions queries
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.includes("qa") && query.queryKey.includes("questions"),
      });
      toast.success("Question deleted successfully!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to delete question";
      toast.error(message);
    },
  });
};

export const useVoteOnQuestion = () => {
  const queryClient = useQueryClient();
  const toast = useQAToasts();

  return useMutation({
    mutationFn: ({
      questionId,
      voteData,
    }: {
      questionId: string;
      voteData: VoteData;
    }) => qaService.voteOnQuestion(questionId, voteData),
    onSuccess: (_, { questionId }) => {
      // Invalidate the specific question details
      queryClient.invalidateQueries({
        queryKey: QA_QUERY_KEYS.questionDetails(questionId),
      });
      // Also invalidate course questions list to update vote counts
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.includes("qa") &&
          query.queryKey.includes("courses") &&
          query.queryKey.includes("questions"),
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to vote on question";
      toast.error(message);
    },
  });
};

// Answer Mutations
export const useCreateAnswer = (questionId: string) => {
  const queryClient = useQueryClient();
  const toast = useQAToasts();

  return useMutation({
    mutationFn: (data: CreateAnswerData) =>
      qaService.createAnswer(questionId, data),
    onSuccess: () => {
      // Invalidate the question details to show new answer
      queryClient.invalidateQueries({
        queryKey: QA_QUERY_KEYS.questionDetails(questionId),
      });
      // Also invalidate course questions list to update answer counts
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.includes("qa") &&
          query.queryKey.includes("courses") &&
          query.queryKey.includes("questions"),
      });
      toast.success("Answer posted successfully!");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to post answer";
      toast.error(message);
    },
  });
};

export const useUpdateAnswer = () => {
  const queryClient = useQueryClient();
  const toast = useQAToasts();

  return useMutation({
    mutationFn: ({
      answerId,
      data,
    }: {
      answerId: string;
      data: UpdateAnswerData;
    }) => qaService.updateAnswer(answerId, data),
    onSuccess: () => {
      // Invalidate all question details that might contain this answer
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.includes("qa") &&
          query.queryKey.includes("questions") &&
          !query.queryKey.includes("courses"), // Only question details, not course questions list
      });
      toast.success("Answer updated successfully!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to update answer";
      toast.error(message);
    },
  });
};

export const useDeleteAnswer = () => {
  const queryClient = useQueryClient();
  const toast = useQAToasts();

  return useMutation({
    mutationFn: (answerId: string) => qaService.deleteAnswer(answerId),
    onSuccess: () => {
      // Invalidate all questions queries to update answer counts
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("qa"),
      });
      toast.success("Answer deleted successfully!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to delete answer";
      toast.error(message);
    },
  });
};

export const useVoteOnAnswer = () => {
  const queryClient = useQueryClient();
  const toast = useQAToasts();

  return useMutation({
    mutationFn: ({
      answerId,
      voteData,
    }: {
      answerId: string;
      voteData: VoteData;
    }) => qaService.voteOnAnswer(answerId, voteData),
    onSuccess: () => {
      // Invalidate all question details that might contain this answer
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.includes("qa") &&
          query.queryKey.includes("questions") &&
          !query.queryKey.includes("courses"), // Only question details, not course questions list
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to vote on answer";
      toast.error(message);
    },
  });
};

export const useAcceptAnswer = () => {
  const queryClient = useQueryClient();
  const toast = useQAToasts();

  return useMutation({
    mutationFn: ({
      questionId,
      answerId,
    }: {
      questionId: string;
      answerId: string;
    }) => qaService.acceptAnswer(questionId, answerId),
    onSuccess: (_, { questionId }) => {
      // Invalidate the question details to show accepted answer
      queryClient.invalidateQueries({
        queryKey: QA_QUERY_KEYS.questionDetails(questionId),
      });
      // Also invalidate course questions list to update answered status
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.includes("qa") &&
          query.queryKey.includes("courses") &&
          query.queryKey.includes("questions"),
      });
      toast.success("Answer accepted successfully!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to accept answer";
      toast.error(message);
    },
  });
};

// Utility hooks for combined operations
export const useQuestionActions = (questionId: string) => {
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();
  const voteOnQuestion = useVoteOnQuestion();
  const acceptAnswer = useAcceptAnswer();

  return {
    updateQuestion: (data: UpdateQuestionData) =>
      updateQuestion.mutate({ questionId, data }),
    deleteQuestion: () => deleteQuestion.mutate(questionId),
    voteOnQuestion: (voteData: VoteData) =>
      voteOnQuestion.mutate({ questionId, voteData }),
    acceptAnswer: (answerId: string) =>
      acceptAnswer.mutate({ questionId, answerId }),
    isLoading:
      updateQuestion.isPending ||
      deleteQuestion.isPending ||
      voteOnQuestion.isPending ||
      acceptAnswer.isPending,
  };
};

export const useAnswerActions = (answerId: string) => {
  const updateAnswer = useUpdateAnswer();
  const deleteAnswer = useDeleteAnswer();
  const voteOnAnswer = useVoteOnAnswer();

  return {
    updateAnswer: (data: UpdateAnswerData) =>
      updateAnswer.mutate({ answerId, data }),
    deleteAnswer: () => deleteAnswer.mutate(answerId),
    voteOnAnswer: (voteData: VoteData) =>
      voteOnAnswer.mutate({ answerId, voteData }),
    isLoading:
      updateAnswer.isPending ||
      deleteAnswer.isPending ||
      voteOnAnswer.isPending,
  };
};

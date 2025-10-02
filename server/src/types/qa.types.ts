import { Types } from "mongoose";

// Request/Response Types for Q&A API

export interface CreateQuestionRequest {
  title: string;
  content: string;
  lessonId?: string;
  tags?: string[];
}

export interface UpdateQuestionRequest {
  title?: string;
  content?: string;
  tags?: string[];
}

export interface CreateAnswerRequest {
  content: string;
}

export interface UpdateAnswerRequest {
  content: string;
}

export interface VoteRequest {
  type: "upvote" | "downvote";
}

// Response Types
export interface QuestionResponse {
  _id: string;
  course: {
    _id: string;
    title: string;
  };
  lesson?: {
    _id: string;
    title: string;
  };
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  title: string;
  content: string;
  tags: string[];
  acceptedAnswer?: string;
  upvotes: string[];
  downvotes: string[];
  answersCount: number;
  voteScore: number;
  isAnswered: boolean;
  userVoteType?: "upvote" | "downvote" | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnswerResponse {
  _id: string;
  question: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  content: string;
  upvotes: string[];
  downvotes: string[];
  voteScore: number;
  isAccepted: boolean;
  userVoteType?: "upvote" | "downvote" | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionWithAnswersResponse {
  question: QuestionResponse;
  answers: AnswerResponse[];
  totalAnswers: number;
}

export interface QuestionsListResponse {
  success: boolean;
  data: {
    questions: QuestionResponse[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalQuestions: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface QuestionDetailsResponse {
  success: boolean;
  data: QuestionWithAnswersResponse;
}

export interface CreateQuestionResponse {
  success: boolean;
  data: {
    question: QuestionResponse;
    message: string;
  };
}

export interface CreateAnswerResponse {
  success: boolean;
  data: {
    answer: AnswerResponse;
    message: string;
  };
}

export interface VoteResponse {
  success: boolean;
  data: {
    voteScore: number;
    userVoteType: "upvote" | "downvote" | null;
    message: string;
  };
}

// Query Parameters
export interface QuestionsQuery {
  page?: number;
  limit?: number;
  lessonId?: string;
  search?: string;
  tags?: string;
  answered?: "true" | "false" | "all";
  sortBy?: "newest" | "oldest" | "popular" | "unanswered";
}

export interface AnswersQuery {
  page?: number;
  limit?: number;
  sortBy?: "newest" | "oldest" | "popular";
}

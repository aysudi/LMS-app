// Q&A Types for Client Side

export interface Question {
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

export interface Answer {
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

export interface QuestionWithAnswers {
  question: Question;
  answers: Answer[];
  totalAnswers: number;
}

// Request Types
export interface CreateQuestionData {
  title: string;
  content: string;
  lessonId?: string;
  tags?: string[];
}

export interface UpdateQuestionData {
  title?: string;
  content?: string;
  tags?: string[];
}

export interface CreateAnswerData {
  content: string;
}

export interface UpdateAnswerData {
  content: string;
}

export interface VoteData {
  type: "upvote" | "downvote";
}

// Response Types
export interface QuestionsResponse {
  success: boolean;
  data: {
    questions: Question[];
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
  data: QuestionWithAnswers;
}

export interface CreateQuestionResponse {
  success: boolean;
  data: {
    question: Question;
    message: string;
  };
}

export interface CreateAnswerResponse {
  success: boolean;
  data: {
    answer: Answer;
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

export interface AcceptAnswerResponse {
  success: boolean;
  data: {
    acceptedAnswer: string | null;
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

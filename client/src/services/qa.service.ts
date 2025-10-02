import { api } from "./api";
import type {
  CreateQuestionData,
  UpdateQuestionData,
  CreateAnswerData,
  UpdateAnswerData,
  VoteData,
  QuestionsResponse,
  QuestionDetailsResponse,
  CreateQuestionResponse,
  CreateAnswerResponse,
  VoteResponse,
  AcceptAnswerResponse,
  QuestionsQuery,
} from "../types/qa.types";

// Question API Services
export const getQuestionsByCourse = async (
  courseId: string,
  params: QuestionsQuery = {}
): Promise<QuestionsResponse> => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.lessonId) searchParams.append("lessonId", params.lessonId);
  if (params.search) searchParams.append("search", params.search);
  if (params.tags) searchParams.append("tags", params.tags);
  if (params.answered) searchParams.append("answered", params.answered);
  if (params.sortBy) searchParams.append("sortBy", params.sortBy);

  const queryString = searchParams.toString();
  const url = `/qa/courses/${courseId}/questions${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await api.get(url);
  return response.data;
};

export const getQuestionById = async (
  questionId: string
): Promise<QuestionDetailsResponse> => {
  const response = await api.get(`/qa/questions/${questionId}`);
  return response.data;
};

export const createQuestion = async (
  courseId: string,
  questionData: CreateQuestionData
): Promise<CreateQuestionResponse> => {
  const response = await api.post(
    `/qa/courses/${courseId}/questions`,
    questionData
  );
  return response.data;
};

export const updateQuestion = async (
  questionId: string,
  updateData: UpdateQuestionData
): Promise<CreateQuestionResponse> => {
  const response = await api.put(`/qa/questions/${questionId}`, updateData);
  return response.data;
};

export const deleteQuestion = async (
  questionId: string
): Promise<{ success: boolean; data: { message: string } }> => {
  const response = await api.delete(`/qa/questions/${questionId}`);
  return response.data;
};

export const voteOnQuestion = async (
  questionId: string,
  voteData: VoteData
): Promise<VoteResponse> => {
  const response = await api.post(`/qa/questions/${questionId}/vote`, voteData);
  return response.data;
};

// Answer API Services
export const createAnswer = async (
  questionId: string,
  answerData: CreateAnswerData
): Promise<CreateAnswerResponse> => {
  const response = await api.post(
    `/qa/questions/${questionId}/answers`,
    answerData
  );
  return response.data;
};

export const updateAnswer = async (
  answerId: string,
  updateData: UpdateAnswerData
): Promise<CreateAnswerResponse> => {
  const response = await api.put(`/qa/answers/${answerId}`, updateData);
  return response.data;
};

export const deleteAnswer = async (
  answerId: string
): Promise<{ success: boolean; data: { message: string } }> => {
  const response = await api.delete(`/qa/answers/${answerId}`);
  return response.data;
};

export const voteOnAnswer = async (
  answerId: string,
  voteData: VoteData
): Promise<VoteResponse> => {
  const response = await api.post(`/qa/answers/${answerId}/vote`, voteData);
  return response.data;
};

export const acceptAnswer = async (
  questionId: string,
  answerId: string
): Promise<AcceptAnswerResponse> => {
  const response = await api.post(
    `/qa/questions/${questionId}/answers/${answerId}/accept`
  );
  return response.data;
};

// Helper function to get questions for a specific lesson
export const getQuestionsByLesson = async (
  courseId: string,
  lessonId: string,
  params: Omit<QuestionsQuery, "lessonId"> = {}
): Promise<QuestionsResponse> => {
  return getQuestionsByCourse(courseId, { ...params, lessonId });
};

// Search questions
export const searchQuestions = async (
  courseId: string,
  searchTerm: string,
  params: Omit<QuestionsQuery, "search"> = {}
): Promise<QuestionsResponse> => {
  return getQuestionsByCourse(courseId, { ...params, search: searchTerm });
};

// Get questions by tags
export const getQuestionsByTags = async (
  courseId: string,
  tags: string[],
  params: Omit<QuestionsQuery, "tags"> = {}
): Promise<QuestionsResponse> => {
  return getQuestionsByCourse(courseId, { ...params, tags: tags.join(",") });
};

// Get unanswered questions
export const getUnansweredQuestions = async (
  courseId: string,
  params: Omit<QuestionsQuery, "answered"> = {}
): Promise<QuestionsResponse> => {
  return getQuestionsByCourse(courseId, { ...params, answered: "false" });
};

// Get answered questions
export const getAnsweredQuestions = async (
  courseId: string,
  params: Omit<QuestionsQuery, "answered"> = {}
): Promise<QuestionsResponse> => {
  return getQuestionsByCourse(courseId, { ...params, answered: "true" });
};

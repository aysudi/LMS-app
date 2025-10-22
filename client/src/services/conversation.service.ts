import type {
  ConversationResponse,
  ConversationsResponse,
  CreateConversationData,
  CreateConversationResponse,
} from "../types/conversation.type";
import { api } from "./api";

// Get user's conversations
export const getConversations = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ConversationsResponse> => {
  const response = await api.get("/api/conversations", { params });
  return response.data;
};

// Get single conversation by ID
export const getConversationById = async (
  conversationId: string
): Promise<ConversationResponse> => {
  const response = await api.get(`/api/conversations/${conversationId}`);
  return response.data;
};

// Create new conversation
export const createConversation = async (
  data: CreateConversationData
): Promise<CreateConversationResponse> => {
  const response = await api.post("/api/conversations", data);
  return response.data;
};

// Get or create conversation (for messaging)
export const getOrCreateConversation = async (
  data: CreateConversationData
): Promise<CreateConversationResponse> => {
  const response = await api.post("/api/conversations/find-or-create", data);
  return response.data;
};

// Mark conversation as read
export const markConversationAsRead = async (
  conversationId: string
): Promise<{ success: boolean; message?: string }> => {
  const response = await api.put(`/api/conversations/${conversationId}/read`);
  return response.data;
};

// Delete conversation
export const deleteConversation = async (
  conversationId: string
): Promise<{ success: boolean; message?: string }> => {
  const response = await api.delete(`/api/conversations/${conversationId}`);
  return response.data;
};

// Conversation service object
export const conversationService = {
  getConversations,
  getConversationById,
  createConversation,
  getOrCreateConversation,
  markConversationAsRead,
  deleteConversation,
};

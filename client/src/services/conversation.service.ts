import { api } from "./api";

export interface ConversationParticipants {
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
  };
  instructor: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
  };
}

export interface ConversationCourse {
  _id: string;
  title: string;
  thumbnail?: string;
}

export interface LastMessage {
  _id: string;
  content: string;
  senderId: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: ConversationParticipants;
  course: ConversationCourse;
  lastMessage?: LastMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationsResponse {
  success: boolean;
  data: {
    conversations: Conversation[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message?: string;
}

export interface ConversationResponse {
  success: boolean;
  data: Conversation;
  message?: string;
}

export interface CreateConversationData {
  instructorId: string;
  courseId: string;
}

export interface CreateConversationResponse {
  success: boolean;
  data: Conversation;
  isNew?: boolean;
  message?: string;
}

// Get user's conversations
export const getConversations = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ConversationsResponse> => {
  const response = await api.get("/conversations", { params });
  return response.data;
};

// Get single conversation by ID
export const getConversationById = async (
  conversationId: string
): Promise<ConversationResponse> => {
  const response = await api.get(`/conversations/${conversationId}`);
  return response.data;
};

// Create new conversation
export const createConversation = async (
  data: CreateConversationData
): Promise<CreateConversationResponse> => {
  const response = await api.post("/conversations", data);
  return response.data;
};

// Get or create conversation (for messaging)
export const getOrCreateConversation = async (
  data: CreateConversationData
): Promise<CreateConversationResponse> => {
  const response = await api.post("/conversations/find-or-create", data);
  return response.data;
};

// Mark conversation as read
export const markConversationAsRead = async (
  conversationId: string
): Promise<{ success: boolean; message?: string }> => {
  const response = await api.put(`/conversations/${conversationId}/read`);
  return response.data;
};

// Delete conversation
export const deleteConversation = async (
  conversationId: string
): Promise<{ success: boolean; message?: string }> => {
  const response = await api.delete(`/conversations/${conversationId}`);
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

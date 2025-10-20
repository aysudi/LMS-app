import { api } from "./api";
import type {
  CreateMessageData,
  Conversation,
  Message,
  ConversationsPaginationData,
  MessagesPaginationData,
  GetConversationsQuery,
  GetMessagesQuery,
} from "../types/message.type";

class MessageService {
  // Create a new message
  async createMessage(messageData: CreateMessageData): Promise<Message> {
    const response = await api.post("/api/messages", messageData);
    return response.data.data;
  }

  // Get user's conversations
  async getConversations(
    query?: GetConversationsQuery
  ): Promise<ConversationsPaginationData> {
    const params = new URLSearchParams();

    if (query?.page) params.append("page", query.page.toString());
    if (query?.limit) params.append("limit", query.limit.toString());
    if (query?.search) params.append("search", query.search);
    if (query?.courseId) params.append("courseId", query.courseId);

    const queryString = params.toString();
    const url = queryString
      ? `/api/messages/conversations?${queryString}`
      : "/api/messages/conversations";

    const response = await api.get(url);
    return response.data.data;
  }

  // Get messages for a conversation
  async getMessages(query: GetMessagesQuery): Promise<MessagesPaginationData> {
    const { conversationId, ...params } = query;
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());

    const queryString = searchParams.toString();
    const url = queryString
      ? `/api/messages/conversations/${conversationId}/messages?${queryString}`
      : `/api/messages/conversations/${conversationId}/messages`;

    const response = await api.get(url);
    return response.data.data;
  }

  // Mark messages as read
  async markMessagesAsRead(conversationId: string): Promise<void> {
    await api.patch(`/api/messages/conversations/${conversationId}/read`);
  }

  // Get conversation by ID
  async getConversationById(conversationId: string): Promise<Conversation> {
    const response = await api.get(
      `/api/messages/conversations/${conversationId}`
    );
    return response.data.data;
  }

  // Delete conversation
  async deleteConversation(conversationId: string): Promise<void> {
    await api.delete(`/api/messages/conversations/${conversationId}`);
  }
}

export const messageService = new MessageService();
export default messageService;

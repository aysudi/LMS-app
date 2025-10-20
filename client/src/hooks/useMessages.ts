import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { messageService } from "../services/message.service";
import type {
  GetConversationsQuery,
  GetMessagesQuery,
} from "../types/message.type";

// Query keys for caching
export const messageKeys = {
  all: ["messages"] as const,
  conversations: () => [...messageKeys.all, "conversations"] as const,
  conversation: (params: GetConversationsQuery) =>
    [...messageKeys.conversations(), params] as const,
  messages: () => [...messageKeys.all, "messages"] as const,
  conversationMessages: (
    conversationId: string,
    params?: Omit<GetMessagesQuery, "conversationId">
  ) => [...messageKeys.messages(), conversationId, params] as const,
  conversationDetail: (id: string) =>
    [...messageKeys.conversations(), "detail", id] as const,
};

// Hook to get user's conversations
export const useConversations = (params?: GetConversationsQuery) => {
  return useQuery({
    queryKey: messageKeys.conversation(params || {}),
    queryFn: () => messageService.getConversations(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get messages for a conversation
export const useMessages = (params: GetMessagesQuery) => {
  return useQuery({
    queryKey: messageKeys.conversationMessages(params.conversationId, params),
    queryFn: () => messageService.getMessages(params),
    enabled: !!params.conversationId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Hook to get a single conversation
export const useConversation = (conversationId: string) => {
  return useQuery({
    queryKey: messageKeys.conversationDetail(conversationId),
    queryFn: () => messageService.getConversationById(conversationId),
    enabled: !!conversationId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for message mutations
export const useMessageMutations = () => {
  const queryClient = useQueryClient();

  const sendMessage = useMutation({
    mutationFn: messageService.createMessage,
    onSuccess: (data) => {
      toast.success("Message sent successfully!");

      // Invalidate conversations to update last message
      queryClient.invalidateQueries({
        queryKey: messageKeys.conversations(),
      });

      // Invalidate messages for this conversation
      queryClient.invalidateQueries({
        queryKey: messageKeys.conversationMessages(data.conversationId),
      });

      // Update conversation detail if cached
      queryClient.invalidateQueries({
        queryKey: messageKeys.conversationDetail(data.conversationId),
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to send message. Please try again."
      );
    },
  });

  const markAsRead = useMutation({
    mutationFn: messageService.markMessagesAsRead,
    onSuccess: (_, conversationId) => {
      // Update the conversations list to reflect read status
      queryClient.invalidateQueries({
        queryKey: messageKeys.conversations(),
      });

      // Update messages for this conversation
      queryClient.invalidateQueries({
        queryKey: messageKeys.conversationMessages(conversationId),
      });
    },
    onError: (error: any) => {
      console.error("Failed to mark messages as read:", error);
    },
  });

  const deleteConversation = useMutation({
    mutationFn: messageService.deleteConversation,
    onSuccess: () => {
      toast.success("Conversation deleted successfully");

      // Invalidate all conversation-related queries
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to delete conversation"
      );
    },
  });

  return {
    sendMessage: {
      mutate: sendMessage.mutate,
      isLoading: sendMessage.isPending,
      error: sendMessage.error,
    },
    markAsRead: {
      mutate: markAsRead.mutate,
      isLoading: markAsRead.isPending,
      error: markAsRead.error,
    },
    deleteConversation: {
      mutate: deleteConversation.mutate,
      isLoading: deleteConversation.isPending,
      error: deleteConversation.error,
    },
  };
};

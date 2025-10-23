import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { conversationService } from "../services/conversation.service";
import { messageService } from "../services/message.service";
import type {
  Message,
  CreateMessageData,
  GetMessagesQuery,
} from "../types/message.type";
import type { ConversationsResponse } from "../types/conversation.type";

// Query keys
export const messageQueryKeys = {
  conversations: (params?: {
    search?: string;
    page?: number;
    limit?: number;
  }) => ["conversations", params] as const,
  conversation: (id: string) => ["conversation", id] as const,
  messages: (
    conversationId: string,
    params?: { page?: number; limit?: number }
  ) => ["messages", conversationId, params] as const,
};

// Conversations hooks - Use conversation service
export const useConversations = (
  params?: {
    search?: string;
    page?: number;
    limit?: number;
  },
  options?: Omit<UseQueryOptions<ConversationsResponse>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: messageQueryKeys.conversations(params),
    queryFn: () => conversationService.getConversations(params),
    staleTime: 10 * 60 * 1000, // 10 minutes - longer stale time for conversations
    gcTime: 15 * 60 * 1000, // 15 minutes cache time
    refetchInterval: false, // Disable automatic refetching
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false, // Disable refetch on window focus for better UX
    refetchOnMount: false, // Only refetch on mount if data is stale
    retry: 2, // Reduce retry attempts
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
};

export const useConversation = (conversationId: string) => {
  return useQuery({
    queryKey: messageQueryKeys.conversation(conversationId),
    queryFn: () => conversationService.getConversationById(conversationId),
    enabled: !!conversationId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes cache time
    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

// Messages hooks
export const useMessages = (params: {
  conversationId: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: messageQueryKeys.messages(params.conversationId, {
      page: params.page,
      limit: params.limit,
    }),
    queryFn: async () => {
      const query: GetMessagesQuery = {
        conversationId: params.conversationId,
        page: params.page,
        limit: params.limit,
      };
      const result = await messageService.getMessages(query);
      return {
        success: true,
        data: result,
      };
    },
    enabled: !!params.conversationId,
    staleTime: 5 * 60 * 1000, // 5 minutes for messages (shorter than conversations)
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    refetchInterval: false, // Disable automatic refetching - rely on Socket.IO for real-time updates
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false, // Disable to prevent constant refetching
    refetchOnMount: false, // Only refetch if stale
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Conversation mutations
export const useConversationMutations = () => {
  const queryClient = useQueryClient();

  const createConversation = useMutation({
    mutationFn: conversationService.createConversation,
    onSuccess: () => {
      // Invalidate conversations list
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });

      toast.success("Conversation created successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create conversation"
      );
    },
  });

  const getOrCreateConversation = useMutation({
    mutationFn: conversationService.getOrCreateConversation,
    onSuccess: () => {
      // Invalidate conversations list
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to get conversation"
      );
    },
  });

  const markAsRead = useMutation({
    mutationFn: (conversationId: string) =>
      conversationService.markConversationAsRead(conversationId),
    onSuccess: (_, conversationId) => {
      // Update conversation cache
      queryClient.invalidateQueries({
        queryKey: messageQueryKeys.conversation(conversationId),
      });

      // Update conversations list cache
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });

      // Update messages cache
      queryClient.invalidateQueries({
        queryKey: ["messages", conversationId],
      });
    },
    onError: (error: any) => {
      console.error("Failed to mark conversation as read:", error);
    },
  });

  const deleteConversation = useMutation({
    mutationFn: (conversationId: string) =>
      conversationService.deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
    onError: (error: any) => {
      console.error("Failed to delete conversation:", error);
    },
  });

  return {
    createConversation,
    getOrCreateConversation,
    markAsRead,
    deleteConversation,
  };
};

// Message mutations
export const useMessageMutations = () => {
  const queryClient = useQueryClient();

  const sendMessage = useMutation({
    mutationFn: messageService.createMessage,
    onMutate: async (messageData: CreateMessageData) => {
      // Optimistic update - add temporary message
      const tempMessage: Partial<Message> = {
        _id: `temp-${Date.now()}`,
        content: messageData.content,
        senderId: {
          _id: "current-user-id",
        }, // This should be set from auth context
        receiverId: messageData.receiverId,
        conversationId: "",
        messageType: messageData.messageType || "text",
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["messages"],
      });

      return { tempMessage };
    },
    onSuccess: () => {
      // Invalidate and refetch messages and conversations
      queryClient.invalidateQueries({
        queryKey: ["messages"],
      });

      // Invalidate conversations to update last message
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
    onError: () => {
      // Revert optimistic update on error - just invalidate to refresh
      queryClient.invalidateQueries({
        queryKey: ["messages"],
      });

      toast.error("Failed to send message");
    },
  });

  return {
    sendMessage,
  };
};

// Combined hook for convenience
export const useMessaging = () => {
  const conversationMutations = useConversationMutations();
  const messageMutations = useMessageMutations();

  return {
    conversations: conversationMutations,
    messages: messageMutations,
  };
};

// Real-time message helpers
export const useMessageInvalidation = () => {
  const queryClient = useQueryClient();

  const invalidateConversations = () => {
    queryClient.invalidateQueries({
      queryKey: ["conversations"],
    });
  };

  const invalidateMessages = (conversationId: string) => {
    queryClient.invalidateQueries({
      queryKey: ["messages", conversationId],
    });
  };

  const invalidateConversation = (conversationId: string) => {
    queryClient.invalidateQueries({
      queryKey: messageQueryKeys.conversation(conversationId),
    });
  };

  return {
    invalidateConversations,
    invalidateMessages,
    invalidateConversation,
  };
};

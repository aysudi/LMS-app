import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import courseMessageService from "../services/courseMessage.service";
import type {
  CourseMessage,
  SendCourseMessageData,
} from "../services/courseMessage.service";
import { toast } from "react-hot-toast";

// Hook for getting course messages
export const useCourseMessages = (
  courseId: string,
  page: number = 1,
  limit: number = 50
) => {
  return useQuery({
    queryKey: ["courseMessages", courseId, page, limit],
    queryFn: () =>
      courseMessageService.getCourseMessages(courseId, page, limit),
    enabled: !!courseId,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });
};

// Hook for getting unread message counts
export const useUnreadMessageCounts = () => {
  return useQuery({
    queryKey: ["unreadMessageCounts"],
    queryFn: () => courseMessageService.getUnreadMessageCounts(),
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
    refetchInterval: 60000, // Refetch every minute
  });
};

// Hook for sending messages
export const useSendCourseMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageData: SendCourseMessageData) =>
      courseMessageService.sendMessage(messageData),
    onSuccess: (_, variables) => {
      // Invalidate and refetch course messages
      queryClient.invalidateQueries({
        queryKey: ["courseMessages", variables.course],
      });

      // Update unread counts
      queryClient.invalidateQueries({
        queryKey: ["unreadMessageCounts"],
      });

      toast.success("Message sent successfully");
    },
    onError: (error: any) => {
      console.error("Failed to send message:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    },
  });
};

// Hook for marking messages as read
export const useMarkMessagesAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) =>
      courseMessageService.markMessagesAsRead(courseId),
    onSuccess: (_, courseId) => {
      // Update unread counts
      queryClient.invalidateQueries({
        queryKey: ["unreadMessageCounts"],
      });

      // Update course messages to mark them as read
      queryClient.invalidateQueries({
        queryKey: ["courseMessages", courseId],
      });
    },
    onError: (error: any) => {
      console.error("Failed to mark messages as read:", error);
    },
  });
};

// Hook for editing messages
export const useEditCourseMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      messageId,
      content,
    }: {
      messageId: string;
      content: string;
    }) => courseMessageService.editMessage(messageId, content),
    onSuccess: (data) => {
      // Update the specific message in all relevant queries
      queryClient.setQueryData(
        ["courseMessages", data.data.course],
        (oldData: any) => {
          if (!oldData) return oldData;

          const updatedMessages = oldData.data.messages.map(
            (message: CourseMessage) =>
              message._id === data.data._id
                ? { ...message, ...data.data }
                : message
          );

          return {
            ...oldData,
            data: {
              ...oldData.data,
              messages: updatedMessages,
            },
          };
        }
      );

      toast.success("Message updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update message");
    },
  });
};

// Hook for deleting messages
export const useDeleteCourseMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) =>
      courseMessageService.deleteMessage(messageId),
    onSuccess: () => {
      // Remove the message from all course message queries
      queryClient.invalidateQueries({
        queryKey: ["courseMessages"],
      });

      toast.success("Message deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete message");
    },
  });
};

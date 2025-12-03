import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import type {
  SendMessageData,
  ReplyMessageData,
} from "../services/studentInstructorMessage.service";
import studentInstructorMessageService from "../services/studentInstructorMessage.service.ts";

// Query keys
export const STUDENT_INSTRUCTOR_MESSAGE_KEYS = {
  all: ["student-instructor-messages"] as const,
  enrolledInstructors: () =>
    [...STUDENT_INSTRUCTOR_MESSAGE_KEYS.all, "enrolled-instructors"] as const,
  studentConversations: () =>
    [...STUDENT_INSTRUCTOR_MESSAGE_KEYS.all, "student-conversations"] as const,
  instructorConversations: () =>
    [
      ...STUDENT_INSTRUCTOR_MESSAGE_KEYS.all,
      "instructor-conversations",
    ] as const,
  conversationThread: (messageId: string) =>
    [...STUDENT_INSTRUCTOR_MESSAGE_KEYS.all, "thread", messageId] as const,
};

// Get enrolled instructors
export const useEnrolledInstructors = () => {
  return useQuery({
    queryKey: STUDENT_INSTRUCTOR_MESSAGE_KEYS.enrolledInstructors(),
    queryFn: studentInstructorMessageService.getEnrolledInstructors,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Send message to instructor
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageData) =>
      studentInstructorMessageService.sendMessage(data),
    onSuccess: () => {
      toast.success("Message sent successfully!");
      queryClient.invalidateQueries({
        queryKey: STUDENT_INSTRUCTOR_MESSAGE_KEYS.studentConversations(),
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.error || "Failed to send message";
      toast.error(errorMessage);
    },
  });
};

// Reply to message
export const useReplyToMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      messageId,
      data,
    }: {
      messageId: string;
      data: ReplyMessageData;
    }) => studentInstructorMessageService.replyToMessage(messageId, data),
    onSuccess: (_, { messageId }) => {
      toast.success("Reply sent successfully!");
      queryClient.invalidateQueries({
        queryKey: STUDENT_INSTRUCTOR_MESSAGE_KEYS.conversationThread(messageId),
      });
      queryClient.invalidateQueries({
        queryKey: STUDENT_INSTRUCTOR_MESSAGE_KEYS.studentConversations(),
      });
      queryClient.invalidateQueries({
        queryKey: STUDENT_INSTRUCTOR_MESSAGE_KEYS.instructorConversations(),
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.error || "Failed to send reply";
      toast.error(errorMessage);
    },
  });
};

// Get student conversations
export const useStudentConversations = () => {
  return useQuery({
    queryKey: STUDENT_INSTRUCTOR_MESSAGE_KEYS.studentConversations(),
    queryFn: studentInstructorMessageService.getStudentConversations,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Get instructor conversations
export const useInstructorConversations = () => {
  return useQuery({
    queryKey: STUDENT_INSTRUCTOR_MESSAGE_KEYS.instructorConversations(),
    queryFn: studentInstructorMessageService.getInstructorConversations,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Get conversation thread
export const useConversationThread = (messageId: string) => {
  return useQuery({
    queryKey: STUDENT_INSTRUCTOR_MESSAGE_KEYS.conversationThread(messageId),
    queryFn: () =>
      studentInstructorMessageService.getConversationThread(messageId),
    enabled: !!messageId,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
  });
};

// Mark message as read
export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) =>
      studentInstructorMessageService.markMessageAsRead(messageId),
    onSuccess: (_, messageId) => {
      queryClient.invalidateQueries({
        queryKey: STUDENT_INSTRUCTOR_MESSAGE_KEYS.conversationThread(messageId),
      });
      queryClient.invalidateQueries({
        queryKey: STUDENT_INSTRUCTOR_MESSAGE_KEYS.instructorConversations(),
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.error || "Failed to mark message as read";
      toast.error(errorMessage);
    },
  });
};

// Mark conversation as resolved
export const useMarkConversationAsResolved = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) =>
      studentInstructorMessageService.markConversationAsResolved(messageId),
    onSuccess: (_, messageId) => {
      toast.success("Conversation marked as resolved!");
      queryClient.invalidateQueries({
        queryKey: STUDENT_INSTRUCTOR_MESSAGE_KEYS.conversationThread(messageId),
      });
      queryClient.invalidateQueries({
        queryKey: STUDENT_INSTRUCTOR_MESSAGE_KEYS.instructorConversations(),
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.error ||
        "Failed to mark conversation as resolved";
      toast.error(errorMessage);
    },
  });
};

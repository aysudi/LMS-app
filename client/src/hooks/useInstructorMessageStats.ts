import { useQuery } from "@tanstack/react-query";
import studentInstructorMessageService from "../services/studentInstructorMessage.service";

export const useInstructorMessageStats = () => {
  return useQuery({
    queryKey: ["instructorMessageStats"],
    queryFn: async () => {
      const conversations =
        await studentInstructorMessageService.getInstructorConversations();

      const totalMessages = conversations.length;
      const resolvedMessages = conversations.filter(
        (conv: any) => conv.status === "resolved"
      ).length;
      const pendingMessages = conversations.filter(
        (conv: any) => conv.status === "pending" || conv.status === "open"
      ).length;
      const unreadMessages = conversations.reduce(
        (total: number, conv: any) => total + (conv.unreadCount || 0),
        0
      );

      return {
        totalMessages,
        resolvedMessages,
        pendingMessages,
        unreadMessages,
      };
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });
};

import { api } from "./api";

export interface CourseMessage {
  _id: string;
  content: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  course: string;
  messageType: "text" | "image" | "file";
  isRead: boolean;
  readBy: Array<{
    user: string;
    readAt: string;
  }>;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  replyTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SendCourseMessageData {
  content: string;
  course: string;
  messageType?: "text" | "image" | "file";
}

export interface CourseMessagesResponse {
  success: boolean;
  data: {
    messages: CourseMessage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface UnreadCountsResponse {
  success: boolean;
  data: Record<string, number>;
}

class CourseMessageService {
  // Send a message to course group chat
  async sendMessage(messageData: SendCourseMessageData) {
    const response = await api.post("/api/course-messages", messageData);
    return response.data;
  }

  // Get messages for a course
  async getCourseMessages(
    courseId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<CourseMessagesResponse> {
    const response = await api.get(`/api/course-messages/course/${courseId}`, {
      params: { page, limit },
    });
    return response.data;
  }

  // Mark messages as read for a course
  async markMessagesAsRead(courseId: string) {
    const response = await api.put(
      `/api/course-messages/course/${courseId}/read`
    );
    return response.data;
  }

  // Get unread message counts for all enrolled courses
  async getUnreadMessageCounts(): Promise<UnreadCountsResponse> {
    const response = await api.get("/api/course-messages/unread-counts");
    return response.data;
  }

  // Edit a message
  async editMessage(messageId: string, content: string) {
    const response = await api.put(`/api/course-messages/${messageId}`, {
      content,
    });
    return response.data;
  }

  // Delete a message
  async deleteMessage(messageId: string) {
    const response = await api.delete(`/api/course-messages/${messageId}`);
    return response.data;
  }
}

export default new CourseMessageService();

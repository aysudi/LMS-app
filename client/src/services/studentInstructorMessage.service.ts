import { api } from "./api";
import type { IStudentInstructorMessage } from "../types/studentInstructorMessage.type";

export interface SendMessageData {
  instructor: string;
  course: string;
  subject: string;
  content: string;
  attachments?: Array<{
    filename: string;
    url: string;
    size: number;
    mimeType: string;
  }>;
}

export interface ReplyMessageData {
  content: string;
  attachments?: Array<{
    filename: string;
    url: string;
    size: number;
    mimeType: string;
  }>;
}

export interface EnrolledInstructor {
  instructor: {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
  course: {
    _id: string;
    title: string;
    thumbnail?: string;
    image: {
      url: string;
    };
  };
}

export interface ConversationSummary
  extends Omit<IStudentInstructorMessage, "student" | "instructor" | "course"> {
  replyCount: number;
  lastActivity: Date;
  unreadCount?: number; // Only for instructor conversations
  student?: {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
  instructor?: {
    _id: string;
    fullName: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  course: {
    _id: string;
    title: string;
    thumbnail?: string;
    image: {
      url: string;
    };
  };
}

export interface ConversationThread {
  rootMessage: IStudentInstructorMessage;
  replies: IStudentInstructorMessage[];
}

class StudentInstructorMessageService {
  // Get instructors from enrolled courses
  async getEnrolledInstructors(): Promise<EnrolledInstructor[]> {
    const response = await api.get(
      "/api/student-instructor-messages/enrolled-instructors"
    );
    return response.data.instructors;
  }

  // Send message to instructor
  async sendMessage(data: SendMessageData): Promise<IStudentInstructorMessage> {
    const response = await api.post(
      "/api/student-instructor-messages/send",
      data
    );
    return response.data.message;
  }

  // Reply to a message
  async replyToMessage(
    messageId: string,
    data: ReplyMessageData
  ): Promise<IStudentInstructorMessage> {
    const response = await api.post(
      `/api/student-instructor-messages/${messageId}/reply`,
      data
    );
    return response.data.message;
  }

  // Get student conversations
  async getStudentConversations(): Promise<ConversationSummary[]> {
    const response = await api.get(
      "/api/student-instructor-messages/student/conversations"
    );
    return response.data.conversations;
  }

  // Get instructor conversations
  async getInstructorConversations(): Promise<ConversationSummary[]> {
    const response = await api.get(
      "/api/student-instructor-messages/instructor/conversations"
    );
    return response.data.conversations;
  }

  // Get full conversation thread
  async getConversationThread(messageId: string): Promise<ConversationThread> {
    const response = await api.get(
      `/api/student-instructor-messages/${messageId}/thread`
    );
    return response.data.conversation;
  }

  // Mark message as read
  async markMessageAsRead(messageId: string): Promise<void> {
    await api.patch(`/api/student-instructor-messages/${messageId}/read`);
  }

  // Mark conversation as resolved
  async markConversationAsResolved(messageId: string): Promise<void> {
    await api.patch(`/api/student-instructor-messages/${messageId}/resolve`);
  }
}

export default new StudentInstructorMessageService();

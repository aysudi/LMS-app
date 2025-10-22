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
  courseId: ConversationCourse;
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

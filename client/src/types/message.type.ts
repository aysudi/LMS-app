export interface Message {
  _id: string;
  senderId: {
    _id: string;
  };
  receiverId: string;
  conversationId: string;
  content: string;
  messageType: "text" | "image" | "file";
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  participants: {
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
  };
  courseId: string;
  course: {
    _id: string;
    title: string;
    thumbnail?: string;
  };
  lastMessage?: Message;
  unreadCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageData {
  receiverId: string;
  courseId: string;
  content: string;
  messageType?: "text" | "image" | "file";
}

export interface GetConversationsQuery {
  page?: number;
  limit?: number;
  search?: string;
  courseId?: string;
}

export interface GetMessagesQuery {
  conversationId: string;
  page?: number;
  limit?: number;
}

export interface MessagesPaginationData {
  data: {
    messages: Message[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalMessages: number;
      limit: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

export interface ConversationsPaginationData {
  conversations: Conversation[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalConversations: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  username: string;
  isTyping: boolean;
}

export interface OnlineUser {
  userId: string;
  socketId: string;
  lastSeen: string;
}

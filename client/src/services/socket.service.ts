import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket) {
      const currentToken =
        typeof this.socket.auth === "object"
          ? this.socket.auth.token
          : undefined;
      if (currentToken !== token) {
        this.socket.disconnect();
        this.socket.auth = { token };
        this.socket.connect();
      }
      return this.socket;
    }

    try {
      const configuredUrl = import.meta.env.VITE_API_URL;
      const serverUrl = configuredUrl
        ? configuredUrl.replace(/\/api\/?$/, "")
        : "http://localhost:4040";

      this.socket = io(serverUrl, {
        auth: {
          token,
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      this.setupEventListeners();

      return this.socket;
    } catch (error) {
      console.error("Failed to connect socket:", error);
      return null;
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      // Emit online status
      this.socket?.emit("status:online");
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);

      // Check if it's an authentication error
      if (
        error.message.includes("Authentication") ||
        error.message.includes("Invalid token")
      ) {
        console.error("🔐 Authentication failed - check token validity");
      }
    });

    this.socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join conversation rooms
  joinConversations(conversationIds: string[]) {
    if (this.socket?.connected) {
      this.socket.emit("join:conversations", conversationIds);
    }
  }

  // Join a course room
  joinCourseRoom(courseId: string) {
    if (this.socket?.connected) {
      this.socket.emit("join:course", courseId);
    } else {
      console.log(
        "❌ Socket not connected, cannot join course room:",
        courseId,
      );
    }
  }

  // Leave a course room
  leaveCourseRoom(courseId: string) {
    if (this.socket?.connected) {
      this.socket.emit("leave:course", courseId);
    }
  }

  // Join specific conversation
  joinConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit("conversation:join", conversationId);
    }
  }

  // Leave specific conversation
  leaveConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit("conversation:leave", conversationId);
    }
  }

  // Send message
  sendMessage(data: {
    receiverId: string;
    courseId: string;
    content: string;
    tempId?: string;
    messageType?: "text" | "image" | "file";
  }) {
    if (this.socket?.connected) {
      this.socket.emit("message:send", data);
    }
  }

  // Edit message
  editMessage(messageId: string, content: string) {
    if (this.socket?.connected) {
      this.socket.emit("message:edit", { messageId, content });
    }
  }

  // Delete message
  deleteMessage(messageId: string) {
    if (this.socket?.connected) {
      this.socket.emit("message:delete", { messageId });
    }
  }

  // Typing indicators
  startTyping(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit("typing:start", { conversationId });
    }
  }

  stopTyping(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit("typing:stop", { conversationId });
    }
  }

  // Mark message as read
  markMessageAsRead(messageId: string, conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit("message:read", { messageId, conversationId });
    }
  }

  // Event listeners
  onMessageReceived(callback: (message: any) => void) {
    this.socket?.on("message:received", callback);
  }

  onMessageUpdated(callback: (message: any) => void) {
    this.socket?.on("message:updated", callback);
  }

  onMessageDeleted(
    callback: (data: { messageId: string; conversationId: string }) => void,
  ) {
    this.socket?.on("message:deleted", callback);
  }

  onMessageRead(
    callback: (data: {
      messageId: string;
      conversationId: string;
      userId: string;
    }) => void,
  ) {
    this.socket?.on("message:read", callback);
  }

  onTyping(
    callback: (data: {
      userId: string;
      username: string;
      conversationId: string;
    }) => void,
  ) {
    this.socket?.on("typing:started", callback);
  }

  onStopTyping(
    callback: (data: {
      userId: string;
      username: string;
      conversationId: string;
    }) => void,
  ) {
    this.socket?.on("typing:stopped", callback);
  }

  onUserOnline(callback: (data: { userId: string; username: string }) => void) {
    this.socket?.on("user:online", callback);
  }

  onUserOffline(
    callback: (data: { userId: string; username: string }) => void,
  ) {
    this.socket?.on("user:offline", callback);
  }

  onConversationJoined(callback: (data: { conversationId: string }) => void) {
    this.socket?.on("conversation:joined", callback);
  }

  // Remove event listeners
  offMessageReceived(callback?: (message: any) => void) {
    this.socket?.off("message:received", callback);
  }

  offMessageUpdated(callback?: (message: any) => void) {
    this.socket?.off("message:updated", callback);
  }

  offMessageDeleted(
    callback?: (data: { messageId: string; conversationId: string }) => void,
  ) {
    this.socket?.off("message:deleted", callback);
  }

  offMessageRead(
    callback?: (data: {
      messageId: string;
      conversationId: string;
      userId: string;
    }) => void,
  ) {
    this.socket?.off("message:read", callback);
  }

  offTyping(
    callback?: (data: {
      userId: string;
      username: string;
      conversationId: string;
    }) => void,
  ) {
    this.socket?.off("typing:started", callback);
  }

  offStopTyping(
    callback?: (data: {
      userId: string;
      username: string;
      conversationId: string;
    }) => void,
  ) {
    this.socket?.off("typing:stopped", callback);
  }

  offUserOnline(
    callback?: (data: { userId: string; username: string }) => void,
  ) {
    this.socket?.off("user:online", callback);
  }

  offUserOffline(
    callback?: (data: { userId: string; username: string }) => void,
  ) {
    this.socket?.off("user:offline", callback);
  }

  // Course message event listeners
  onNewCourseMessage(
    callback: (data: { message: any; courseId: string }) => void,
  ) {
    this.socket?.on("newCourseMessage", callback);
  }

  onCourseMessageEdited(
    callback: (data: { message: any; courseId: string }) => void,
  ) {
    this.socket?.on("messageEdited", callback);
  }

  onCourseMessageDeleted(
    callback: (data: { messageId: string; courseId: string }) => void,
  ) {
    this.socket?.on("messageDeleted", callback);
  }

  // Course message event listener removers
  offNewCourseMessage(
    callback?: (data: { message: any; courseId: string }) => void,
  ) {
    this.socket?.off("newCourseMessage", callback);
  }

  offCourseMessageEdited(
    callback?: (data: { message: any; courseId: string }) => void,
  ) {
    this.socket?.off("messageEdited", callback);
  }

  offCourseMessageDeleted(
    callback?: (data: { messageId: string; courseId: string }) => void,
  ) {
    this.socket?.off("messageDeleted", callback);
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // Check if connected
  isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
export default socketService;

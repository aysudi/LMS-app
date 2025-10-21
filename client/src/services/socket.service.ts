import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;

  connect(token: string) {
    if (this.socket?.connected || this.isConnecting) {
      console.log("Socket already connected or connecting");
      return this.socket;
    }

    this.isConnecting = true;

    try {
      const serverUrl = "http://localhost:4040/api";

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
      this.isConnecting = false;

      console.log("Socket connection initiated");
      return this.socket;
    } catch (error) {
      console.error("Failed to connect socket:", error);
      this.isConnecting = false;
      return null;
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
      this.isConnecting = false;

      // Clear any reconnection timers
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      // Emit online status
      this.socket?.emit("status:online");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      this.isConnecting = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.isConnecting = false;
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnecting = false;
    console.log("Socket disconnected");
  }

  // Join conversation rooms
  joinConversations(conversationIds: string[]) {
    if (this.socket?.connected) {
      this.socket.emit("join:conversations", conversationIds);
      console.log("Joined conversations:", conversationIds);
    }
  }

  // Join specific conversation
  joinConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit("conversation:join", { conversationId });
    }
  }

  // Leave specific conversation
  leaveConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit("conversation:leave", { conversationId });
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
      this.socket.emit("message:typing", { conversationId });
    }
  }

  stopTyping(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit("message:stopTyping", { conversationId });
    }
  }

  // Mark message as read
  markMessageAsRead(messageId: string, conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit("message:markAsRead", { messageId, conversationId });
    }
  }

  // Event listeners
  onMessageReceived(callback: (message: any) => void) {
    this.socket?.on("message:new", callback);
  }

  onMessageUpdated(callback: (message: any) => void) {
    this.socket?.on("message:updated", callback);
  }

  onMessageDeleted(
    callback: (data: { messageId: string; conversationId: string }) => void
  ) {
    this.socket?.on("message:deleted", callback);
  }

  onMessageRead(
    callback: (data: {
      messageId: string;
      conversationId: string;
      userId: string;
    }) => void
  ) {
    this.socket?.on("message:read", callback);
  }

  onTyping(
    callback: (data: {
      userId: string;
      username: string;
      conversationId: string;
    }) => void
  ) {
    this.socket?.on("message:typing", callback);
  }

  onStopTyping(
    callback: (data: {
      userId: string;
      username: string;
      conversationId: string;
    }) => void
  ) {
    this.socket?.on("message:stopTyping", callback);
  }

  onUserOnline(callback: (data: { userId: string; username: string }) => void) {
    this.socket?.on("user:online", callback);
  }

  onUserOffline(
    callback: (data: { userId: string; username: string }) => void
  ) {
    this.socket?.on("user:offline", callback);
  }

  onConversationJoined(callback: (data: { conversationId: string }) => void) {
    this.socket?.on("conversation:joined", callback);
  }

  // Remove event listeners
  offMessageReceived(callback?: (message: any) => void) {
    this.socket?.off("message:new", callback);
  }

  offMessageUpdated(callback?: (message: any) => void) {
    this.socket?.off("message:updated", callback);
  }

  offMessageDeleted(
    callback?: (data: { messageId: string; conversationId: string }) => void
  ) {
    this.socket?.off("message:deleted", callback);
  }

  offMessageRead(
    callback?: (data: {
      messageId: string;
      conversationId: string;
      userId: string;
    }) => void
  ) {
    this.socket?.off("message:read", callback);
  }

  offTyping(
    callback?: (data: {
      userId: string;
      username: string;
      conversationId: string;
    }) => void
  ) {
    this.socket?.off("message:typing", callback);
  }

  offStopTyping(
    callback?: (data: {
      userId: string;
      username: string;
      conversationId: string;
    }) => void
  ) {
    this.socket?.off("message:stopTyping", callback);
  }

  offUserOnline(
    callback?: (data: { userId: string; username: string }) => void
  ) {
    this.socket?.off("user:online", callback);
  }

  offUserOffline(
    callback?: (data: { userId: string; username: string }) => void
  ) {
    this.socket?.off("user:offline", callback);
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

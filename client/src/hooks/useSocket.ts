import { useEffect, useRef, useState, useCallback } from "react";
import { useAuthContext } from "../context/AuthContext";
import { getAuthToken } from "../utils/auth-storage";
import { socketService } from "../services/socket.service";
import { useMessageInvalidation } from "./useMessages";

interface TypingUser {
  userId: string;
  username: string;
  conversationId: string;
}

interface OnlineUser {
  userId: string;
  username: string;
}

export const useSocket = () => {
  const { user } = useAuthContext();
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const { invalidateConversations, invalidateMessages } =
    useMessageInvalidation();
  const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Initialize socket connection
  useEffect(() => {
    const token = getAuthToken();
    if (!user || !token) {
      return;
    }

    const socket = socketService.connect(token);
    if (!socket) return;

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleMessageReceived = (message: any) => {
      console.log("New message received:", message);

      // Invalidate queries to show new message
      if (message.conversationId) {
        invalidateMessages(message.conversationId);
        invalidateConversations();
      }
    };

    const handleMessageUpdated = (message: any) => {
      console.log("Message updated:", message);

      if (message.conversationId) {
        invalidateMessages(message.conversationId);
      }
    };

    const handleMessageDeleted = (data: {
      messageId: string;
      conversationId: string;
    }) => {
      console.log("Message deleted:", data);

      if (data.conversationId) {
        invalidateMessages(data.conversationId);
      }
    };

    const handleMessageRead = (data: {
      messageId: string;
      conversationId: string;
      userId: string;
    }) => {
      console.log("Message marked as read:", data);

      if (data.conversationId && data.userId !== user.id) {
        invalidateMessages(data.conversationId);
        invalidateConversations();
      }
    };

    const handleTyping = (data: TypingUser) => {
      if (data.userId === user.id) return; // Don't show own typing

      setTypingUsers((prev) => {
        const existing = prev.find(
          (u) =>
            u.userId === data.userId && u.conversationId === data.conversationId
        );
        if (existing) return prev;
        return [...prev, data];
      });

      // Clear existing timeout
      const timeoutKey = `${data.userId}-${data.conversationId}`;
      const existingTimeout = typingTimeoutRef.current.get(timeoutKey);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set new timeout to remove typing indicator
      const timeout = setTimeout(() => {
        setTypingUsers((prev) =>
          prev.filter(
            (u) =>
              !(
                u.userId === data.userId &&
                u.conversationId === data.conversationId
              )
          )
        );
        typingTimeoutRef.current.delete(timeoutKey);
      }, 3000);

      typingTimeoutRef.current.set(timeoutKey, timeout);
    };

    const handleStopTyping = (data: TypingUser) => {
      if (data.userId === user.id) return;

      setTypingUsers((prev) =>
        prev.filter(
          (u) =>
            !(
              u.userId === data.userId &&
              u.conversationId === data.conversationId
            )
        )
      );

      // Clear timeout
      const timeoutKey = `${data.userId}-${data.conversationId}`;
      const existingTimeout = typingTimeoutRef.current.get(timeoutKey);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        typingTimeoutRef.current.delete(timeoutKey);
      }
    };

    const handleUserOnline = (data: OnlineUser) => {
      setOnlineUsers((prev) => {
        const existing = prev.find((u) => u.userId === data.userId);
        if (existing) return prev;
        return [...prev, data];
      });
    };

    const handleUserOffline = (data: OnlineUser) => {
      setOnlineUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    };

    // Set up event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    socketService.onMessageReceived(handleMessageReceived);
    socketService.onMessageUpdated(handleMessageUpdated);
    socketService.onMessageDeleted(handleMessageDeleted);
    socketService.onMessageRead(handleMessageRead);
    socketService.onTyping(handleTyping);
    socketService.onStopTyping(handleStopTyping);
    socketService.onUserOnline(handleUserOnline);
    socketService.onUserOffline(handleUserOffline);

    // Initial connection state
    setIsConnected(socket.connected);

    return () => {
      // Clean up event listeners
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);

      socketService.offMessageReceived(handleMessageReceived);
      socketService.offMessageUpdated(handleMessageUpdated);
      socketService.offMessageDeleted(handleMessageDeleted);
      socketService.offMessageRead(handleMessageRead);
      socketService.offTyping(handleTyping);
      socketService.offStopTyping(handleStopTyping);
      socketService.offUserOnline(handleUserOnline);
      socketService.offUserOffline(handleUserOffline);

      // Clear all typing timeouts
      typingTimeoutRef.current.forEach((timeout) => clearTimeout(timeout));
      typingTimeoutRef.current.clear();
    };
  }, [user, invalidateMessages, invalidateConversations]);

  // Disconnect on unmount
  useEffect(() => {
    return () => {
      socketService.disconnect();
    };
  }, []);

  // Socket methods
  const joinConversations = useCallback((conversationIds: string[]) => {
    socketService.joinConversations(conversationIds);
  }, []);

  const joinConversation = useCallback((conversationId: string) => {
    socketService.joinConversation(conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    socketService.leaveConversation(conversationId);
  }, []);

  const sendMessage = useCallback(
    (data: {
      receiverId: string;
      courseId: string;
      content: string;
      tempId?: string;
      messageType?: "text" | "image" | "file";
    }) => {
      socketService.sendMessage(data);
    },
    []
  );

  const startTyping = useCallback((conversationId: string) => {
    socketService.startTyping(conversationId);
  }, []);

  const stopTyping = useCallback((conversationId: string) => {
    socketService.stopTyping(conversationId);
  }, []);

  const markMessageAsRead = useCallback(
    (messageId: string, conversationId: string) => {
      socketService.markMessageAsRead(messageId, conversationId);
    },
    []
  );

  // Get typing users for a specific conversation
  const getTypingUsers = useCallback(
    (conversationId: string) => {
      return typingUsers.filter(
        (user) => user.conversationId === conversationId
      );
    },
    [typingUsers]
  );

  // Check if user is online
  const isUserOnline = useCallback(
    (userId: string) => {
      return onlineUsers.some((user) => user.userId === userId);
    },
    [onlineUsers]
  );

  return {
    isConnected,
    typingUsers,
    onlineUsers,
    joinConversations,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    markMessageAsRead,
    getTypingUsers,
    isUserOnline,
  };
};

import { createMessage, updateMessage, deleteMessage, markMessageAsRead, } from "../services/messageService.js";
const validateMessageData = (data) => {
    if (!data.receiverId || !data.courseId || !data.content) {
        return {
            isValid: false,
            error: "Receiver ID, Course ID and content are required",
        };
    }
    if (data.content.length > 2000) {
        return {
            isValid: false,
            error: "Message content too long (max 2000 characters)",
        };
    }
    if (data.content.trim().length === 0) {
        return { isValid: false, error: "Message content cannot be empty" };
    }
    return { isValid: true };
};
export const registerMessageHandlers = (io, socket) => {
    console.log(`Message handlers registered for user: ${socket.user.username}`);
    // Join conversation room
    socket.on("conversation:join", (data) => {
        try {
            const { conversationId } = data;
            socket.join(`conversation:${conversationId}`);
            console.log(`User ${socket.user.username} joined conversation: ${conversationId}`);
            socket.emit("conversation:joined", { conversationId });
        }
        catch (error) {
            console.error("Error joining conversation:", error);
            socket.emit("error", { message: "Failed to join conversation" });
        }
    });
    // Leave conversation room
    socket.on("conversation:leave", (data) => {
        try {
            const { conversationId } = data;
            socket.leave(`conversation:${conversationId}`);
            console.log(`User ${socket.user.username} left conversation: ${conversationId}`);
        }
        catch (error) {
            console.error("Error leaving conversation:", error);
        }
    });
    // Send message
    socket.on("message:send", async (data) => {
        try {
            const validation = validateMessageData(data);
            if (!validation.isValid) {
                socket.emit("error", { message: validation.error });
                return;
            }
            const result = await createMessage({
                senderId: socket.user.id,
                receiverId: data.receiverId,
                courseId: data.courseId,
                content: data.content.trim(),
                messageType: data.messageType || "text",
            });
            if (!result.success || !result.data) {
                socket.emit("error", {
                    message: result.message || "Failed to send message",
                    tempId: data.tempId,
                });
                return;
            }
            const message = result.data;
            const conversationRoom = `conversation:${message.conversationId}`;
            // Emit to all users in the conversation
            io.to(conversationRoom).emit("message:new", {
                _id: message._id,
                content: message.content,
                senderId: message.senderId,
                receiverId: message.receiverId,
                conversationId: message.conversationId,
                messageType: message.messageType,
                isRead: message.isRead,
                createdAt: message.createdAt,
                tempId: data.tempId,
            });
            // Emit success to sender
            socket.emit("message:sent", {
                tempId: data.tempId,
                message: message,
            });
        }
        catch (error) {
            console.error("Error sending message:", error);
            socket.emit("error", {
                message: "Failed to send message",
                tempId: data.tempId,
            });
        }
    });
    // Edit message
    socket.on("message:edit", async (data) => {
        try {
            if (!data.messageId || !data.content) {
                socket.emit("error", {
                    message: "Message ID and content are required",
                });
                return;
            }
            if (data.content.trim().length === 0) {
                socket.emit("error", { message: "Message content cannot be empty" });
                return;
            }
            const result = await updateMessage(data.messageId, { content: data.content.trim() }, socket.user.id);
            if (!result.success || !result.data) {
                socket.emit("error", {
                    message: result.message || "Failed to edit message",
                });
                return;
            }
            const message = result.data;
            const conversationRoom = `conversation:${message.conversationId}`;
            // Emit to all users in the conversation
            io.to(conversationRoom).emit("message:updated", {
                _id: message._id,
                content: message.content,
                senderId: message.senderId,
                conversationId: message.conversationId,
                updatedAt: message.updatedAt,
                isEdited: true,
            });
        }
        catch (error) {
            console.error("Error editing message:", error);
            socket.emit("error", { message: "Failed to edit message" });
        }
    });
    // Delete message
    socket.on("message:delete", async (data) => {
        try {
            if (!data.messageId) {
                socket.emit("error", { message: "Message ID is required" });
                return;
            }
            const result = await deleteMessage(data.messageId, socket.user.id);
            if (!result.success || !result.data) {
                socket.emit("error", {
                    message: result.message || "Failed to delete message",
                });
                return;
            }
            const message = result.data;
            const conversationRoom = `conversation:${message.conversationId}`;
            // Emit to all users in the conversation
            io.to(conversationRoom).emit("message:deleted", {
                messageId: data.messageId,
                conversationId: message.conversationId,
            });
        }
        catch (error) {
            console.error("Error deleting message:", error);
            socket.emit("error", { message: "Failed to delete message" });
        }
    });
    // Typing indicator
    socket.on("message:typing", (data) => {
        try {
            if (!data.conversationId) {
                return;
            }
            const conversationRoom = `conversation:${data.conversationId}`;
            // Emit to other users in the conversation (not sender)
            socket.to(conversationRoom).emit("message:typing", {
                userId: socket.user.id,
                username: socket.user.username,
                conversationId: data.conversationId,
            });
        }
        catch (error) {
            console.error("Error handling typing indicator:", error);
        }
    });
    // Stop typing indicator
    socket.on("message:stopTyping", (data) => {
        try {
            if (!data.conversationId) {
                return;
            }
            const conversationRoom = `conversation:${data.conversationId}`;
            // Emit to other users in the conversation (not sender)
            socket.to(conversationRoom).emit("message:stopTyping", {
                userId: socket.user.id,
                username: socket.user.username,
                conversationId: data.conversationId,
            });
        }
        catch (error) {
            console.error("Error handling stop typing indicator:", error);
        }
    });
    // Mark message as read
    socket.on("message:markAsRead", async (data) => {
        try {
            if (!data.messageId || !data.conversationId) {
                return;
            }
            const result = await markMessageAsRead(data.messageId, socket.user.id);
            if (result.success) {
                const conversationRoom = `conversation:${data.conversationId}`;
                // Emit to all users in the conversation
                io.to(conversationRoom).emit("message:read", {
                    messageId: data.messageId,
                    conversationId: data.conversationId,
                    userId: socket.user.id,
                });
            }
        }
        catch (error) {
            console.error("Error marking message as read:", error);
        }
    });
    // Handle user online status
    socket.on("user:online", () => {
        socket.broadcast.emit("user:online", {
            userId: socket.user.id,
            username: socket.user.username,
        });
    });
    // Handle disconnect
    socket.on("disconnect", () => {
        console.log(`User ${socket.user.username} disconnected from messaging`);
        // Notify others that user is offline
        socket.broadcast.emit("user:offline", {
            userId: socket.user.id,
            username: socket.user.username,
        });
    });
};

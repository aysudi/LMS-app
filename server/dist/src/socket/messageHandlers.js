import * as messageService from "../services/messageService.js";
import * as conversationService from "../services/conversationService.js";
export const messageHandlers = (socket, io, connectedUsers, userSockets) => {
    // Handle sending messages
    socket.on("message:send", async (data) => {
        try {
            // Create the message
            const message = await messageService.createMessage({
                senderId: socket.userId,
                receiverId: data.receiverId,
                courseId: data.courseId,
                content: data.content,
                messageType: data.messageType || "text",
            });
            if (message.success && message.data) {
                // Get the conversation to find the room
                const conversation = await conversationService.findOrCreateConversation({
                    studentId: socket.userId === data.receiverId
                        ? socket.userId
                        : data.receiverId,
                    instructorId: socket.userId === data.receiverId
                        ? data.receiverId
                        : socket.userId,
                    courseId: data.courseId,
                });
                if (conversation.success && conversation.data) {
                    const conversationRoom = `conversation:${conversation.data._id}`;
                    // Emit to all users in the conversation room
                    io.to(conversationRoom).emit("message:received", {
                        ...message.data,
                        conversationId: conversation.data._id,
                        tempId: data.tempId,
                    });
                    // Also emit conversation update
                    io.to(conversationRoom).emit("conversation:updated", conversation.data);
                }
            }
        }
        catch (error) {
            console.error("❌ Error sending message:", error);
            socket.emit("message:error", {
                tempId: data.tempId,
                error: "Failed to send message",
            });
        }
    });
    // Handle typing indicators
    socket.on("typing:start", (data) => {
        const conversationRoom = `conversation:${data.conversationId}`;
        socket.to(conversationRoom).emit("typing:started", {
            userId: socket.userId,
            username: `${socket.userFirstName} ${socket.userLastName}`,
            conversationId: data.conversationId,
        });
    });
    socket.on("typing:stop", (data) => {
        const conversationRoom = `conversation:${data.conversationId}`;
        socket.to(conversationRoom).emit("typing:stopped", {
            userId: socket.userId,
            username: `${socket.userFirstName} ${socket.userLastName}`,
            conversationId: data.conversationId,
        });
    });
    // Handle message read receipts
    socket.on("message:read", async (data) => {
        try {
            // Mark message as read
            await messageService.markMessagesAsRead(data.conversationId, socket.userId);
            const conversationRoom = `conversation:${data.conversationId}`;
            // Notify other participants
            socket.to(conversationRoom).emit("message:read", {
                messageId: data.messageId,
                conversationId: data.conversationId,
                userId: socket.userId,
            });
        }
        catch (error) {
            console.error("❌ Error marking message as read:", error);
        }
    });
    // Handle message updates
    socket.on("message:update", async (data) => {
        try {
            // Update message (implement this in messageService if needed)
            // const updatedMessage = await messageService.updateMessage(data.messageId, data.content, socket.userId);
            const conversationRoom = `conversation:${data.conversationId}`;
            // Emit to all users in the conversation
            socket.to(conversationRoom).emit("message:updated", {
                messageId: data.messageId,
                content: data.content,
                conversationId: data.conversationId,
                updatedBy: socket.userId,
                updatedAt: new Date().toISOString(),
            });
        }
        catch (error) {
            console.error("❌ Error updating message:", error);
        }
    });
    // Handle message deletion
    socket.on("message:delete", async (data) => {
        try {
            // Delete message (implement this in messageService if needed)
            // await messageService.deleteMessage(data.messageId, userSocket.userId);
            const conversationRoom = `conversation:${data.conversationId}`;
            // Emit to all users in the conversation
            socket.to(conversationRoom).emit("message:deleted", {
                messageId: data.messageId,
                conversationId: data.conversationId,
                deletedBy: socket.userId,
            });
        }
        catch (error) {
            console.error("❌ Error deleting message:", error);
        }
    });
};

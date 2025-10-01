import { getInstructorMessagesService, replyToMessageService, markMessageAsReadService, markMessageAsResolvedService, getMessageStatsService } from "../services/instructorCommunicationService.js";
// Get all messages for instructor
export const getInstructorMessages = async (req, res) => {
    try {
        const instructorId = req.user?.id;
        const { page = 1, limit = 20, status = "all", type = "all", courseId, } = req.query;
        if (!instructorId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const data = await getInstructorMessagesService(instructorId, Number(page), Number(limit), status, type, courseId);
        res.json({
            success: true,
            data
        });
    }
    catch (error) {
        console.error("Get instructor messages error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get messages",
        });
    }
};
// Reply to a message
export const replyToMessage = async (req, res) => {
    try {
        const instructorId = req.user?.id;
        const { messageId } = req.params;
        const { message } = req.body;
        if (!instructorId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Reply message is required",
            });
        }
        const data = await replyToMessageService(instructorId, messageId, message.trim());
        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Message not found or access denied",
            });
        }
        res.json({
            success: true,
            message: "Reply sent successfully",
            data
        });
    }
    catch (error) {
        console.error("Reply to message error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send reply",
        });
    }
};
// Mark message as read
export const markMessageAsRead = async (req, res) => {
    try {
        const instructorId = req.user?.id;
        const { messageId } = req.params;
        if (!instructorId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const success = await markMessageAsReadService(instructorId, messageId);
        if (!success) {
            return res.status(404).json({
                success: false,
                message: "Message not found or already read",
            });
        }
        res.json({
            success: true,
            message: "Message marked as read",
        });
    }
    catch (error) {
        console.error("Mark message as read error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to mark message as read",
        });
    }
};
// Mark message as resolved
export const markMessageAsResolved = async (req, res) => {
    try {
        const instructorId = req.user?.id;
        const { messageId } = req.params;
        if (!instructorId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const success = await markMessageAsResolvedService(instructorId, messageId);
        if (!success) {
            return res.status(404).json({
                success: false,
                message: "Message not found or access denied",
            });
        }
        res.json({
            success: true,
            message: "Message marked as resolved",
        });
    }
    catch (error) {
        console.error("Mark message as resolved error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to mark message as resolved",
        });
    }
};
// Get message statistics
export const getMessageStats = async (req, res) => {
    try {
        const instructorId = req.user?.id;
        if (!instructorId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const data = await getMessageStatsService(instructorId);
        res.json({
            success: true,
            data
        });
    }
    catch (error) {
        console.error("Get message stats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get message statistics",
        });
    }
};
export default {
    getInstructorMessages,
    replyToMessage,
    markMessageAsRead,
    markMessageAsResolved,
    getMessageStats,
};

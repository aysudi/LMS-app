import express from "express";
import { authenticateToken } from "../middlewares/auth.middleware";
import { createMessage, getConversations, getMessages, markMessagesAsRead, getConversationById, deleteConversation, } from "../controllers/messageController.js";
const router = express.Router();
// All routes require authentication
router.use(authenticateToken);
// Create a new message
router.post("/", createMessage);
// Get user's conversations
router.get("/conversations", getConversations);
// Get conversation by ID
router.get("/conversations/:id", getConversationById);
// Delete conversation
router.delete("/conversations/:id", deleteConversation);
// Get messages for a conversation
router.get("/conversations/:id/messages", getMessages);
// Mark messages as read
router.patch("/conversations/:id/read", markMessagesAsRead);
export default router;

import { Router } from "express";
import {
  getUserConversations,
  getConversation,
  createNewConversation,
  markConversationRead,
  removeConversation,
  getOrCreateConversation,
} from "../controllers/conversationController.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const conversationRouter = Router();

// All conversation routes require authentication
conversationRouter.use(authenticateToken);

// GET /api/conversations - Get user's conversations
conversationRouter.get("/", getUserConversations);

// GET /api/conversations/:conversationId - Get single conversation
conversationRouter.get("/:conversationId", getConversation);

// POST /api/conversations - Create new conversation
conversationRouter.post("/", createNewConversation);

// POST /api/conversations/find-or-create - Get or create conversation
conversationRouter.post("/find-or-create", getOrCreateConversation);

// PUT /api/conversations/:conversationId/read - Mark conversation as read
conversationRouter.put("/:conversationId/read", markConversationRead);

// DELETE /api/conversations/:conversationId - Delete conversation
conversationRouter.delete("/:conversationId", removeConversation);

export default conversationRouter;

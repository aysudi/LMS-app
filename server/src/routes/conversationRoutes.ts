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

conversationRouter.use(authenticateToken);

conversationRouter.get("/", getUserConversations);

conversationRouter.get("/:conversationId", getConversation);

conversationRouter.post("/", createNewConversation);

conversationRouter.post("/find-or-create", getOrCreateConversation);

conversationRouter.put("/:conversationId/read", markConversationRead);

conversationRouter.delete("/:conversationId", removeConversation);

export default conversationRouter;

import { Request, Response } from "express";
import {
  createConversation,
  getConversations,
  getConversationById,
  deleteConversation,
  markConversationAsRead,
  findOrCreateConversation,
} from "../services/conversationService.js";

// Get user's conversations
export const getUserConversations = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.userId;
    const { search, page, limit } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = await getConversations({
      userId,
      search: search as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getUserConversations:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get single conversation by ID
export const getConversation = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.userId;
    const { conversationId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
    }

    const result = await getConversationById({
      conversationId,
      userId,
    });

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getConversation:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Create new conversation
export const createNewConversation = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.userId;
    const {
      participants: { instructor: instructorId },
      courseId,
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!instructorId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Instructor ID and Course ID are required",
      });
    }
    console.log(
      "user id:",
      userId,
      "instructorId:",
      instructorId,
      "courseId:",
      courseId
    );

    const result = await findOrCreateConversation({
      studentId: userId,
      instructorId,
      courseId,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    const statusCode = (result as any).isNew ? 201 : 200;
    res.status(statusCode).json({
      success: true,
      data: result.data,
      message: (result as any).isNew
        ? "Conversation created successfully"
        : "Conversation already exists",
    });
  } catch (error) {
    console.error("Error in createNewConversation:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Mark conversation as read
export const markConversationRead = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.userId;
    const { conversationId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
    }

    const result = await markConversationAsRead(conversationId, userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in markConversationRead:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete conversation
export const removeConversation = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.userId;
    const { conversationId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
    }

    const result = await deleteConversation(conversationId, userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in removeConversation:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get or create conversation for messaging
export const getOrCreateConversation = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.userId;
    const { instructorId, courseId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!instructorId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Instructor ID and Course ID are required",
      });
    }

    const result = await findOrCreateConversation({
      studentId: userId,
      instructorId,
      courseId,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json({
      success: true,
      data: result.data,
      isNew: (result as any).isNew,
    });
  } catch (error) {
    console.error("Error in getOrCreateConversation:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

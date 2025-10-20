import { Request, Response } from "express";
import * as messageService from "../services/messageService";

// Create a new message
export const createMessage = async (req: Request, res: Response) => {
  try {
    const { receiverId, courseId, content, messageType } = req.body;
    const senderId = (req.user as any).userId;

    const message = await messageService.createMessage({
      senderId,
      receiverId,
      courseId,
      content,
      messageType,
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to send message",
    });
  }
};

// Get user's conversations
export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).userId;
    const { page, limit, search, courseId } = req.query;

    const result = await messageService.getConversations({
      userId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string,
      courseId: courseId as string,
    });

    res.status(200).json({
      success: true,
      message: "Conversations retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to retrieve conversations",
    });
  }
};

// Get messages for a conversation
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { id: conversationId } = req.params;
    const userId = (req.user as any).userId;
    const { page, limit } = req.query;

    const result = await messageService.getMessages({
      conversationId,
      userId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    res.status(200).json({
      success: true,
      message: "Messages retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to retrieve messages",
    });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req: Request, res: Response) => {
  try {
    const { id: conversationId } = req.params;
    const userId = (req.user as any).userId;

    const result = await messageService.markMessagesAsRead(
      conversationId,
      userId
    );

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to mark messages as read",
    });
  }
};

// Get conversation by ID
export const getConversationById = async (req: Request, res: Response) => {
  try {
    const { id: conversationId } = req.params;
    const userId = (req.user as any).userId;

    const conversation = await messageService.getConversationById(
      conversationId,
      userId
    );

    res.status(200).json({
      success: true,
      message: "Conversation retrieved successfully",
      data: conversation,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to retrieve conversation",
    });
  }
};

// Delete conversation
export const deleteConversation = async (req: Request, res: Response) => {
  try {
    const { id: conversationId } = req.params;
    const userId = (req.user as any).userId;

    const conversation = await messageService.deleteConversation(
      conversationId,
      userId
    );

    res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
      data: conversation,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to delete conversation",
    });
  }
};

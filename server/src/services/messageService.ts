import MessageModel from "../models/Message.js";
import ConversationModel from "../models/Conversation.js";
import EnrollmentModel from "../models/Enrollment.js";
import CourseModel from "../models/Course.js";
import { findOrCreateConversation } from "./conversationService.js";
import mongoose from "mongoose";

export interface CreateMessageData {
  senderId: string;
  receiverId: string;
  courseId: string;
  content: string;
  messageType?: "text" | "image" | "file";
}

export interface GetConversationsQuery {
  userId: string;
  page?: number;
  limit?: number;
  search?: string;
  courseId?: string;
}

export interface GetMessagesQuery {
  conversationId: string;
  userId: string;
  page?: number;
  limit?: number;
}

// Create a new message
export const createMessage = async (messageData: CreateMessageData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      senderId,
      receiverId,
      courseId,
      content,
      messageType = "text",
    } = messageData;
    const enrollment = await EnrollmentModel.findOne({
      user: senderId,
      course: courseId,
    }).session(session);

    const course = await CourseModel.findById(courseId).session(session);

    if (!course) {
      throw new Error("Course not found");
    }

    const isStudentToInstructor =
      senderId !== course.instructor.toString() &&
      receiverId === course.instructor.toString();

    const isInstructorToStudent =
      senderId === course.instructor.toString() &&
      receiverId !== course.instructor.toString();

    if (!isStudentToInstructor && !isInstructorToStudent) {
      throw new Error("Invalid conversation participants");
    }

    if (isStudentToInstructor && !enrollment) {
      throw new Error(
        "You must be enrolled in this course to message the instructor"
      );
    }

    const conversationData = {
      studentId: isStudentToInstructor ? senderId : receiverId,
      instructorId: isStudentToInstructor ? receiverId : senderId,
      courseId: courseId,
    };
    const conversationResult = await findOrCreateConversation(conversationData);

    if (!conversationResult.success || !conversationResult.data) {
      throw new Error("Failed to create conversation");
    }

    const conversation = conversationResult.data;

    const message = new MessageModel({
      senderId,
      receiverId,
      conversationId: conversation._id,
      content,
      messageType,
      isRead: false,
    });

    await message.save({ session });

    // Update conversation's last message
    await ConversationModel.findByIdAndUpdate(
      conversation._id,
      {
        lastMessage: message._id,
        updatedAt: new Date(),
      },
      { session }
    );

    await session.commitTransaction();

    // Populate and return the message
    const populatedMessage = await MessageModel.findById(message._id)
      .populate("senderId", "firstName lastName email profilePicture")
      .populate("receiverId", "firstName lastName email profilePicture");

    return {
      success: true,
      data: populatedMessage,
      message: "Message sent successfully",
    };
  } catch (error) {
    await session.abortTransaction();
    console.error("Error creating message:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to send message",
    };
  } finally {
    session.endSession();
  }
};

// Get messages for a conversation
export const getMessages = async (query: GetMessagesQuery) => {
  try {
    const { conversationId, userId, page = 1, limit = 50 } = query;

    // Verify user is part of the conversation
    const conversation = await ConversationModel.findOne({
      _id: conversationId,
      $or: [
        { "participants.student": userId },
        { "participants.instructor": userId },
      ],
    });

    if (!conversation) {
      return {
        success: false,
        message: "Conversation not found or access denied",
      };
    }

    const skip = (page - 1) * limit;

    const [messages, totalMessages] = await Promise.all([
      MessageModel.find({ conversationId })
        .populate("senderId", "firstName lastName email profilePicture")
        .populate("receiverId", "firstName lastName email profilePicture")
        .sort({ createdAt: 1 }) // Oldest first for chat display
        .skip(skip)
        .limit(limit)
        .lean(),
      MessageModel.countDocuments({ conversationId }),
    ]);

    const totalPages = Math.ceil(totalMessages / limit);

    return {
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: page,
          totalPages,
          totalMessages,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("Error getting messages:", error);
    return {
      success: false,
      message: "Failed to retrieve messages",
    };
  }
};

// Mark messages as read
export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
) => {
  try {
    const result = await MessageModel.updateMany(
      {
        conversationId,
        receiverId: userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    return {
      success: true,
      data: { modifiedCount: result.modifiedCount },
      message: "Messages marked as read",
    };
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return {
      success: false,
      message: "Failed to mark messages as read",
    };
  }
};

// Update message
export const updateMessage = async (
  messageId: string,
  updateData: { content: string },
  userId: string
) => {
  try {
    const message = await MessageModel.findOne({
      _id: messageId,
      senderId: userId,
    });

    if (!message) {
      return {
        success: false,
        message: "Message not found or access denied",
      };
    }

    message.content = updateData.content;
    message.updatedAt = new Date();
    await message.save();

    const populatedMessage = await MessageModel.findById(message._id)
      .populate("senderId", "firstName lastName email profilePicture")
      .populate("receiverId", "firstName lastName email profilePicture");

    return {
      success: true,
      data: populatedMessage,
      message: "Message updated successfully",
    };
  } catch (error) {
    console.error("Error updating message:", error);
    return {
      success: false,
      message: "Failed to update message",
    };
  }
};

// Delete message
export const deleteMessage = async (messageId: string, userId: string) => {
  try {
    const message = await MessageModel.findOne({
      _id: messageId,
      senderId: userId,
    });

    if (!message) {
      return {
        success: false,
        message: "Message not found or access denied",
      };
    }

    await MessageModel.findByIdAndDelete(messageId);

    return {
      success: true,
      data: message,
      message: "Message deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting message:", error);
    return {
      success: false,
      message: "Failed to delete message",
    };
  }
};

// Mark specific message as read
export const markMessageAsRead = async (messageId: string, userId: string) => {
  try {
    const result = await MessageModel.findOneAndUpdate(
      {
        _id: messageId,
        receiverId: userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
      { new: true }
    );

    if (!result) {
      return {
        success: false,
        message: "Message not found or already read",
      };
    }

    return {
      success: true,
      data: result,
      message: "Message marked as read",
    };
  } catch (error) {
    console.error("Error marking message as read:", error);
    return {
      success: false,
      message: "Failed to mark message as read",
    };
  }
};

// Get conversations for a user - Delegates to conversationService
export const getConversations = async (query: GetConversationsQuery) => {
  try {
    const {
      findOrCreateConversation,
      getConversations: getConversationsFromService,
    } = await import("./conversationService.js");
    return await getConversationsFromService(query);
  } catch (error) {
    console.error("Error getting conversations:", error);
    return {
      success: false,
      message: "Failed to retrieve conversations",
    };
  }
};

// Get conversation by ID - Delegates to conversationService
export const getConversationById = async (
  conversationId: string,
  userId: string
) => {
  try {
    const { getConversationById: getConversationByIdFromService } =
      await import("./conversationService.js");
    return await getConversationByIdFromService({ conversationId, userId });
  } catch (error) {
    console.error("Error getting conversation by ID:", error);
    return {
      success: false,
      message: "Failed to retrieve conversation",
    };
  }
};

// Delete conversation - Delegates to conversationService
export const deleteConversation = async (
  conversationId: string,
  userId: string
) => {
  try {
    const { deleteConversation: deleteConversationFromService } = await import(
      "./conversationService.js"
    );
    return await deleteConversationFromService(conversationId, userId);
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return {
      success: false,
      message: "Failed to delete conversation",
    };
  }
};

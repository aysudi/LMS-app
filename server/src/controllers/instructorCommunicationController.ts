import { Response } from "express";
import { AuthRequest } from "../types/common.types";
import InstructorCommunication from "../models/InstructorCommunication";
import Course from "../models/Course";
import { MessageStatus } from "../schemas/instructorCommunicationSchema";

// Get all messages for instructor
export const getInstructorMessages = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const instructorId = req.user?.id;
    const {
      page = 1,
      limit = 20,
      status = "all",
      type = "all",
      courseId,
    } = req.query;

    if (!instructorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const skip = (Number(page) - 1) * Number(limit);

    let filter: any = { instructor: instructorId };

    if (status !== "all") filter.status = status;
    if (type !== "all") filter.type = type;
    if (courseId) filter.course = courseId;

    const messages = await InstructorCommunication.find(filter)
      .populate("student", "firstName lastName email avatar")
      .populate("course", "title")
      .populate("lesson", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalMessages = await InstructorCommunication.countDocuments(filter);

    // Get unread count
    const unreadCount = await InstructorCommunication.countDocuments({
      instructor: instructorId,
      status: MessageStatus.UNREAD,
    });

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalMessages / Number(limit)),
          totalMessages,
          hasNext: Number(page) * Number(limit) < totalMessages,
          hasPrev: Number(page) > 1,
        },
        unreadCount,
      },
    });
  } catch (error: any) {
    console.error("Get instructor messages error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get messages",
    });
  }
};

// Reply to a message
export const replyToMessage = async (req: AuthRequest, res: Response) => {
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

    // Find and verify message ownership
    const communication = await InstructorCommunication.findOne({
      _id: messageId,
      instructor: instructorId,
    });

    if (!communication) {
      return res.status(404).json({
        success: false,
        message: "Message not found or access denied",
      });
    }

    // Add reply
    communication.replies.push({
      sender: instructorId,
      message: message.trim(),
      timestamp: new Date(),
      isInstructorReply: true,
    });

    // Update status and last reply time
    communication.status = MessageStatus.REPLIED;
    communication.lastReplyAt = new Date();

    await communication.save();

    // Populate the updated message
    await communication.populate("student", "firstName lastName email avatar");
    await communication.populate("course", "title");

    res.json({
      success: true,
      message: "Reply sent successfully",
      data: communication,
    });
  } catch (error: any) {
    console.error("Reply to message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send reply",
    });
  }
};

// Mark message as read
export const markMessageAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const instructorId = req.user?.id;
    const { messageId } = req.params;

    if (!instructorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const communication = await InstructorCommunication.findOneAndUpdate(
      {
        _id: messageId,
        instructor: instructorId,
        status: MessageStatus.UNREAD,
      },
      {
        status: MessageStatus.READ,
      },
      { new: true }
    );

    if (!communication) {
      return res.status(404).json({
        success: false,
        message: "Message not found or already read",
      });
    }

    res.json({
      success: true,
      message: "Message marked as read",
    });
  } catch (error: any) {
    console.error("Mark message as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark message as read",
    });
  }
};

// Mark message as resolved
export const markMessageAsResolved = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const instructorId = req.user?.id;
    const { messageId } = req.params;

    if (!instructorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const communication = await InstructorCommunication.findOneAndUpdate(
      {
        _id: messageId,
        instructor: instructorId,
      },
      {
        status: MessageStatus.RESOLVED,
      },
      { new: true }
    );

    if (!communication) {
      return res.status(404).json({
        success: false,
        message: "Message not found or access denied",
      });
    }

    res.json({
      success: true,
      message: "Message marked as resolved",
    });
  } catch (error: any) {
    console.error("Mark message as resolved error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark message as resolved",
    });
  }
};

// Get message statistics
export const getMessageStats = async (req: AuthRequest, res: Response) => {
  try {
    const instructorId = req.user?.id;

    if (!instructorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Get counts by status
    const statusStats = await InstructorCommunication.aggregate([
      { $match: { instructor: instructorId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get counts by type
    const typeStats = await InstructorCommunication.aggregate([
      { $match: { instructor: instructorId } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get recent messages (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentCount = await InstructorCommunication.countDocuments({
      instructor: instructorId,
      createdAt: { $gte: sevenDaysAgo },
    });

    // Format stats
    const stats = {
      byStatus: statusStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as Record<string, number>),
      byType: typeStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as Record<string, number>),
      recentMessages: recentCount,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
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

import { Request, Response } from "express";
import { AuthRequest } from "../types/common.types.js";
import CourseMessage from "../models/CourseMessage.js";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import mongoose from "mongoose";
import { getIO } from "../socket/socketManager.js";

// Send a message to course group chat
export const sendCourseMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { content, course: courseId, messageType = "text" } = req.body;
    const senderId = req.user?.userId;

    if (!content || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Content and course ID are required",
      });
    }

    // Verify user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      user: senderId,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to send messages",
      });
    }

    // Create the message
    const message = await CourseMessage.create({
      content,
      sender: senderId,
      course: courseId,
      messageType,
    });

    // Populate sender information
    const populatedMessage = await CourseMessage.findById(message._id).populate(
      "sender",
      "firstName lastName avatar"
    );

    // Emit to all users in the course room
    const io = getIO();
    if (io) {
      io.to(`course-${courseId}`).emit("newCourseMessage", {
        message: populatedMessage,
        course: courseId,
      });

      // Log how many clients are in this room
      const room = io.sockets.adapter.rooms.get(`course-${courseId}`);
    } else {
      console.log("❌ Socket.IO instance not available");
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    console.error("Send course message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get messages for a course
export const getCourseMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user?.userId;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // Verify user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to view messages",
      });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const messages = await CourseMessage.find({
      course: courseId,
      isDeleted: false,
    })
      .populate("sender", "firstName lastName avatar")
      .populate("replyTo")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip)
      .lean();

    const totalMessages = await CourseMessage.countDocuments({
      course: courseId,
      isDeleted: false,
    });

    res.status(200).json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalMessages,
          pages: Math.ceil(totalMessages / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get course messages error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get messages",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.userId;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // Verify user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course",
      });
    }

    // Mark all unread messages as read for this user (excluding user's own messages)
    await CourseMessage.updateMany(
      {
        course: courseId,
        sender: { $ne: userId }, // Don't mark user's own messages as read
        "readBy.user": { $ne: userId },
        isDeleted: false,
      },
      {
        $push: {
          readBy: {
            user: userId,
            readAt: new Date(),
          },
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Mark messages as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get unread message count for courses
export const getUnreadMessageCounts = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    // Get all user enrollments
    const enrollments = await Enrollment.find({
      user: userId,
    }).select("course");

    const courseIds = enrollments.map((e) => e.course);

    // Get unread message counts for each course (excluding user's own messages)
    const unreadCounts = await CourseMessage.aggregate([
      {
        $match: {
          course: { $in: courseIds },
          isDeleted: false,
          sender: { $ne: new mongoose.Types.ObjectId(userId) }, // Exclude user's own messages
          "readBy.user": { $ne: new mongoose.Types.ObjectId(userId) },
        },
      },
      {
        $group: {
          _id: "$course",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format the response
    const countsMap = unreadCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {} as Record<string, number>);

    res.status(200).json({
      success: true,
      data: countsMap,
    });
  } catch (error) {
    console.error("Get unread message counts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get unread message counts",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Delete a message (soft delete)
export const deleteCourseMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = req.user?.userId;

    const message = await CourseMessage.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Only the sender can delete their message
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages",
      });
    }

    // Soft delete
    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    // Emit to course room
    const io = getIO();
    if (io) {
      io.to(`course-${message.course}`).emit("messageDeleted", {
        messageId: message._id,
        courseId: message.course,
      });
    }

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Delete course message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete message",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Edit a message
export const editCourseMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    const message = await CourseMessage.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Only the sender can edit their message
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own messages",
      });
    }

    // Update message
    message.content = content;
    message.editedAt = new Date();
    await message.save();

    // Populate and emit
    const updatedMessage = await CourseMessage.findById(message._id)
      .populate("sender", "firstName lastName avatar")
      .populate("course", "title");

    const io = getIO();
    if (io) {
      io.to(`course-${message.course}`).emit("messageEdited", {
        message: updatedMessage,
        courseId: message.course,
      });
    }

    res.status(200).json({
      success: true,
      message: "Message updated successfully",
      data: updatedMessage,
    });
  } catch (error) {
    console.error("Edit course message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to edit message",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

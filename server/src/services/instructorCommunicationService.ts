import InstructorCommunication from "../models/InstructorCommunication.js";
import { MessageStatus } from "../schemas/instructorCommunicationSchema.js";

// Get all messages for instructor with filtering and pagination
export const getInstructorMessagesService = async (
  instructorId: string,
  page: number,
  limit: number,
  status: string = "all",
  type: string = "all",
  courseId?: string
) => {
  const skip = (page - 1) * limit;

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
    .limit(limit);

  const totalMessages = await InstructorCommunication.countDocuments(filter);

  const unreadCount = await InstructorCommunication.countDocuments({
    instructor: instructorId,
    status: MessageStatus.UNREAD,
  });

  return {
    messages,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalMessages / limit),
      totalMessages,
      hasNext: page * limit < totalMessages,
      hasPrev: page > 1,
    },
    unreadCount,
  };
};

// Reply to a student message
export const replyToMessageService = async (
  instructorId: string,
  messageId: string,
  message: string
) => {
  // Find and verify message ownership
  const communication = await InstructorCommunication.findOne({
    _id: messageId,
    instructor: instructorId,
  });

  if (!communication) {
    return null;
  }

  // Add reply
  communication.replies.push({
    sender: instructorId,
    message,
    timestamp: new Date(),
    isInstructorReply: true,
  });

  // Update status and last reply time
  communication.status = MessageStatus.REPLIED;
  communication.lastReplyAt = new Date();

  await communication.save();

  await communication.populate("student", "firstName lastName email avatar");
  await communication.populate("course", "title");

  return communication;
};

// Mark message as read
export const markMessageAsReadService = async (
  instructorId: string,
  messageId: string
) => {
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

  return !!communication;
};

// Mark message as resolved
export const markMessageAsResolvedService = async (
  instructorId: string,
  messageId: string
) => {
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

  return !!communication;
};

// Get comprehensive message statistics for instructor
export const getMessageStatsService = async (instructorId: string) => {
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
  return {
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
};

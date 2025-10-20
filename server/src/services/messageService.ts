import Message from "../models/Message";
import Conversation from "../models/Conversation";
import Enrollment from "../models/Enrollment";
import User from "../models/User";
import Course from "../models/Course";
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

    // Verify enrollment: Check if the student is enrolled in the instructor's course
    const enrollment = await Enrollment.findOne({
      userId: senderId,
      courseId: courseId,
      status: "active",
    }).session(session);

    const course = await Course.findById(courseId).session(session);

    if (!course) {
      throw new Error("Course not found");
    }

    // Check if either sender or receiver is the course instructor
    const isValidConversation =
      senderId === receiverId
        ? false // Can't message yourself
        : senderId === course.instructor.toString() ||
          receiverId === course.instructor.toString();

    if (!isValidConversation) {
      throw new Error("Invalid conversation participants");
    }

    // If sender is student, check enrollment
    if (senderId !== course.instructor.toString()) {
      if (!enrollment) {
        throw new Error(
          "You must be enrolled in this course to message the instructor"
        );
      }
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      $or: [
        {
          "participants.student":
            senderId === course.instructor.toString() ? receiverId : senderId,
          "participants.instructor":
            senderId === course.instructor.toString() ? senderId : receiverId,
          courseId: courseId,
        },
      ],
    }).session(session);

    if (!conversation) {
      conversation = new Conversation({
        participants: {
          student:
            senderId === course.instructor.toString() ? receiverId : senderId,
          instructor:
            senderId === course.instructor.toString() ? senderId : receiverId,
        },
        courseId: courseId,
        isActive: true,
      });
      await conversation.save({ session });
    }

    // Create the message
    const message = new Message({
      senderId,
      receiverId,
      conversationId: conversation._id,
      content,
      messageType,
      isRead: false,
    });

    await message.save({ session });

    // Update conversation's last message
    conversation.lastMessage = message._id as mongoose.Types.ObjectId;
    conversation.updatedAt = new Date();
    await conversation.save({ session });

    await session.commitTransaction();

    // Populate the message with sender details
    await message.populate([
      {
        path: "senderId",
        select: "firstName lastName email profilePicture",
      },
      {
        path: "receiverId",
        select: "firstName lastName email profilePicture",
      },
    ]);

    return message;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Get conversations for a user
export const getConversations = async (query: GetConversationsQuery) => {
  try {
    const { userId, page = 1, limit = 20, search, courseId } = query;

    // Build filter
    const filter: any = {
      $or: [
        { "participants.student": userId },
        { "participants.instructor": userId },
      ],
      isActive: true,
    };

    if (courseId) {
      filter.courseId = courseId;
    }

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: filter },
      {
        $lookup: {
          from: "users",
          localField: "participants.student",
          foreignField: "_id",
          as: "student",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "participants.instructor",
          foreignField: "_id",
          as: "instructor",
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },
      {
        $lookup: {
          from: "messages",
          localField: "lastMessage",
          foreignField: "_id",
          as: "lastMessageData",
        },
      },
      {
        $addFields: {
          student: { $arrayElemAt: ["$student", 0] },
          instructor: { $arrayElemAt: ["$instructor", 0] },
          course: { $arrayElemAt: ["$course", 0] },
          lastMessageData: { $arrayElemAt: ["$lastMessageData", 0] },
        },
      },
      {
        $project: {
          participants: {
            student: {
              _id: "$student._id",
              firstName: "$student.firstName",
              lastName: "$student.lastName",
              email: "$student.email",
              profilePicture: "$student.profilePicture",
            },
            instructor: {
              _id: "$instructor._id",
              firstName: "$instructor.firstName",
              lastName: "$instructor.lastName",
              email: "$instructor.email",
              profilePicture: "$instructor.profilePicture",
            },
          },
          course: {
            _id: "$course._id",
            title: "$course.title",
            thumbnail: "$course.thumbnail",
          },
          lastMessage: "$lastMessageData",
          isActive: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];

    // Add search filter if provided
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            {
              "participants.student.firstName": {
                $regex: search,
                $options: "i",
              },
            },
            {
              "participants.student.lastName": {
                $regex: search,
                $options: "i",
              },
            },
            {
              "participants.instructor.firstName": {
                $regex: search,
                $options: "i",
              },
            },
            {
              "participants.instructor.lastName": {
                $regex: search,
                $options: "i",
              },
            },
            { "course.title": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    // Add sorting
    pipeline.push({ $sort: { updatedAt: -1 } });

    // Get total count
    const totalPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await Conversation.aggregate(totalPipeline);
    const totalConversations = totalResult[0]?.total || 0;

    // Add pagination
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip }, { $limit: limit });

    const conversations = await Conversation.aggregate(pipeline);

    // Calculate unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          receiverId: userId,
          isRead: false,
        });

        return {
          ...conv,
          unreadCount,
        };
      })
    );

    const totalPages = Math.ceil(totalConversations / limit);

    return {
      conversations: conversationsWithUnread,
      pagination: {
        currentPage: page,
        totalPages,
        totalConversations,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error) {
    throw new Error("Failed to retrieve conversations");
  }
};

// Get messages for a conversation
export const getMessages = async (query: GetMessagesQuery) => {
  try {
    const { conversationId, userId, page = 1, limit = 50 } = query;

    // Verify user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      $or: [
        { "participants.student": userId },
        { "participants.instructor": userId },
      ],
    });

    if (!conversation) {
      throw new Error("Conversation not found or access denied");
    }

    const skip = (page - 1) * limit;

    // Get messages with pagination
    const [messages, totalMessages] = await Promise.all([
      Message.find({ conversationId })
        .populate("senderId", "firstName lastName email profilePicture")
        .populate("receiverId", "firstName lastName email profilePicture")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments({ conversationId }),
    ]);

    // Reverse to show oldest first
    messages.reverse();

    const totalPages = Math.ceil(totalMessages / limit);

    return {
      messages,
      pagination: {
        currentPage: page,
        totalPages,
        totalMessages,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error) {
    throw new Error("Failed to retrieve messages");
  }
};

// Mark messages as read
export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
) => {
  try {
    const result = await Message.updateMany(
      {
        conversationId,
        receiverId: userId,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    return result;
  } catch (error) {
    throw new Error("Failed to mark messages as read");
  }
};

// Get conversation by ID
export const getConversationById = async (
  conversationId: string,
  userId: string
) => {
  try {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      $or: [
        { "participants.student": userId },
        { "participants.instructor": userId },
      ],
    })
      .populate(
        "participants.student",
        "firstName lastName email profilePicture"
      )
      .populate(
        "participants.instructor",
        "firstName lastName email profilePicture"
      )
      .populate("courseId", "title thumbnail")
      .populate("lastMessage");

    if (!conversation) {
      throw new Error("Conversation not found or access denied");
    }

    return conversation;
  } catch (error) {
    throw new Error("Failed to retrieve conversation");
  }
};

// Delete a conversation (soft delete)
export const deleteConversation = async (
  conversationId: string,
  userId: string
) => {
  try {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      $or: [
        { "participants.student": userId },
        { "participants.instructor": userId },
      ],
    });

    if (!conversation) {
      throw new Error("Conversation not found or access denied");
    }

    conversation.isActive = false;
    await conversation.save();

    return conversation;
  } catch (error) {
    throw new Error("Failed to delete conversation");
  }
};

import ConversationModel from "../models/Conversation.js";
import MessageModel from "../models/Message.js";
import EnrollmentModel from "../models/Enrollment.js";
import CourseModel from "../models/Course.js";
import UserModel from "../models/User.js";
import { Types } from "mongoose";

interface CreateConversationData {
  studentId: string;
  instructorId: string;
  courseId: string;
}

interface GetConversationsParams {
  userId: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface GetConversationParams {
  conversationId: string;
  userId: string;
}

export const createConversation = async (data: CreateConversationData) => {
  try {
    const { studentId, instructorId, courseId } = data;

    const enrollment = await EnrollmentModel.findOne({
      user: studentId,
      course: courseId,
      status: { $in: ["active", "completed"] },
    });

    if (!enrollment) {
      return {
        success: false,
        message: "Student is not enrolled in this course",
      };
    }

    const course = await CourseModel.findOne({
      _id: courseId,
      instructor: instructorId,
    });

    if (!course) {
      return {
        success: false,
        message: "Instructor does not teach this course",
      };
    }

    const existingConversation = await ConversationModel.findOne({
      course: courseId,
      "participants.student": studentId,
      "participants.instructor": instructorId,
    });

    if (existingConversation) {
      return {
        success: true,
        data: existingConversation,
        message: "Conversation already exists",
      };
    }

    const conversation = new ConversationModel({
      participants: {
        student: studentId,
        instructor: instructorId,
      },
      courseId: courseId,
    });

    await conversation.save();

    const populatedConversation = await ConversationModel.findById(
      conversation._id
    )
      .populate({
        path: "participants.student",
        select: "firstName lastName email profilePicture",
      })
      .populate({
        path: "participants.instructor",
        select: "firstName lastName email profilePicture",
      })
      .populate({
        path: "courseId",
        select: "title thumbnail",
      })
      .populate({
        path: "lastMessage",
        select: "content senderId isRead createdAt",
      });

    return {
      success: true,
      data: populatedConversation,
      message: "Conversation created successfully",
    };
  } catch (error) {
    console.error("Error creating conversation:", error);
    return {
      success: false,
      message: "Failed to create conversation",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const getConversations = async (params: GetConversationsParams) => {
  try {
    const { userId, search, page = 1, limit = 50 } = params;

    const query: any = {
      $or: [
        { "participants.student": userId },
        { "participants.instructor": userId },
      ],
    };

    if (search) {
      const searchUsers = await UserModel.find({
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      const searchCourses = await CourseModel.find({
        title: { $regex: search, $options: "i" },
      }).select("_id");

      const userIds = searchUsers.map((user) => user._id);
      const courseIds = searchCourses.map((course) => course._id);

      query.$and = [
        query,
        {
          $or: [
            { "participants.student": { $in: userIds } },
            { "participants.instructor": { $in: userIds } },
            { course: { $in: courseIds } },
          ],
        },
      ];
    }

    const conversations = await ConversationModel.find(query)
      .populate({
        path: "participants.student",
        select: "firstName lastName email profilePicture",
      })
      .populate({
        path: "participants.instructor",
        select: "firstName lastName email profilePicture",
      })
      .populate({
        path: "course",
        select: "title thumbnail",
      })
      .populate({
        path: "lastMessage",
        select: "content senderId isRead createdAt",
      })
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await MessageModel.countDocuments({
          conversationId: conversation._id,
          senderId: { $ne: userId },
          isRead: false,
        });

        return {
          ...conversation.toObject(),
          unreadCount,
        };
      })
    );

    const total = await ConversationModel.countDocuments(query);

    return {
      success: true,
      data: {
        conversations: conversationsWithUnread,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return {
      success: false,
      message: "Failed to fetch conversations",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const getConversationById = async (params: GetConversationParams) => {
  try {
    const { conversationId, userId } = params;

    const conversation = await ConversationModel.findOne({
      _id: conversationId,
      $or: [
        { "participants.student": userId },
        { "participants.instructor": userId },
      ],
    })
      .populate({
        path: "participants.student",
        select: "firstName lastName email profilePicture",
      })
      .populate({
        path: "participants.instructor",
        select: "firstName lastName email profilePicture",
      })
      .populate({
        path: "course",
        select: "title thumbnail",
      })
      .populate({
        path: "lastMessage",
        select: "content senderId isRead createdAt",
      });

    if (!conversation) {
      return {
        success: false,
        message: "Conversation not found or access denied",
      };
    }

    // Calculate unread count
    const unreadCount = await MessageModel.countDocuments({
      conversationId: conversation._id,
      senderId: { $ne: userId },
      isRead: false,
    });

    return {
      success: true,
      data: {
        ...conversation.toObject(),
        unreadCount,
      },
    };
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return {
      success: false,
      message: "Failed to fetch conversation",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const deleteConversation = async (
  conversationId: string,
  userId: string
) => {
  try {
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

    await MessageModel.deleteMany({ conversationId });

    await ConversationModel.findByIdAndDelete(conversationId);

    return {
      success: true,
      message: "Conversation deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return {
      success: false,
      message: "Failed to delete conversation",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const markConversationAsRead = async (
  conversationId: string,
  userId: string
) => {
  try {
    const result = await MessageModel.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        isRead: false,
      },
      {
        $set: { isRead: true, readAt: new Date() },
      }
    );

    return {
      success: true,
      data: { modifiedCount: result.modifiedCount },
      message: "Messages marked as read",
    };
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    return {
      success: false,
      message: "Failed to mark conversation as read",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const findOrCreateConversation = async (
  data: CreateConversationData
) => {
  try {
    const { studentId, instructorId, courseId } = data;

    const existingConversation = await ConversationModel.findOne({
      course: courseId,
      "participants.student": studentId,
      "participants.instructor": instructorId,
    })
      .populate({
        path: "participants.student",
        select: "firstName lastName email profilePicture",
      })
      .populate({
        path: "participants.instructor",
        select: "firstName lastName email profilePicture",
      })
      .populate({
        path: "course",
        select: "title thumbnail",
      })
      .populate({
        path: "lastMessage",
        select: "content senderId isRead createdAt",
      });

    if (existingConversation) {
      return {
        success: true,
        data: existingConversation,
        isNew: false,
      };
    }

    const createResult = await createConversation(data);
    if (!createResult.success) {
      return createResult;
    }

    return {
      success: true,
      data: createResult.data,
      isNew: true,
    };
  } catch (error) {
    console.error("Error finding or creating conversation:", error);
    return {
      success: false,
      message: "Failed to find or create conversation",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

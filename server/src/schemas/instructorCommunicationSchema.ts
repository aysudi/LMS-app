import mongoose from "mongoose";

export enum MessageType {
  QUESTION = "question",
  SUPPORT = "support",
  FEEDBACK = "feedback",
  GENERAL = "general",
}

export enum MessageStatus {
  UNREAD = "unread",
  READ = "read",
  REPLIED = "replied",
  RESOLVED = "resolved",
}

const instructorCommunicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
    },
    type: {
      type: String,
      enum: Object.values(MessageType),
      default: MessageType.QUESTION,
    },
    status: {
      type: String,
      enum: Object.values(MessageStatus),
      default: MessageStatus.UNREAD,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    initialMessage: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    replies: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        message: {
          type: String,
          required: true,
          trim: true,
          maxlength: 2000,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        isInstructorReply: {
          type: Boolean,
          default: false,
        },
      },
    ],
    lastReplyAt: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

instructorCommunicationSchema.index({ instructor: 1, status: 1 });
instructorCommunicationSchema.index({ course: 1, status: 1 });
instructorCommunicationSchema.index({ student: 1, instructor: 1 });
instructorCommunicationSchema.index({ createdAt: -1 });

export default instructorCommunicationSchema;

import mongoose from "mongoose";

const courseMessageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      maxlength: [2000, "Message content cannot exceed 2000 characters"],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender ID is required"],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    editedAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseMessage",
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for better performance
courseMessageSchema.index({ course: 1, createdAt: -1 });
courseMessageSchema.index({ sender: 1, course: 1 });
courseMessageSchema.index({ course: 1, isDeleted: 1, createdAt: -1 });

// Index for finding unread messages
courseMessageSchema.index({ course: 1, "readBy.user": 1 });

export default courseMessageSchema;

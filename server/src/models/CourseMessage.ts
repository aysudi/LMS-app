import mongoose, { Document } from "mongoose";
import courseMessageSchema from "../schemas/courseMessageSchema.js";

export interface ICourseMessage extends Document {
  content: string;
  sender: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  messageType: "text" | "image" | "file";
  isRead: boolean;
  readBy: Array<{
    user: mongoose.Types.ObjectId;
    readAt: Date;
  }>;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  replyTo?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CourseMessage = mongoose.model<ICourseMessage>(
  "CourseMessage",
  courseMessageSchema
);

export default CourseMessage;

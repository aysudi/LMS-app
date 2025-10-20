import mongoose, { Document, Schema } from "mongoose";
import conversationSchema from "../schemas/conversationSchema";

export interface IConversation extends Document {
  participants: {
    student: mongoose.Types.ObjectId;
    instructor: mongoose.Types.ObjectId;
  };
  courseId: mongoose.Types.ObjectId;
  lastMessage?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const Conversation = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema
);

export default Conversation;

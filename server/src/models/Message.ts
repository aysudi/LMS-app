import mongoose, { Document, Schema } from "mongoose";
import messageSchema from "../schemas/messageSchema";

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  content: string;
  messageType: "text" | "image" | "file";
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const Message = mongoose.model<IMessage>("Message", messageSchema);

export default Message;

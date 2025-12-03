import { Document, Types } from "mongoose";

export enum MessageStatus {
  SENT = "sent",
  READ = "read",
  RESOLVED = "resolved",
}

export interface IStudentInstructorMessage extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  instructor: Types.ObjectId;
  course: Types.ObjectId;
  subject: string;
  content: string;
  status: MessageStatus;
  isStudentMessage: boolean; // true if sent by student, false if sent by instructor
  parentMessage?: Types.ObjectId; // for replies
  attachments?: {
    filename: string;
    url: string;
    size: number;
    mimeType: string;
  }[];
  readAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

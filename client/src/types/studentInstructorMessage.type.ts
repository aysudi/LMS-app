export enum MessageStatus {
  SENT = "sent",
  READ = "read",
  RESOLVED = "resolved",
}

export interface IStudentInstructorMessage {
  _id: string;
  student: {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
  instructor: {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
  course: {
    _id: string;
    title: string;
    thumbnail?: string;
  };
  subject: string;
  content: string;
  status: MessageStatus;
  isStudentMessage: boolean;
  parentMessage?: string;
  attachments: Array<{
    filename: string;
    url: string;
    size: number;
    mimeType: string;
  }>;
  readAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

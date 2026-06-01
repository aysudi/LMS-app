import mongoose from "mongoose";
import { IStudentInstructorMessage } from "../types/studentInstructorMessage.types.js";
import studentInstructorMessageSchema from "../schemas/studentInstructorMessageSchema.js";

const StudentInstructorMessage = mongoose.model<IStudentInstructorMessage>(
  "StudentInstructorMessage",
  studentInstructorMessageSchema,
);

export default StudentInstructorMessage;

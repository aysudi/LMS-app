import mongoose from "mongoose";
import { IStudentInstructorMessage } from "../types/studentInstructorMessage.types";
import studentInstructorMessageSchema from "../schemas/studentInstructorMessageSchema";

const StudentInstructorMessage = mongoose.model<IStudentInstructorMessage>(
  "StudentInstructorMessage",
  studentInstructorMessageSchema
);

export default StudentInstructorMessage;

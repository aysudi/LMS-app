import mongoose from "mongoose";
import studentInstructorMessageSchema from "../schemas/studentInstructorMessageSchema";
const StudentInstructorMessage = mongoose.model("StudentInstructorMessage", studentInstructorMessageSchema);
export default StudentInstructorMessage;

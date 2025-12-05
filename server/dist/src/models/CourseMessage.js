import mongoose from "mongoose";
import courseMessageSchema from "../schemas/courseMessageSchema.js";
const CourseMessage = mongoose.model("CourseMessage", courseMessageSchema);
export default CourseMessage;

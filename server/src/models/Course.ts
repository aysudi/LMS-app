import mongoose, { Document } from "mongoose";
import courseSchema from "../schemas/courseSchema.js";

const Course = mongoose.model("Course", courseSchema);

export default Course;

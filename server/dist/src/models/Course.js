import mongoose from "mongoose";
import courseSchema from "../schemas/courseSchema";
const Course = mongoose.model("Course", courseSchema);
export default Course;

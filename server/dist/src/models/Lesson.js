import mongoose from "mongoose";
import lessonSchema from "../schemas/lessonSchema";
const Lesson = mongoose.model("Lesson", lessonSchema);
export default Lesson;

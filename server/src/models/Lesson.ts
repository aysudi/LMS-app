import mongoose, { Document } from "mongoose";
import lessonSchema from "../schemas/lessonSchema.js";
import { ILesson } from "../types/lesson.types.js";

const Lesson = mongoose.model<ILesson>("Lesson", lessonSchema);

export default Lesson;
export type { ILesson };

import mongoose, { Document } from "mongoose";
import lessonSchema from "../schemas/lessonSchema";
import { ILesson } from "../types/lesson.types";

const Lesson = mongoose.model<ILesson>("Lesson", lessonSchema);

export default Lesson;
export type { ILesson };

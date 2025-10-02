import mongoose from "mongoose";
import questionSchema, { IQuestion } from "../schemas/questionSchema.js";

const Question = mongoose.model<IQuestion>("Question", questionSchema);

export default Question;

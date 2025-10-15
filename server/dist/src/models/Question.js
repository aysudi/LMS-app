import mongoose from "mongoose";
import questionSchema from "../schemas/questionSchema.js";
const Question = mongoose.model("Question", questionSchema);
export default Question;

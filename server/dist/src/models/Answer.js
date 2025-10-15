import mongoose from "mongoose";
import answerSchema from "../schemas/answerSchema.js";
const Answer = mongoose.model("Answer", answerSchema);
export default Answer;

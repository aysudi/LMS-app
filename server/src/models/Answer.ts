import mongoose from "mongoose";
import answerSchema, { IAnswer } from "../schemas/answerSchema.js";

const Answer = mongoose.model<IAnswer>("Answer", answerSchema);

export default Answer;

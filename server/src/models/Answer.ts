import mongoose from "mongoose";
import answerSchema, { IAnswer } from "../schemas/answerSchema";

const Answer = mongoose.model<IAnswer>("Answer", answerSchema);

export default Answer;

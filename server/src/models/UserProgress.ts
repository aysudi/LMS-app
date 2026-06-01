import mongoose, { Document } from "mongoose";
import userProgressSchema from "../schemas/userProgressSchema.js";

const UserProgress = mongoose.model("UserProgress", userProgressSchema);

export default UserProgress;

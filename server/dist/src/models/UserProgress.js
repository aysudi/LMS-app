import mongoose from "mongoose";
import userProgressSchema from "../schemas/userProgressSchema";
const UserProgress = mongoose.model("UserProgress", userProgressSchema);
export default UserProgress;

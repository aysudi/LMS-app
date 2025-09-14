import mongoose from "mongoose";
import userNoteSchema from "../schemas/userNoteSchema";
const UserNote = mongoose.model("UserNote", userNoteSchema);
export default UserNote;
